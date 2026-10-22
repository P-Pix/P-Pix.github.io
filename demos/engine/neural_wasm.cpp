/*
 * Neural Boundary Lab - freestanding WebAssembly C++17 adaptation.
 * Port of numerical rules from nnviz Network.cpp + Trainer.cpp:
 * 2->8->1 / 2->8->8->1, tanh hidden, sigmoid output, cross-entropy,
 * backpropagation, 32-sample mini-batches, Xavier-range initialization.
 * JS handles synthetic dataset generation and passes labeled points via C ABI;
 * Math.{exp,tanh,log,sqrt} are imported from the browser instead of libm.
 * The source project's mt19937 random-seeding/shuffle is replaced with
 * deterministic xorshift32 to avoid a C++ STL runtime in GitHub Pages.
 */
#include <stdint.h>
#include <stddef.h>
extern "C" double js_exp(double);
extern "C" double js_tanh(double);
extern "C" double js_log(double);
extern "C" double js_sqrt(double);
namespace {
constexpr int MAXS=512,MAXN=8,MAXL=3,FIELD=120;
struct Point {double x,y;int label,test;};
Point samples[MAXS];int count=0;int epoch=0;int hidden=2;double rate=0.08;
struct Layer {int inputs,outputs;double w[MAXN][MAXN];double b[MAXN];};
Layer net[MAXL];
int layers=3,topology[4]={2,8,8,1};
uint32_t state=2026;
uint8_t field[FIELD*FIELD];
double probe[4][MAXN]={};
uint32_t rng(){uint32_t x=state;x^=x<<13;x^=x>>17;x^=x<<5;state=x;return x;}
double uniform(){return double(rng()>>8)/16777216.0;}
double sigmoid(double z){return z>=0?1.0/(1.0+js_exp(-z)) : js_exp(z)/(1.0+js_exp(z));}
void reset(int hiddenCount,double learning,uint32_t seed){
 hidden=(hiddenCount==1)?1:2;layers=hidden+1;topology[0]=2;topology[1]=8;
 if(hidden==1){topology[2]=1;topology[3]=0;}else{topology[2]=8;topology[3]=1;}
 if(learning>=0.00001&&learning<=1.0)rate=learning;
 state=seed?seed:2026;epoch=0;
 for(int l=0;l<layers;l++){
  Layer& a=net[l];a.inputs=topology[l];a.outputs=topology[l+1];
  double limit=js_sqrt(6.0/(a.inputs+a.outputs));
  for(int j=0;j<a.outputs;j++){
   a.b[j]=0;for(int i=0;i<a.inputs;i++)a.w[j][i]=(uniform()*2.0-1.0)*limit;
  }
 }
}
void forward(double x,double y,double activ[4][MAXN]){
 activ[0][0]=x;activ[0][1]=y;
 for(int l=0;l<layers;l++){
  const Layer& a=net[l];
  for(int j=0;j<a.outputs;j++){
   double z=a.b[j];for(int i=0;i<a.inputs;i++)z+=a.w[j][i]*activ[l][i];
   activ[l+1][j]=(l+1==layers)?sigmoid(z):js_tanh(z);
  }
 }
}
double predict(double x,double y){double a[4][MAXN]={};forward(x,y,a);return a[layers][0];}
void calculate(int split,double* loss,double* accuracy){double sum=0,ok=0,n=0;
 for(int k=0;k<count;k++){const Point&p=samples[k];if(p.test!=split)continue;
  double proba=predict(p.x,p.y);if(proba<1e-12)proba=1e-12;if(proba>1-1e-12)proba=1-1e-12;
  sum+=p.label?-js_log(proba):-js_log(1-proba);
  ok+=(proba>=0.5)==(p.label==1)?1:0;n++;
 }
 *loss=n?sum/n:0;*accuracy=n?ok/n:0;
}
void trainEpoch(){int indices[MAXS],num=0;
 for(int k=0;k<count;k++)if(!samples[k].test)indices[num++]=k;
 if(!num)return;
 for(int i=num-1;i>0;i--){int j=int(rng()%uint32_t(i+1));int t=indices[i];indices[i]=indices[j];indices[j]=t;}
 for(int begin=0;begin<num;begin+=32){
  int end=begin+32;if(end>num)end=num;
  double gw[MAXL][MAXN][MAXN]={};double gb[MAXL][MAXN]={};
  for(int k=begin;k<end;k++){
   const Point &p=samples[indices[k]];
   double a[4][MAXN]={},d[MAXL][MAXN]={};forward(p.x,p.y,a);
   d[layers-1][0]=a[layers][0]-double(p.label);
   for(int l=layers-1;l>=0;l--){const Layer& layer=net[l];
    for(int j=0;j<layer.outputs;j++){
     gb[l][j]+=d[l][j];
     for(int i=0;i<layer.inputs;i++)gw[l][j][i]+=d[l][j]*a[l][i];
    }
    if(l>0){for(int i=0;i<layer.inputs;i++){
     double weight=0;
     for(int j=0;j<layer.outputs;j++)weight+=layer.w[j][i]*d[l][j];
     double prev=a[l][i];d[l-1][i]=weight*(1-prev*prev);
    }}
   }
  }
  double scale=rate/double(end-begin);
  for(int l=0;l<layers;l++)for(int j=0;j<net[l].outputs;j++){
   net[l].b[j]-=scale*gb[l][j];
   for(int i=0;i<net[l].inputs;i++)net[l].w[j][i]-=scale*gw[l][j][i];
  }
 }
 epoch++;
}
}
extern "C" {
__attribute__((visibility("default"))) void nn_reset(int hiddenCount,double learning,int seed){reset(hiddenCount,learning,uint32_t(seed));}
__attribute__((visibility("default"))) void nn_clear_samples(){count=0;epoch=0;}
__attribute__((visibility("default"))) int nn_add_point(double x,double y,int label,int isTest){
 if(count>=MAXS||label<0||label>1||!(x>=-1.8&&x<=1.8&&y>=-1.8&&y<=1.8))return 0;
 samples[count++]={x,y,label,isTest?1:0};return count;
}
__attribute__((visibility("default"))) int nn_sample_count(){return count;}
__attribute__((visibility("default"))) void nn_train(int n){if(n<0)return;if(n>100)n=100;for(int i=0;i<n;i++)trainEpoch();}
__attribute__((visibility("default"))) int nn_epoch(){return epoch;}
__attribute__((visibility("default"))) double nn_predict(double x,double y){return predict(x,y);}
__attribute__((visibility("default"))) double nn_loss(int split){double loss=0,acc=0;calculate(split?1:0,&loss,&acc);return loss;}
__attribute__((visibility("default"))) double nn_accuracy(int split){double loss=0,acc=0;calculate(split?1:0,&loss,&acc);return acc;}
__attribute__((visibility("default"))) int nn_field_ptr(){return (int)(uintptr_t)field;}
__attribute__((visibility("default"))) int nn_compute_field(int resolution){
 if(resolution<2||resolution>FIELD)return 0;
 for(int y=0;y<resolution;y++)for(int x=0;x<resolution;x++){
  double xx=-1.8+3.6*(x+0.5)/resolution;
  double yy=1.8-3.6*(y+0.5)/resolution;
  double p=predict(xx,yy);int q=int(p*255+0.5);if(q<0)q=0;if(q>255)q=255;
  field[y*resolution+x]=uint8_t(q);
 }
 return resolution*resolution;
}
__attribute__((visibility("default"))) int nn_hidden_layers(){return hidden;}
__attribute__((visibility("default"))) int nn_layer_count(){return layers+1;}
__attribute__((visibility("default"))) int nn_layer_width(int index){return index>=0&&index<=layers?topology[index]:0;}
__attribute__((visibility("default"))) double nn_weight(int index,int out,int in){
 if(index<0||index>=layers||out<0||out>=net[index].outputs||in<0||in>=net[index].inputs)return 0;
 return net[index].w[out][in];
}
__attribute__((visibility("default"))) void nn_probe(double x,double y){forward(x,y,probe);}
__attribute__((visibility("default"))) int nn_probe_ptr(){return (int)(uintptr_t)probe;}
}
