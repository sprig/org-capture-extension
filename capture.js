var capture = function(){
    var replace_all = function(str, find, replace) { return str.replace(new RegExp(find, 'g'), replace); };
    var esc = function (text) { return replace_all(replace_all(replace_all(encodeURIComponent(text),"[(]",escape("(")),"[)]",escape(")")),"[']",escape("'")); };
    var selection = window.getSelection().toString();

    var uri = 'org-protocol://';
    if (selection != "")
    {
	uri += 'capture:/p/';
    }
    else
    {
	uri += 'capture:/L/'
    };

    uri += encodeURIComponent(location.href) + '/' +
	encodeURIComponent(document.title);

    if (selection != "") { uri += '/' +	esc(selection); };


    console.log("Capturing the following URI with org-protocol:", uri);

    return uri;
};

capture();
