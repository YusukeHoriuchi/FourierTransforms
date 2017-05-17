# DFT(Discrete Fourier Transform)

連続の二次元フーリエ変換は \(F(u,v)=\displaystyle{\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}{f(x,y)e^{-j2\pi(ux+vy)}dxdy}}\) と定義されている。
離散では \(F(u,v)=\displaystyle{\sum_{x=0}^{M-1} \sum_{y=0}^{N-1} {f(x,y) \exp\left(-j 2\pi\left(\frac{ux}{M}+\frac{vy}{N}\right)\right)}}\) という式になる。
画像の横幅が \(M\) 、縦が \(N\) の画像である。行列で表すと \(N\times M\) 行列となる。
この式を変形すると、

\[
\begin{eqnarray*}
    F(u,v)
        &=& \frac{1}{N}
            \displaystyle{
                \sum_{x=0}^{N-1} \sum_{y=0}^{N-1} {f(x,y) \exp\left(-j \frac{2\pi}{N} (ux+vy)\right)}
            }\\
        &=& \frac{1}{N}
            \displaystyle{
                \sum_{x=0}^{N-1} \sum_{y=0}^{N-1} {f(x,y) e^{-j \frac{2\pi}{N} (ux+vy)}}
            }\\
        &=& \frac{1}{N}
            \displaystyle{
                \sum_{x=0}^{N-1} \sum_{y=0}^{N-1} {f(x,y) e^{-j \frac{2\pi}{N} ux} e^{-j \frac{2\pi}{N} vy}}
            }\\
        &=& \frac{1}{N}
            \displaystyle{
                \sum_{y=0}^{N-1} e^{-j \frac{2\pi}{N} vy} \sum_{x=0}^{N-1} {f(x,y) e^{-j \frac{2\pi}{N} ux}}
            }\\
        \Biggl( &=& \frac{1}{N}
            \displaystyle{
                \sum_{x=0}^{N-1} e^{-j \frac{2\pi}{N} ux} \sum_{y=0}^{N-1} {f(x,y) e^{-j \frac{2\pi}{N} vy}}
            } \Biggr)
\end{eqnarray*}
\]

このようになる。
したがって、各行毎にフーリエ変換して、各列毎にフーリエ変換をするという手順によって二次元フーリエ変換を実装することができる。

\[
\begin{eqnarray*}
    F(u,v)
        &=& \frac{1}{N}
            \displaystyle{
                \sum_{y=0}^{N-1} e^{-j \frac{2\pi}{N} vy} \sum_{x=0}^{N-1} {f(x,y) e^{-j \frac{2\pi}{N} ux}}
            } \\
        &=& \frac{1}{N}
            \displaystyle{
                \sum_{y=0}^{N-1} \left(
                    \cos\left(\frac{2\pi}{N}yv\right)-j\sin\left(\frac{2\pi}{N}yv\right)
                \right)
                \sum_{x=0}^{N-1} f(x,y) \left(
                    \cos\left(\frac{2\pi}{N}xu\right)-j\sin\left(\frac{2\pi}{N}xu\right)
                \right)
            }
\end{eqnarray*}
\]

x->,M  
y  
|  
v  
,  
N


\[
\begin{eqnarray*}
    G(a,b)
        &=& \displaystyle{
                \sum_{x=0}^{N-1} f(x,b) \left(
                    \cos\left(\frac{2\pi}{N}xa\right)-j\sin\left(\frac{2\pi}{N}xa\right)
                \right)
            }
\end{eqnarray*}
\]

\[
\begin{eqnarray*}
    F(u,v)
        &=& \displaystyle{
                \sum_{b=0}^{N-1} G(u,b) \left(
                    \cos\left(\frac{2\pi}{N}xa\right)-j\sin\left(\frac{2\pi}{N}xa\right)
                \right)
            }
\end{eqnarray*}
\]


## 2次元離散フーリエ変換

画像を行列によって以下のように定義する。

\[
    \mathbb{F} =
    \begin{pmatrix}
        f(0,0) & f(1,0) & \cdots & f(M-1,0) \\
        f(0,1) & f(1,1) & \cdots & f(M-1,1) \\
        \vdots & \vdots & \ddots & \vdots \\
        f(0,N-1) & f(1,N-1) & \cdots & f(M-1,N-1)
    \end{pmatrix}
\]
