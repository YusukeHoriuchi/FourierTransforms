document.addEventListener( 'DOMContentLoaded', function(){
  var elms = document.getElementsByTagName('katex')
  for(var i=0; i<elms.length; i++){
    var elm = elms[i];
    var tex = elm.innerHTML;
    tex = tex.replace(/&amp;/g,"&");
    tex = tex.replace(/&lt;/g,"<");
    tex = tex.replace(/&gt;/g,">");
    katex.render(tex,elm);
  }
}, false );
