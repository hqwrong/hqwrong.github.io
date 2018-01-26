// this file is auto generated.
// to random a cover image.

var covers = [['/images/covers/2431442130.jpg', ''], ['/images/covers/2511753488.jpg', '2017.10  日本 京都 金地院'], ['/images/covers/2431442318.jpg', ''], ['/images/covers/2431584622.jpg', ''], ['/images/covers/2431441939.jpg', ''], ['/images/covers/2431584680.jpg', '2016 高雄.台湾'], ['/images/covers/2431584704.jpg', ''], ['/images/covers/2511753621.jpg', '2017  惠州 大南山'], ['/images/covers/2431442034.jpg', ''], ['/images/covers/2431442301.jpg', ''], ['/images/covers/2431442046.jpg', ''], ['/images/covers/2511753930.jpg', '日本 关西机场'], ['/images/covers/2431441940.jpg', '2016 长湴公园.广州'], ['/images/covers/2431441843.jpg', '2016 花莲 台湾  七星潭'], ['/images/covers/2431442338.jpg', '海洋世界.珠海']]

    var i = Math.floor(Math.random() * covers.length);
    
    document.getElementById("cover-image").setAttribute("src", covers[i][0])
    document.getElementById("cover-desc").textContent = covers[i][1]

    