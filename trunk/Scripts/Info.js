var ServerURL = "/ServerSide/";

function replaceNumbers(node) {
    if (node.nodeType == 3) //Text nodes only
        node.nodeValue = node.nodeValue.replace(/[0-9]/g, getArabicNumber);
}

function getArabicNumber(n) {
    return String.fromCharCode(1632 + parseInt(n, 10));
}

function walk(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walk(node, func);
        node = node.nextSibling;
    }
};

function PrintElem(elem) {
    Popup($(elem).html());
}

function Popup(data) {
//	var mywindow = window.open('', 'my div', 'height=400,width=600');
//	mywindow.document.write('<html><head><title>my div</title>');
    /*optional stylesheet*/ //mywindow.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
//	mywindow.document.write('</head><body >');
//	mywindow.document.write(data);
//	mywindow.document.write('</body></html>');
    window.print();
//	mywindow.print();
//	mywindow.close();

//	return true;
}

