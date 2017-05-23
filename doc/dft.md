# DFT(Discrete Fourier Transform)

画像の横幅が \(M\) 、縦が \(N\) としたとき、二次元離散フーリエ変換は \(F(u,v)=\displaystyle{\sum_{x=0}^{M-1} \sum_{y=0}^{N-1} {f(x,y) \exp\left(-j 2\pi\left(\frac{ux}{M}+\frac{vy}{N}\right)\right)}}\) と定義されている。  

この式を変形すると、

\[
\begin{eqnarray*}
    F(u,v)
        &=& \displaystyle{
                \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} {f(x,y) e^{-j 2\pi \left(\frac{ux}{M}+\frac{vy}{N}\right)}}
            }\\
        &=& \displaystyle{
                \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} {f(x,y) e^{-j 2\pi \frac{ux}{M} } e^{-j 2\pi \frac{vy}{N}}}
            }\\
        &=& \displaystyle{
                \sum_{y=0}^{N-1} e^{-j 2\pi\frac{vy}{N}} \sum_{x=0}^{M-1} {f(x,y) e^{-j 2\pi\frac{ux}{M}}}
            }
\end{eqnarray*}
\]

となる。
したがって、各行毎に一次元離散フーリエ変換をして、各列毎に一次元離散フーリエ変換をするという手順によって二次元離散フーリエ変換を実装することができる。


## 計算時間の目安

このプログラムは高速フーリエ変換ではないので
計算量は \(O(n^2)\) となる。  
2.9GHz intel core i5-6267U,  
macOS Sierra 10.12.5,  
Google Chrome 58.0.3029.110 (64-bit)  
で実行すると、 \(512\times512\) ピクセルの画像で80秒程度、
 \(3840\times2160\) ピクセルの画像で4.5時間程度処理に時間がかかった。
