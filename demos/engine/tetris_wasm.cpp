/*
 * Browser adaptation of TetrisAutoCPP/src/core/{Pieces,Game}.cpp and
 * src/ai/AutoPlayer.cpp (provided source snapshot, October 2026).
 * Freestanding C++17. No SDL, POSIX socket or libc++: explicit C ABI for WASM.
 * Preserves 10x20 board, canonical rotations, 7-bag MT19937, scoring,
 * collision/hold/gravity and Dellacherie weights. Browser AI is 2-ply,
 * whereas native AutoPlayer searches 3-ply (documented). LAN is not ported.
 */
#include <stdint.h>

namespace {
constexpr int W=10,H=20;
struct Cell {int x,y;};
struct Piece {int type,rotation,x,y;};
struct Shape {Cell cell[4]; int width,height;};
Shape forms[8][4]; int rotations[8]; bool formsReady=false;
uint8_t board[200],view[200];
Piece active{};
int bag[28],bagSize=0,queue[20],queueSize=0;
int hold=0,canHold=1,over=0,score=0,lines=0,level=1,pieces=0,tetrises=0,gravity=0;
uint32_t mt[624]; int mtIndex=624;
const Cell initial[7][4]={
 {{0,1},{1,1},{2,1},{3,1}},
 {{0,0},{0,1},{1,1},{2,1}},
 {{2,0},{0,1},{1,1},{2,1}},
 {{1,0},{2,0},{1,1},{2,1}},
 {{1,0},{2,0},{0,1},{1,1}},
 {{1,0},{0,1},{1,1},{2,1}},
 {{0,0},{1,0},{1,1},{2,1}}
};
void seedRng(uint32_t seed){mt[0]=seed;for(int i=1;i<624;i++)mt[i]=1812433253U*(mt[i-1]^(mt[i-1]>>30))+uint32_t(i);mtIndex=624;}
uint32_t random32(){
 if(mtIndex>=624){for(int i=0;i<624;i++){
  uint32_t y=(mt[i]&0x80000000U)|(mt[(i+1)%624]&0x7fffffffU);
  mt[i]=mt[(i+397)%624]^(y>>1)^((y&1U)?0x9908b0dfU:0);
 }mtIndex=0;}
 uint32_t y=mt[mtIndex++];y^=y>>11;y^=(y<<7)&0x9d2c5680U;y^=(y<<15)&0xefc60000U;y^=y>>18;return y;
}
void normalize(Shape& s){int minx=999,miny=999;
 for(auto c:s.cell){if(c.x<minx)minx=c.x;if(c.y<miny)miny=c.y;}
 for(auto& c:s.cell){c.x-=minx;c.y-=miny;}
 for(int i=0;i<4;i++)for(int j=i+1;j<4;j++)if(s.cell[j].y<s.cell[i].y||(s.cell[j].y==s.cell[i].y&&s.cell[j].x<s.cell[i].x)){
  Cell t=s.cell[j];s.cell[j]=s.cell[i];s.cell[i]=t;}
 s.width=0;s.height=0;for(auto c:s.cell){if(c.x+1>s.width)s.width=c.x+1;if(c.y+1>s.height)s.height=c.y+1;}
}
void initForms(){if(formsReady)return;for(int t=1;t<=7;t++){
 Shape current{};for(int i=0;i<4;i++)current.cell[i]=initial[t-1][i];normalize(current);
 int count=0;
 for(int r=0;r<4;r++){
  bool duplicate=false;for(int k=0;k<count;k++){bool same=true;for(int i=0;i<4;i++)if(forms[t][k].cell[i].x!=current.cell[i].x||forms[t][k].cell[i].y!=current.cell[i].y)same=false;if(same)duplicate=true;}
  if(!duplicate)forms[t][count++]=current;
  Shape rotated{};for(int i=0;i<4;i++)rotated.cell[i]={current.cell[i].y,-current.cell[i].x};normalize(rotated);current=rotated;
 } rotations[t]=count;
}formsReady=true;}
void fillBag(){int types[7]={1,2,3,4,5,6,7};for(int i=6;i>0;i--){int j=int(random32()%uint32_t(i+1));int tmp=types[i];types[i]=types[j];types[j]=tmp;}
 for(int t:types)bag[bagSize++]=t;
}
int draw(){if(bagSize<7)fillBag();int t=bag[0];for(int i=1;i<bagSize;i++)bag[i-1]=bag[i];bagSize--;return t;}
void ensureQueue(){while(queueSize<9)queue[queueSize++]=draw();}
int getNext(){ensureQueue();int t=queue[0];for(int i=1;i<queueSize;i++)queue[i-1]=queue[i];queueSize--;ensureQueue();return t;}
bool collision(const uint8_t* cells,Piece p){if(p.type<1||p.type>7||p.rotation<0||p.rotation>=rotations[p.type])return true;
 for(auto c:forms[p.type][p.rotation].cell){int x=p.x+c.x,y=p.y+c.y;
  if(x<0||x>=W||y>=H)return true;
  if(y>=0&&cells[y*W+x])return true;
 }return false;}
void spawn(){int t=getNext();active={t,0,(W-forms[t][0].width)/2,-1};canHold=1;pieces++;if(collision(board,active))over=1;}
int drop(const uint8_t* cells,Piece p){if(collision(cells,p))return -1000;while(!collision(cells,{p.type,p.rotation,p.x,p.y+1}))p.y++;return p.y;}
void clearRows(uint8_t* cells,int* clearedRows=nullptr){int dst=H-1;uint8_t output[200]={};int count=0;
 for(int y=H-1;y>=0;y--){bool full=true;for(int x=0;x<W;x++)if(!cells[y*W+x])full=false;
  if(full){count++;if(clearedRows)clearedRows[y]=1;}else{for(int x=0;x<W;x++)output[dst*W+x]=cells[y*W+x];dst--;}}
 for(int i=0;i<200;i++)cells[i]=output[i];if(clearedRows)clearedRows[H]=count;
}
void lock(){auto shape=forms[active.type][active.rotation];for(auto c:shape.cell){int y=active.y+c.y,x=active.x+c.x;
 if(y<0){over=1;return;}board[y*W+x]=uint8_t(active.type);}
 int marked[21]={};clearRows(board,marked);int removed=marked[H];
 if(removed){const int scores[5]={0,100,300,500,800};score+=scores[removed]*level;lines+=removed;if(removed==4)tetrises++;level=1+lines/10;}
 spawn();gravity=0;
}
bool soft(bool manual){Piece p=active;p.y++;if(!collision(board,p)){active=p;if(manual)score++;return true;}lock();return false;}
bool hard(bool manual){int d=drop(board,active)-active.y;if(d<0)return false;active.y+=d;if(manual)score+=d*2;lock();return true;}
bool rotate(int direction){if(rotations[active.type]==1)return true;int r=(active.rotation+rotations[active.type]+direction)%rotations[active.type];for(int dx=0;dx<5;dx++){Piece p={active.type,r,active.x+(dx==0?0:dx==1?-1:dx==2?1:dx==3?-2:2),active.y};if(!collision(board,p)){active=p;return true;}}return false;}
void reset(uint32_t seed){initForms();seedRng(seed);for(auto& cell:board)cell=0;bagSize=queueSize=0;hold=0;canHold=1;over=0;score=lines=pieces=tetrises=gravity=0;level=1;ensureQueue();spawn();}

struct Candidate {double value;int rot,x,y;bool valid;};
// Reproduces the original weighted board evaluation (browser depth=2).
// Candidate includes eroded piece cells and landing-height measurements.
double scoreBoard(const uint8_t* cells,int cleared,int eroded,double landing){
 int heights[W]={},holes=0,rowTrans=0,colTrans=0,wells=0,total=0,peak=0,bump=0;
 for(int x=0;x<W;x++){bool seen=false;for(int y=0;y<H;y++){
  bool full=cells[y*W+x]!=0;if(full&&!seen){heights[x]=H-y;seen=true;}else if(!full&&seen)holes++;
 }}
 for(int x=0;x<W;x++){total+=heights[x];if(heights[x]>peak)peak=heights[x];if(x+1<W){int diff=heights[x]-heights[x+1];bump+=diff<0?-diff:diff;}}
 for(int y=0;y<H;y++){bool prev=true;for(int x=0;x<W;x++){bool occ=cells[y*W+x]!=0;if(occ!=prev)rowTrans++;prev=occ;}if(!prev)rowTrans++;}
 for(int x=0;x<W;x++){bool prev=true;for(int y=0;y<H;y++){bool occ=cells[y*W+x]!=0;if(occ!=prev)colTrans++;prev=occ;}if(!prev)colTrans++;}
 for(int x=0;x<W;x++){int depth=0;for(int y=0;y<H;y++){
  bool left=x==0||cells[y*W+x-1]!=0,right=x==W-1||cells[y*W+x+1]!=0;
  if(!cells[y*W+x]&&left&&right)wells+=++depth;else depth=0;
 }}
 double v=-4.500158825082766*landing+3.4181268101392694*eroded
  -3.2178882868487753*rowTrans-9.348695305445199*colTrans
  -7.899265427351652*holes-3.3855972247263626*wells;
 v+=1.8*cleared*cleared-0.18*total-0.24*bump;
 if(peak>=16)v-=(peak-15)*18.0;if(peak>=19)v-=200.0;return v;
}
bool candidateBoard(const uint8_t* from,int type,int r,int x,int* yOut,uint8_t* output,int* cleared,int* eroded,double* landing){
 Piece p={type,r,x,-4};int y=drop(from,p);if(y==-1000)return false;
 auto s=forms[type][r];for(auto c:s.cell)if(y+c.y<0)return false;
 for(int i=0;i<200;i++)output[i]=from[i];for(auto c:s.cell)output[(y+c.y)*W+(x+c.x)]=uint8_t(type);
 int marks[21]={};clearRows(output,marks);int n=0;
 for(auto c:s.cell)if(marks[y+c.y])n++;
 *eroded=n*marks[H];*cleared=marks[H];*yOut=y;
 double average=0;for(auto c:s.cell)average+=y+c.y;*landing=H-average/4;return true;
}
Candidate bestFor(const uint8_t* input,int type,int next,int depth){
 Candidate best={-1e15,0,0,0,false};
 for(int r=0;r<rotations[type];r++)for(int x=0;x<=W-forms[type][r].width;x++){
  uint8_t candidate[200];int y=0,c=0,e=0;double landing=0;
  if(!candidateBoard(input,type,r,x,&y,candidate,&c,&e,&landing))continue;
  double v=scoreBoard(candidate,c,e,landing);
  if(depth>1&&next>=1&&next<=7){Candidate future=bestFor(candidate,next,0,1);if(future.valid)v+=0.64*future.value;}
  if(!best.valid||v>best.value)best={v,r,x,y,true};
 }
 return best;
}
}
extern "C" {
__attribute__((visibility("default"))) void tg_reset(int seed){reset(uint32_t(seed));}
__attribute__((visibility("default"))) int tg_act(int action){
 if(over)return 0;switch(action){
 case 0:if(!collision(board,{active.type,active.rotation,active.x-1,active.y})){active.x--;return 1;}return 0;
 case 1:if(!collision(board,{active.type,active.rotation,active.x+1,active.y})){active.x++;return 1;}return 0;
 case 2:return rotate(1);
 case 3:return rotate(-1);
 case 4:return soft(true);
 case 5:return hard(true);
 case 6:if(!canHold)return 0;{
   int previous=hold;hold=active.type;
   if(previous){active={previous,0,(W-forms[previous][0].width)/2,-1};if(collision(board,active))over=1;}
   else spawn();canHold=0;return 1;}
 default:return 0;
 }}
__attribute__((visibility("default"))) void tg_tick(int ms){if(over||ms<=0)return;gravity+=(ms>1000?1000:ms);int interval=820-(level-1)*65;if(interval<85)interval=85;while(gravity>=interval&&!over){gravity-=interval;soft(false);}}
__attribute__((visibility("default"))) int tg_ai(){if(over)return 0;Candidate move=bestFor(board,active.type,queue[0],2);if(!move.valid){over=1;return 0;}active={active.type,move.rot,move.x,move.y};lock();return 1;}
__attribute__((visibility("default"))) int tg_board_ptr(){return (int)(uintptr_t)board;}
__attribute__((visibility("default"))) int tg_view_ptr(){
 for(int i=0;i<200;i++)view[i]=board[i];
 if(!over){int ghostY=drop(board,active);if(ghostY!=-1000){for(auto c:forms[active.type][active.rotation].cell){int x=active.x+c.x,y=ghostY+c.y;if(y>=0&&y<H&&!view[y*W+x])view[y*W+x]=uint8_t(active.type+7);}}
 for(auto c:forms[active.type][active.rotation].cell){int x=active.x+c.x,y=active.y+c.y;if(y>=0&&y<H)view[y*W+x]=uint8_t(active.type);}}
 return (int)(uintptr_t)view;
}
__attribute__((visibility("default"))) int tg_score(){return score;}
__attribute__((visibility("default"))) int tg_lines(){return lines;}
__attribute__((visibility("default"))) int tg_level(){return level;}
__attribute__((visibility("default"))) int tg_pieces(){return pieces;}
__attribute__((visibility("default"))) int tg_game_over(){return over;}
__attribute__((visibility("default"))) int tg_hold(){return hold;}
__attribute__((visibility("default"))) int tg_can_hold(){return canHold;}
__attribute__((visibility("default"))) int tg_next(int index){return index>=0&&index<queueSize?queue[index]:0;}
__attribute__((visibility("default"))) int tg_current(){return active.type;}
__attribute__((visibility("default"))) int tg_rotations(int type){initForms();return type>=1&&type<=7?rotations[type]:0;}
}
