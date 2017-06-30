var capture = function(){
    var replace_all = function(str, find, replace) { return str.replace(new RegExp(find, 'g'), replace); };
    var esc = function (text) { return replace_all(replace_all(replace_all(encodeURIComponent(text),"[(]",escape("(")),"[)]",escape(")")),"[']",escape("'")); };
    var selection = window.getSelection().toString();

    var uri = 'org-protocol://capture?template=b&url=' + encodeURIComponent(location.href) + '&title=' + esc(document.title) ;

    console.log("Capturing the following URI with org-protocol:", uri);

    location.href=uri;
};

capture();
