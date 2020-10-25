var searchMenuDiv = document.getElementById("search-content");
var searchField = document.getElementById("search-toggle");
const resultdiv = document.getElementById("searchresults");
const noresultdiv = document.getElementById("nosearchresults");
var srcTitle = document.getElementById("srcTitle");
var srcDesc = document.getElementById("srcDesc");
var srcUrl = document.getElementById("srcUrl");
var srcAuthor = document.getElementById("srcAuthor");
var progressBar = document.getElementById("progress-bar");
document.onclick = check;
function check(e) {
    var target = e && e.target || event && event.srcElement;
    if (!checkParent(target, searchMenuDiv)) {
        if (checkParent(target, searchField)) {
            togglePanel()
        }
    }
}
function checkParent(t, elm) {
    while (t.parentNode) {
        if (t === elm) {
            return true
        }
        t = t.parentNode
    }
    return false
}
function showProgressBar() {
    if (progressBar.classList.contains("hidden")) {
        progressBar.classList.remove("hidden");
    }
}
function hideProgressBar() {
    setTimeout(function () {
        if (!progressBar.classList.contains("hidden")) {
            progressBar.classList.add("hidden");
        }
    }, 1000)
}
function togglePanel() {
    if (searchField.value === "") {
        //clearSearchResults()
    } else {
        resultdiv.classList.remove("hidden")
    }
}
document.onkeydown = function (evt) {
    showProgressBar();
    evt = evt || window.event;
    var isSlash;
    var isEscape;
    if ("key" in evt) {
        isSlash = evt.key === "/";
        isEscape = evt.key === "Escape" || evt.key === "Esc";
    } else {
        isSlash = evt.keyCode === 191 || evt.keyCode === 111;
        isEscape = evt.keyCode === 27;
    }
    if (isSlash && searchField !== document.activeElement && srcTitle !== document.activeElement &&
        srcDesc !== document.activeElement && srcUrl !== document.activeElement && srcAuthor !== document.activeElement) {
        evt.preventDefault();
        searchField.focus();
        togglePanel()
    }
    if (isEscape && searchField === document.activeElement) {
        searchField.blur();
        togglePanel()
    }
};
function clearSearchResults() {
    resultdiv.innerHTML = ""
}
var searchCache = {};
function search(query) {
    console.log(query);
    showProgressBar();
    function successHandler(results){
        hideProgressBar();
        updateSearchResults(results);
    }
    var useV6 = true;
    if(useV6){
        if(typeof searchCache[query] === "undefined"){
            variableSearchV6(query)
            searchCache[query] = [];
        } else{
            successHandler(searchCache[query])
        }
    }else{
        qm.variablesHelper.getFromLocalStorageOrApi({searchPhrase: query}).then(successHandler)
    }
}
function variableSearchV6(query) {
    const url = 'https://local.quantimo.do/api/v6/variables?q='+query+"&client_id="+clientId+"&cards=1";
    fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json())
        .then(function(body) {
            if(!body.data){
                throw body;
            }
            updateSearchResults(body.data)
        });
}
function updateSearchResults(result) {
    searchCache[query] = result;
    function generateLineSearchItem(one) {
        var url = one.url || one.link || "https://app.quantimo.do/datalab/variables/"+one.id;
        var title = one.title || one.displayName || one.name;
        var subTitle = one.subTitle || one.description || one.variableCategoryName;
        var image = one.imageUrl || one.image || one.avatar;
        var linkIcon = '<svg class="inline-block pl-2  h-4 fill-current text-brand" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.26 13a2 2 0 0 1 .01-2.01A3 3 0 0 0 9 5H5a3 3 0 0 0 0 6h.08a6.06 6.06 0 0 0 0 2H5A5 5 0 0 1 5 3h4a5 5 0 0 1 .26 10zm1.48-6a2 2 0 0 1-.01 2.01A3 3 0 0 0 11 15h4a3 3 0 0 0 0-6h-.08a6.06 6.06 0 0 0 0-2H15a5 5 0 0 1 0 10h-4a5 5 0 0 1-.26-10z"/></svg>';
        let searchitem =
            '<span class="p-4 border-b flex justify-between items-center group hover:bg-teal-100">' +
                '<a class="block flex-1 no-underline" href="' + url + '" target="_blank">' +
                    '<p class="font-bold text-sm text-indigo-600 hover:text-indigo-500">' +
                        '<span class="mr-2 text-teal-500">' + title + "</span>" +
                        '<span class="text-indigo-300 font-normal">' + subTitle + linkIcon + '</span>' +
                    '</p>' +
                    '<p class="md:block text-xs text-teal-600">' + url + '</p>' +
                    //'<p class="text-sm py-1">' + one.category + '</p>' +
                '</a>' +
                '<a href="' + url + '">' +
                    '<img class="md:block h-16 border-none" src="' + image + '" alt="">' +
                '</a>' +
            '</span>';
        if(one.htmlContent){
            searchitem += one.htmlContent;
        }
        return searchitem;
    }
    function imageCard(one) {
        // noinspection CssUnknownTarget
        const searchitem =
            '<div class="p-8">\n' +
            '  <div class="relative bg-black shadow-lg rounded-lg group h-64 w-64 flex justify-center items-center">\n' +
            '    <div class="rounded-lg h-full w-full absolute z-10 bg-cover bg-center hover:opacity-50 transition-all duration-500 ease-in-out" ' +
            'style="background-image: url(\''+one.url+'\')"'+
            '    </div>\n' +
            '    <p class="font-bold text-lg text-white absolute z-20 pointer-events-none">\n' +
            '      ' + one.name +
            '    </p>\n' +
            '    <p class="text-white absolute z-20 pointer-events-none">\n' +
            '      ' + one.category +
            '    </p>\n' +
            '  </div>\n' +
            '</div>'
        return searchitem;
    }
    if (result.length === 0) {
        if (query !== "") {
            //clearSearchResults();
            noresultdiv.classList.remove("hidden");
            searchMenuDiv.classList.remove("bg-white");
            searchMenuDiv.classList.remove("shadow-lg")
        } else {
            //clearSearchResults()
        }
    } else {
        resultdiv.innerHTML = "";
        noresultdiv.classList.add("hidden");
        searchMenuDiv.classList.add("bg-white");
        //searchMenuDiv.classList.add("shadow-lg");
        const maxLength = 100;
        const toShow = result.slice(0, maxLength);
        let imagesHtml = "";
        for (const key in toShow) {
            const one = result[key].item || result[key];
            const searchitem = generateLineSearchItem(one);
            imagesHtml += searchitem
        }
        if(imagesHtml !== ""){
            resultdiv.innerHTML = imagesHtml
        }
        resultdiv.style.display = ""
    }
    hideProgressBar();
}
searchField.addEventListener("search", function (event) {
    if (event.type === "search") {
        if (event.currentTarget.value === "") {
            clearSearchResults();
            searchMenuDiv.classList.remove("bg-white");
            searchMenuDiv.classList.remove("shadow-md")
        }
    }
});
function calcIframeHeight(offset) {
    var the_height = document.getElementById("iframecontent").contentWindow.document.body.scrollHeight;
    document.getElementById("iframecontent").height = the_height + offset
}
function goMobile() {
    document.getElementById("device").classList.add("w-1/3");
    document.getElementById("device").classList.remove("w-full");
    document.getElementById("device").classList.remove("w-2/3")
}
function goTablet() {
    document.getElementById("device").classList.add("w-2/3");
    document.getElementById("device").classList.remove("w-full");
    document.getElementById("device").classList.remove("w-1/3")
}
function goDesktop() {
    document.getElementById("device").classList.add("w-full");
    document.getElementById("device").classList.remove("w-1/3");
    document.getElementById("device").classList.remove("w-2/3")
}
function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges()
    } else if (document.selection) {
        document.selection.empty()
    }
}
function copyClipboard() {
    var elm = document.getElementById("code");
    var range;
    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(elm);
        range.select();
        document.execCommand("Copy");
        clearSelection();
        document.getElementById("copyButton").textContent = "Copied!";
        setTimeout(function () {
            document.getElementById("copyButton").textContent = "Copy Text"
        }, 1500)
    } else if (window.getSelection) {
        var selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(elm);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("Copy");
        clearSelection();
        document.getElementById("copyButton").textContent = "Copied!";
        setTimeout(function () {
            document.getElementById("copyButton").textContent = "Copy Text"
        }, 1500)
    }
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const query = qm.urlHelper.getParam('q', 'search')
const clientId = qm.getClientId();
search(query)
