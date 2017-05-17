module.exports = {
  filters : {


    unkopre_katex : function(block){
      block = block.replace(/\\\{/g,"^katex_c^");       // "\{"を一時的に置き換え->"^katex_c^"
      block = block.replace(/\\\}/g,"^katex_d^");

      block = block.replace(/eqnarray\*/g,"aligned");
      block = block.replace(/&=&/g,"&=");

      var match = / \\\(|\\\) |\\\[|\\\]/g;
      var list  = block.split(match);
      //console.log(list);
      var result = list[0];
      for(var i=1;i<list.length;i++){
        result += "^t^mp^katex^tm^p^";
        result += list[i];
        i++;
        result += "^t^mp^/katex^tm^p^";
        result += list[i];
      }

      return result;
    },

    unkopost_katex : function(block){
      block = "\n<article>" + block + "</article>";
      block = block.replace(/\^t\^mp\^/g,"<");
      block = block.replace(/\^tm\^p\^/g,">");
      block = block.replace(/\^katex_c\^/g,"\\{");
      block = block.replace(/\^katex_d\^/g,"\\}");
      block = block.replace(/\\\n/g,"\\\\\n");
      return block;
    },


    pre_katex : function(block){
      var match,
          fragments,
          i,
          tmpFragment;

      //インライン数式部分の処理
      match = / \\\(|\\\) /g;
      fragments = block.split(match);
      block = fragments[0];
      for(i=1;i<fragments.length;){
        block += "^^katex^begin^inline^^";
        tmpFragment = fragments[i].replace(/\\\\\n/g,"^^katex^newline^^");
        tmpFragment = tmpFragment.replace(/\\\{/g,"^^katex^start^bracket^^");
        tmpFragment = tmpFragment.replace(/\\\}/g,"^^katex^end^bracket^^");
        block += tmpFragment;
        i++;
        block += "^^katex^end^inline^^";
        block += fragments[i];
        i++;
      }

      //ブロック数式部分の処理
      match = /\\\[|\\\]/g;
      fragments = block.split(match);
      block = fragments[0];
      for(i=1;i<fragments.length;){
        block += "^^katex^begin^block^^";
        tmpFragment = fragments[i].replace(/\\\\\n/g,"^^katex^newline^^");
        tmpFragment = tmpFragment.replace(/\\\{/g,"^^katex^start^bracket^^");
        tmpFragment = tmpFragment.replace(/\\\}/g,"^^katex^end^bracket^^");
        block += tmpFragment;
        i++;
        block += "^^katex^end^block^^";
        block += fragments[i];
        i++;
      }



      return block;
    },

    post_katex : function(block){
      var match,
          fragments,
          i,
          tmpFragment;

      //インライン数式部分の処理
      match = /\^\^katex\^begin\^inline\^\^|\^\^katex\^end\^inline\^\^/g;
      fragments = block.split(match);
      //console.log(fragments);
      block = fragments[0];
      for(i=1;i<fragments.length;){
        block += "<katex>";
        tmpFragment = fragments[i].replace(/eqnarray\*|eqnarray|equation|equation\*/g,"aligned");
        tmpFragment = tmpFragment.replace(/&amp;/g,"&");
        tmpFragment = tmpFragment.replace(/&=&/g,"&=");
        tmpFragment = tmpFragment.replace(/&lt;/g,"<");
        tmpFragment = tmpFragment.replace(/&gt;/g,">");
        tmpFragment = tmpFragment.replace(/\^\^katex\^start\^bracket\^\^/g,"\\{");
        tmpFragment = tmpFragment.replace(/\^\^katex\^end\^bracket\^\^/g,"\\}");
        block += tmpFragment;
        i++;
        block += "</katex>";
        block += fragments[i];
        i++;
      }

      //ブロック数式部分の処理
      match = /\^\^katex\^begin\^block\^\^|\^\^katex\^end\^block\^\^/g;
      fragments = block.split(match);
      block = fragments[0];
      for(i=1;i<fragments.length;){
        block += "<katex class=\"katex_block\">";
        tmpFragment = fragments[i].replace(/eqnarray\*|eqnarray|equation|equation\*/g,"aligned");
        tmpFragment = tmpFragment.replace(/\^\^katex\^newline\^\^/g,"\\\\\n");
        tmpFragment = tmpFragment.replace(/&amp;/g,"&");
        tmpFragment = tmpFragment.replace(/&=&/g,"&=");
        tmpFragment = tmpFragment.replace(/&lt;/g,"<");
        tmpFragment = tmpFragment.replace(/&gt;/g,">");
        tmpFragment = tmpFragment.replace(/\^\^katex\^start\^bracket\^\^/g,"\\{");
        tmpFragment = tmpFragment.replace(/\^\^katex\^end\^bracket\^\^/g,"\\}");
        block += tmpFragment;
        i++;
        block += "</katex>";
        block += fragments[i];
        i++;
      }

      block = block.replace(/<h1>/g,"<h1 class=\"article_title\">");
      block = block.replace(/<h2>/g,"<h2 class=\"article_title\">");
      block = block.replace(/<h3>/g,"<h3 class=\"article_title\">");


      block = "\n<article>\n" + block + "</article>";
      return block;
    }

  }
};


/*

中間処理が必要なもの

 \( -> ^^katex^begin^inline^^ -> <pre class="katex_inline">
\)  -> ^^katex^end^inline^^ </pre>
\[ -> ^^katex^begin^block^^ -> <pre class="katex_block">
\] -> ^^katex^end^block^^ -> </pre>

TeXコードの中身
\\改行 -> ^^katex^newline^^ -> //改行
\{  -> ^^katex^start^bracket^^ -> \{
\}  -> ^^katex^end^bracket^^  -> \}


中間処理が必要ないもの

TeXコードの中身
eqnarray*,eqnarray,equation,equation* -> aligned
&=& -> &=
&amp; -> &
&lt; -> <
&gt; -> >


*/
