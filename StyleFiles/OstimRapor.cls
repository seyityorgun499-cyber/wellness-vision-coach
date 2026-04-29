\NeedsTeXFormat{LaTeX2e}[1996/12/01]
\ProvidesClass{OstimRapor}
              [2024/03/23 v1.0
   LaTeX document class]
\def\baseclass{book}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{\baseclass}}
\def\@checkoptions#1#2{
  \edef\@curroptions{\@ptionlist{\@currname.\@currext}}
  \@tfor\@this:=#2\do{
    \@expandtwoargs\in@{,\@this,}{,\@curroptions,}
    \ifin@ \@tempswatrue \@break@tfor \fi}
 \let\@this\@empty
  \if@tempswa \else \PassOptionsToClass{#1}{\baseclass}\fi
}
\@checkoptions{11pt}{{10pt}{11pt}{12pt}}
\PassOptionsToClass{a4paper}{\baseclass}
\ProcessOptions\relax
\LoadClass{\baseclass}
\newcommand\bhrule{\typeout{------------------------------------------------------------------------------}}

\newcommand\Declaration[1]{

\setstretch{1.5}
\btypeout{Ethics}
%\addtotoc{Ethics}
\thispagestyle{plain}
%\null\vfil
%\vskip 60\p@
\begin{center}{\fontsize{14}{16.8} \bfseries ETHICS}\end{center}
%\vskip 60\p@
{\normalsize #1}
\vfil\vfil\null
%\cleardoublepage

}

\makeatletter
\let\c@lofdepth@undefined
\makeatother

\newcommand\btypeout[1]{\bhrule\typeout{\space #1}\bhrule}
\def\today{\ifcase\month\or
  January\or February\or March\or April\or May\or June\or
  July\or August\or September\or October\or November\or December\fi
  \space \number\year}
\usepackage{setspace}
\onehalfspacing
\setlength{\parindent}{0pt}
\setlength{\parskip}{2.0ex plus0.5ex minus0.2ex}
\usepackage{vmargin}

\RequirePackage[utf8]{inputenc} 
\setmarginsrb  { 3cm}  % left margin
                        { 2.5cm}  % top margin
                        { 2.5cm}  % right margin
                        { 2.5cm}  % bottom margin
                        {  20pt}  % head height
                        {0.25in}  % head sep
                        {   9pt}  % foot height
                        { 0.3in}  % foot sep
%----------------------------------------------------------------------------------------

\raggedbottom
\setlength{\topskip}{1\topskip \@plus 5\p@}
\doublehyphendemerits=10000       % No consecutive line hyphens.
\brokenpenalty=10000              % No broken words across columns/pages.
\widowpenalty=9999                % Almost no widows at bottom of page.
\clubpenalty=9999                 % Almost no orphans at top of page.
\interfootnotelinepenalty=9999    % Almost never break footnotes.
\usepackage{fancyhdr}
%\lhead[\rm\thepage]{\fancyplain{}{\sl{\rightmark}}}
%\rhead[\fancyplain{}{\sl{\leftmark}}]{\rm\thepage}
%\chead{}\lfoot{}\rfoot{}\cfoot{}
\pagestyle{fancy}

  \fancyhf{} % clear all header and footer fields
  \fancyfoot[C]{\footnotesize\thepage}
  \renewcommand{\headrulewidth}{0pt}      
  \renewcommand{\footrulewidth}{0pt}
  
  
%\renewcommand{\chaptermark}[1]{\btypeout{\thesection\space #1}\markboth{\@chapapp\ \thesection\ #1}{\@chapapp\ \thesection\ #1}}
%\renewcommand{\sectionmark}[1]{\btypeout{\thesection\space #1}}
%\renewcommand{\sectionmark}[1]{\thesection{\arabic{section}.}}
\usepackage{titlesec}

\titleformat*{\section}{\centering\normalfont\Large\bfseries}
\titlespacing*{\section} {0pt}{2.5ex plus 1ex minus .2ex}{1.3ex plus .2ex}
\titlespacing*{\subsection} {0pt}{2ex plus 1ex minus .2ex}{0.5ex plus .2ex}

\renewcommand{\sectionmark}[1]{}
\renewcommand{\subsectionmark}[1]{}
\renewcommand{\subsubsectionmark}[1]{}
\renewcommand{\paragraphmark}[1]{}
\usepackage{chngcntr}
%\renewcommand{\thechapter}{\arabic{chapter}.}
\renewcommand{\thesection}{\arabic{section}}
\counterwithin{figure}{section}
\counterwithin{table}{section}
\renewcommand{\thesubsection}{\thesection\arabic{subsection}.}
\renewcommand{\thesubsubsection}{\thesubsection\arabic{subsubsection}.}

\renewcommand{\theparagraph}{\thesubsubsection\arabic{paragraph}.}

%\renewcommand{\thefigure}{\arabic{chapter}.}
\renewcommand{\thefigure}{\thesection\arabic{figure}}
%\renewcommand{\thechapter}{\arabic{chapter}.}
\renewcommand{\thetable}{\thesection\arabic{table}}
%\usepackage{secdot}
%\renewcommand{\theequation}{\arabic{equation}.}
\renewcommand{\theequation}{\arabic{equation}}
\renewcommand{\thesection}{\arabic{section}.}
%\renewcommand{\theappendix}{\theappendix\arabic{appendix}.}
%\renewcommand{\thechapter}{\arabic{appendix}.}
\usepackage{chngcntr}
\counterwithout{equation}{section}
%\counterwithin{figure}{section}
%\counterwithin{table}{section}
\def\cleardoublepage{\clearpage\if@twoside \ifodd\c@page\else
\hbox{}
\thispagestyle{empty}
\newpage
\if@twocolumn\hbox{}\newpage\fi\fi\fi}
\usepackage{amsmath,amsfonts,amssymb,amscd,amsthm,xspace}
\theoremstyle{plain}
\newtheorem{example}{Example}[chapter]
\newtheorem{theorem}{Theorem}[chapter]
\newtheorem{corollary}[theorem]{Corollary}
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{axiom}[theorem]{Axiom}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{Definition}
\theoremstyle{remark}
\newtheorem{remark}[theorem]{Remark}
\usepackage[justification=RaggedRight,format=hang,small,labelsep=space, width=\textwidth]{caption}
\setlength{\captionmargin}{20pt}
\newcommand{\fref}[1]{Figure~\ref{#1}}
\newcommand{\tref}[1]{Table~\ref{#1}}
\newcommand{\eref}[1]{Equation~\ref{#1}}
\newcommand{\cref}[1]{Chapter~\ref{#1}}
\newcommand{\sref}[1]{Section~\ref{#1}}
\newcommand{\aref}[1]{Appendix~\ref{#1}}
\renewcommand{\topfraction}{0.85}
\renewcommand{\bottomfraction}{.85}
\renewcommand{\textfraction}{0.1}
\renewcommand{\dbltopfraction}{.85}
\renewcommand{\floatpagefraction}{0.75}
\renewcommand{\dblfloatpagefraction}{.75}
\setcounter{topnumber}{9}
\setcounter{bottomnumber}{9}
\setcounter{totalnumber}{20}
\setcounter{dbltopnumber}{9}
\usepackage{graphicx}
\usepackage{epstopdf}
%\usepackage[scriptsize]{subfigure}
\usepackage{booktabs}
\usepackage{rotating}
\usepackage{listings}

\renewcommand{\rmdefault}{phv} % Arial
\renewcommand{\sfdefault}{phv} % Arial

\lstset{captionpos=b,
        frame=tb,
        basicstyle=\scriptsize\ttfamily,
        showstringspaces=false,
        keepspaces=true}
\lstdefinestyle{matlab} {
        language=Matlab,
        keywordstyle=\color{blue},
        commentstyle=\color[rgb]{0.13,0.55,0.13}\em,
        stringstyle=\color[rgb]{0.7,0,0} }
\usepackage[pdfpagemode={UseOutlines},bookmarks=true,bookmarksopen=true,
   bookmarksopenlevel=0,bookmarksnumbered=true,hypertexnames=false,
   colorlinks,linkcolor={black},citecolor={black},urlcolor={black},
   pdfstartview={FitV},unicode,breaklinks=true]{hyperref}
\pdfstringdefDisableCommands{
   \let\\\space
}


\usepackage{titletoc}

\usepackage{tocloft}

\renewcommand{\cftbeforechapskip}{0\baselineskip}        % allow spacing after each chapter/section entry
\renewcommand{\contentsname}{İÇİNDEKİLER}
\renewcommand{\cfttoctitlefont}{\hfill\large\bfseries}
\renewcommand{\cftaftertoctitle}{\hfill}
\renewcommand{\cftbeforetoctitleskip}{-0.5in} % title vertical location
\renewcommand{\cfttoctitlefont}{\hfill\large\bf}
\renewcommand{\cftaftertoctitleskip}{1\baselineskip}% 
\renewcommand{\cftchapfont}{\normalfont}
\renewcommand{\cftchapleader}{\cftdotfill{\cftchapdotsep}}
%\renewcommand\cftchapafterpnum{\vskip1.5pt}
%\renewcommand\cftsecafterpnum{\vskip1.5pt}
%\renewcommand\cftsecindent{\setlength{}{1pt}}
\renewcommand*{\l@section}{\@dottedtocline{1}{0em}{1.2em}}
\renewcommand*{\l@subsection}{\@dottedtocline{1}{1.2em}{2em}}
\renewcommand*{\l@subsubsection}{\@dottedtocline{1}{2.2em}{3em}}
\renewcommand*{\l@paragraph}{\@dottedtocline{1}{3.7em}{3.5em}}
%\renewcommand{\cftchapdotsep}{1} 
\renewcommand{\cftsecdotsep}{1} 
%\renewcommand{\@pnumwidth}{1em} \renewcommand{\@tocrmarg}{4em}
\renewcommand{\@dotsep}{1}
\renewcommand{\cftchapfont}{\normalfont}
\renewcommand{\cftsecfont}{
\normalfont
}
\renewcommand\cftsecfont{\normalfont}
\renewcommand\cftsecpagefont{\normalfont}
\renewcommand{\cftsecleader}{\cftdotfill{\cftsecdotsep}}
\renewcommand\cftsecdotsep{\cftdot}
\renewcommand\cftsubsecdotsep{\cftdot}
\renewcommand{\cftchapfont}{\normalfont}
\renewcommand{\cftchappagefont}{\normalfont}

\cftsetindents{section}{0in}{0.5in}

\addtocontents{toc}{~\hfill\underline{\textbf{Sayfa}}\par}
\addtocontents{lof}{~\hfill\underline{\textbf{Sayfa}}\par}
\addtocontents{lot}{~\hfill\underline{\textbf{Sayfa}}\par}

\addtocounter{secnumdepth}{2}
\setcounter{tocdepth}{6}
\newcounter{dummy}
\newcommand\addtotoc[1]{
\refstepcounter{dummy}
%\addcontentsline{toc}{chapter}{#1}}





% List of Figures

\renewcommand{\listfigurename}{ŞEKİLLER LİSTESİ}
\renewcommand{\cftloftitlefont}{\hfill\large\bfseries}
\renewcommand{\cftafterloftitle}{\hfill}
\renewcommand{\cftbeforeloftitleskip}{-0.5in} 
\renewcommand{\cftloftitlefont}{\hfill\large\bf}
\renewcommand{\cftdotsep}{1}

%\renewcommand{\cftafterloftitleskip}{0.5\baselineskip}

\renewcommand{\@dotsep}{10000}


% List of Tables

\renewcommand{\listtablename}{TABLOLAR LİSTESİ}
\renewcommand{\cftlottitlefont}{\hfill\large\bfseries}
\renewcommand{\cftafterlottitle}{\hfill}
\renewcommand{\cftbeforelottitleskip}{-0.25in} 
\renewcommand{\cftlottitlefont}{\hfill\large\bf}
\renewcommand{\cftafterlottitleskip}{1.0\baselineskip} 
\renewcommand{\@dotsep}{1}



\addcontentsline{toc}{section}{#1}}


\usepackage{tocloft}

\renewcommand{\cftfigpresnum}{\figurename\enspace}
%\renewcommand{\cftfigaftersnum}{.}
\newlength{\mylen}
\settowidth{\mylen}{\cftfigpresnum\cftfigaftersnum}
\addtolength{\cftfignumwidth}{\mylen}

\renewcommand{\cfttabpresnum}{\tablename\enspace}
%\renewcommand{\cftfigaftersnum}{.}
%\newlength{\mylen}
\settowidth{\mylen}{\cfttabpresnum\cfttabaftersnum}
\addtolength{\cfttabnumwidth}{\mylen}






\renewcommand\listoffigures{
\btypeout{List of Figures}
\addtotoc{\textbf{FIGURES}}
\begin{spacing}{1}{
    \setlength{\parskip}{1pt}
    \if@twocolumn
      \@restonecoltrue\onecolumn
    \else
      \@restonecolfalse
    \fi
    \section*{\large\listfigurename
      \@mkboth{\MakeUppercase\listfigurename}
              {\MakeUppercase\listfigurename}}
    \@starttoc{lof}
    \if@restonecol\twocolumn\fi
    \cleardoublepage
}\end{spacing}
}


\renewcommand\listoftables{
\btypeout{List of Tables}
\addtotoc{\textbf{TABLES}}
\begin{spacing}{1}{
    \setlength{\parskip}{1pt}
    \if@twocolumn
      \@restonecoltrue\onecolumn
    \else
      \@restonecolfalse
    \fi
    \section*{\large\listtablename
      \@mkboth{
          \MakeUppercase\listtablename}{\MakeUppercase\listtablename}}
    \@starttoc{lot}
    \if@restonecol\twocolumn\fi
    \cleardoublepage
}\end{spacing}
}



\newcommand\listsymbolname{\large{\centerline{SİMGELER ve KISALTMALAR}}}
\usepackage{longtable}
\newcommand\listofsymbols[2]{
\btypeout{\listsymbolname}
\addtotoc{SİMGELER ve KISALTMALAR}

    \section*{\listsymbolname
      \@mkboth{
          \MakeUppercase\listsymbolname}{\MakeUppercase\listsymbolname}}
\begin{longtable}[c]{#1}#2\end{longtable}\par
    \cleardoublepage
}






\newcommand\acknowledgements[1]{
\btypeout{ACKNOWLEDGEMENTS}
\addtotoc{ACKNOWLEDGEMENTS}
\thispagestyle{plain}
\fancyfoot[C]{\footnotesize \thepage} 
\begin{center}{\fontsize{14}{16.8}\bf{ACKNOWLEDGEMENTS} \par}\end{center}
{\normalsize #1}
\vfil\vfil\null
\clearpage
}


