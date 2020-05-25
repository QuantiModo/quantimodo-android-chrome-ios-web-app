function filterSearchMenu() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('menu-search-input');
    filter = input.value.toUpperCase();
    ul = document.getElementById("searchable-menu-list");
    if(filter && filter.length){
        ul.style.display = "";
    } else {
        ul.style.display = "none";
        return;
    }
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
