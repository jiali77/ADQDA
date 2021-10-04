var fontawesome = cQuery('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">');
cQuery(document.head).append(fontawesome);

//for insert rule from other webstrate
// if(cQuery('#main-style.css').length == 0){
//     let style = cQuery("<style></style>");
//     style[0].id = "main-style.css";
//     cQuery(document.head).append(style);
//     WPMv2.stripProtection(style[0]);
// }

if(cQuery('#themeDB').length == 0){
    let themeDB = cQuery("<div></div>");
    themeDB[0].id = "themeDB";
    cQuery(document.body).append(themeDB);
    WPMv2.stripProtection(themeDB[0]);
}

if(cQuery('#snippetDB').length == 0){
    let snippetDB = cQuery("<div></div>");
    snippetDB[0].id = "snippetDB";
    cQuery(document.body).append(snippetDB);
    WPMv2.stripProtection(snippetDB[0]);
}

if(cQuery('#pile').length == 0){
    let pile = cQuery('<div style="z-index: -1"></div>');
    pile[0].id = "pile";
    cQuery(document.body).append(pile);
    WPMv2.stripProtection(pile[0]);
}
