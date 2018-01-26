// this file is auto generated.
// to random a cover image.

var covers = [['/images/covers/2511753621.jpg', '大南山'], ['/images/covers/2431442338.jpg', '珠海'], ['/images/covers/2431584680.jpg', '高雄'], ['/images/covers/2431442318.jpg', ''], ['/images/covers/2431442034.jpg', ''], ['/images/covers/2511755732.jpg', ''], ['/images/covers/2431584704.jpg', ''], ['/images/covers/2431442301.jpg', ''], ['/images/covers/2431441939.jpg', ''], ['/images/covers/2431441940.jpg', '长湴公园'], ['/images/covers/2431442130.jpg', ''], ['/images/covers/2431441843.jpg', '七星潭'], ['/images/covers/2511754082.jpg', '金地院'], ['/images/covers/2431442046.jpg', ''], ['/images/covers/2431584622.jpg', '']]

    var i = Math.floor(Math.random() * covers.length);
    
    document.getElementById("cover-image").setAttribute("src", covers[i][0])

    