
function millisToYear(m) {
    return m / 1000 / 365 / 86400 + 1970;
}
function yearToMillis(y) {
    return (y - 1970) * 365 * 24 * 3600 * 1000;
}
// Get the modal
var modal = document.getElementById("myModal");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
var modalTextElement = document.getElementById("modalText");
// When the user clicks the button, open the modal
var showModal = function(modalHtml) {
    modalTextElement.innerHTML = modalHtml;
    modal.style.display = "block";
};
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
};
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

var series = [
    {
        name: 'Life Expectancy',
        color: '#DB4437',
        yAxis: 0,
        showInLegend: true,
        data: [
            //[-10000, 28.5],
            [-1000, 28.5],
            [-500, 28.5],
            [1, 28.5],
            [100, 28.5],
            [200, 28.5],
            [300, 29],
            [400, 29],
            [500, 29],
            [600, 29],
            [700, 28.5],
            [800, 29],
            [900, 28.5],
            [1000, 28.5],
            [1050, null],
            [1100, 28.5],
            [1150, null],
            [1200, 28.5],
            [1250, null],
            [1300, null],
            [1350, null],
            [1400, 28.5],
            [1450, null],
            [1500, 28.5],
            [1550, 28.5],
            [1600, 29],
            [1650, 29],
            [1700, 29],
            [1710, 29],
            [1720, 28.5],
            [1730, 29],
            [1740, 29],
            [1750, 29],
            [1760, 29],
            [1770, 28.7],
            [1780, 28.7],
            [1790, 28.7],
            [1800, 28.5],
            [1810, 28.7],
            [1820, 29],
            [1830, 29],
            [1840, 29],
            [1850, 29.3],
            [1860, 29.3],
            [1870, 29.7],
            [1880, 30],
            [1890, 31],
            [1900, 32],
            [1910, 34.1],
            [1920, null],
            [1930, null],
            [1940, null],
            [1950, 45.7],
            [1960, 50.1],
            [1970, 60],
            [1980, 61.2],
            [1990, 65.2],
            [2000, 66.6]
        ]
    }, {
        name: 'GDP per capita',
        color: '#0F9D58',
        yAxis: 1,
        showInLegend: true,
        data: [
            [-1000, 127],
            [-500, 137],
            [1, 109],
            [100, null],
            [200, 98],
            [300, null],
            [400, 97],
            [500, 102],
            [600, 104],
            [700, 112],
            [800, 116],
            [900, 131],
            [1000, 133],
            [1050, null],
            [1100, 124],
            [1150, null],
            [1200, 104],
            [1250, 99],
            [1300, 89],
            [1350, null],
            [1400, 128],
            [1450, null],
            [1500, 138],
            [1550, null],
            [1600, 141],
            [1650, 150],
            [1700, 164],
            [1710, null],
            [1720, null],
            [1730, null],
            [1740, null],
            [1750, 178],
            [1760, null],
            [1770, null],
            [1780, null],
            [1790, null],
            [1800, 195],
            [1810, null],
            [1820, null],
            [1830, null],
            [1840, null],
            [1850, 300],
            [1860, null],
            [1870, null],
            [1880, null],
            [1890, null],
            [1900, 679],
            [1910, null],
            [1920, 956],
            [1930, 1134],
            [1940, 1356],
            [1950, 1622],
            [1960, 2270],
            [1970, 3282],
            [1980, 4231],
            [1990, 5204],
            [2000, 6539]
        ]
    }, {
        name: '% of People Living in a Democracy',
        color: '#4285F4',
        yAxis: 2,
        showInLegend: true,
        data: [
            [-1000, 1],
            [-500, null],
            [1, 1],
            [100, 1],
            [200, 1],
            [300, 1],
            [400, 1],
            [500, 1],
            [600, 1],
            [700, 1],
            [800, 1],
            [900, 1],
            [1000, 1],
            [1050, null],
            [1100, 1],
            [1150, null],
            [1200, 1],
            [1250, null],
            [1300, 1],
            [1350, null],
            [1400, 1],
            [1450, null],
            [1500, 1],
            [1550, null],
            [1600, 1],
            [1650, null],
            [1700, 1],
            [1710, null],
            [1720, null],
            [1730, null],
            [1740, null],
            [1750, null],
            [1760, null],
            [1770, null],
            [1780, null],
            [1790, 1],
            [1800, 1],
            [1810, 1],
            [1820, 1],
            [1830, 1],
            [1840, 2],
            [1850, 5],
            [1860, 3],
            [1870, 4],
            [1880, 9],
            [1890, 10],
            [1900, 12],
            [1910, 13],
            [1920, 20],
            [1930, 17],
            [1940, 9],
            [1950, 31],
            [1960, 39],
            [1970, 33],
            [1980, 35],
            [1990, 43],
            [2000, 56]
        ]
    }, {
        name: 'Books Published',
        color: '#F4B400',
        yAxis: 3,
        showInLegend: true,
        data: [
            [1500, 13.4480835465996],
            [1550, 51.0188652345717],
            [1600, 65.3160453808749],
            [1850, 124.020455465215],
            [1900, 143.79783744381],
            [1950, 259.70036108285],
            [1960, 360.421599327885],
            [1970, 797.6164797239],
            [1980, 700.411975707639],
            [1990, 942.387954827507],
            [2000, 1745.07212973763],
            [2001, 1601.90564333554],
            [2002, 1680.3023733088],
            [2003, 1710.20221301571],
            [2004, 1373.03845841665],
            [2005, 1710.03488549259],
            [2006, 1602.79421822641],
            [2007, 1835.7009856385],
            [2008, 2325.99115068294],
            [2009, 2114.85281364031],
        ]
/*        data: [
            [1470, 0],
            [1471, 0],
            [1472, 0],
            [1473, 0],
            [1474, 0],
            [1475, 0],
            [1476, 0],
            [1477, 14],
            [1478, 4],
            [1479, 7],
            [1480, 10.5],
            [1481, 14],
            [1482, 9],
            [1483, 34],
            [1484, 12],
            [1485, 9.5],
            [1486, 7],
            [1487, 8],
            [1488, 5],
            [1489, 9],
            [1490, 9],
            [1491, 9],
            [1492, 15],
            [1493, 15],
            [1494, 24],
            [1495, 33.5],
            [1496, 43],
            [1497, 32],
            [1498, 32],
            [1499, 45],
            [1500, 31.5],
            [1501, 18],
            [1502, 37],
            [1503, 28],
            [1504, 26],
            [1505, 32.5],
            [1506, 39],
            [1507, 34],
            [1508, 64],
            [1509, 64],
            [1510, 55],
            [1511, 46],
            [1512, 40],
            [1513, 38],
            [1514, 36],
            [1515, 45],
            [1516, 54],
            [1517, 67],
            [1518, 69],
            [1519, 55],
            [1520, 67],
            [1521, 79],
            [1522, 56],
            [1523, 62],
            [1524, 41],
            [1525, 64.5],
            [1526, 88],
            [1527, 99],
            [1528, 100],
            [1529, 73],
            [1530, 89],
            [1531, 105],
            [1532, 95],
            [1533, 119],
            [1534, 119],
            [1535, 104.5],
            [1536, 90],
            [1537, 84],
            [1538, 134],
            [1539, 84],
            [1540, 74.5],
            [1541, 65],
            [1542, 101],
            [1543, 112],
            [1544, 107],
            [1545, 117.5],
            [1546, 128],
            [1547, 146],
            [1548, 266],
            [1549, 178],
            [1550, 159],
            [1551, 140],
            [1552, 149],
            [1553, 182],
            [1554, 145],
            [1555, 170],
            [1556, 195],
            [1557, 115],
            [1558, 116],
            [1559, 123],
            [1560, 135.5],
            [1561, 148],
            [1562, 164],
            [1563, 157],
            [1564, 97],
            [1565, 143.5],
            [1566, 190],
            [1567, 171],
            [1568, 127],
            [1569, 160],
            [1570, 157.5],
            [1571, 155],
            [1572, 182],
            [1573, 182],
            [1574, 191],
            [1575, 184.5],
            [1576, 178],
            [1577, 215],
            [1578, 220],
            [1579, 269],
            [1580, 282],
            [1581, 295],
            [1582, 219],
            [1583, 260],
            [1584, 289],
            [1585, 266],
            [1586, 243],
            [1587, 250],
            [1588, 257],
            [1589, 309],
            [1590, 306.5],
            [1591, 304],
            [1592, 311],
            [1593, 216],
            [1594, 269],
            [1595, 295],
            [1596, 321],
            [1597, 288],
            [1598, 302],
            [1599, 338],
            [1600, 298.5],
            [1601, 259],
            [1602, 339],
            [1603, 449],
            [1604, 428],
            [1605, 419.5],
            [1606, 411],
            [1607, 468],
            [1608, 423],
            [1609, 478],
            [1610, 448.5],
            [1611, 419],
            [1612, 467],
            [1613, 528],
            [1614, 467],
            [1615, 480],
            [1616, 493],
            [1617, 448],
            [1618, 556],
            [1619, 521],
            [1620, 554.5],
            [1621, 588],
            [1622, 614],
            [1623, 585],
            [1624, 627],
            [1625, 543],
            [1626, 459],
            [1627, 500],
            [1628, 559],
            [1629, 531],
            [1630, 591],
            [1631, 651],
            [1632, 586],
            [1633, 669],
            [1634, 595],
            [1635, 572],
            [1636, 549],
            [1637, 599],
            [1638, 694],
            [1639, 627],
            [1640, 904],
            [1641, 2464],
            [1642, 4279],
            [1643, 2244],
            [1644, 1441],
            [1645, 1458.5],
            [1646, 1476],
            [1647, 2003],
            [1648, 2537],
            [1649, 1843],
            [1650, 1496.5],
            [1651, 1150],
            [1652, 1197],
            [1653, 1404],
            [1654, 1297],
            [1655, 1251],
            [1656, 1205],
            [1657, 1225],
            [1658, 1279],
            [1659, 2080],
            [1660, 1876],
            [1661, 1672],
            [1662, 1255],
            [1663, 1289],
            [1664, 1042],
            [1665, 882.5],
            [1666, 723],
            [1667, 741],
            [1668, 787],
            [1669, 793],
            [1670, 923.5],
            [1671, 1054],
            [1672, 1225],
            [1673, 1121],
            [1674, 1521],
            [1675, 1328.5],
            [1676, 1136],
            [1677, 1153],
            [1678, 1324],
            [1679, 2015],
            [1680, 2114.5],
            [1681, 2214],
            [1682, 2037],
            [1683, 1907],
            [1684, 1949],
            [1685, 1621.5],
            [1686, 1294],
            [1687, 1399],
            [1688, 2295],
            [1689, 2906],
            [1690, 2365],
            [1691, 1824],
            [1692, 1734],
            [1693, 1652],
            [1694, 1527],
            [1695, 1860.5],
            [1696, 2194],
            [1697, 1703],
            [1698, 1798],
            [1699, 1787],
            [1700, 2118.5],
            [1701, 2450],
            [1702, 2249],
            [1703, 1920],
            [1704, 2168],
            [1705, 2046],
            [1706, 1924],
            [1707, 2202],
            [1708, 2059],
            [1709, 2145],
            [1710, 2343.5],
            [1711, 2542],
            [1712, 2512],
            [1713, 2287],
            [1714, 2712],
            [1715, 2484.5],
            [1716, 2257],
            [1717, 2136],
            [1718, 2026],
            [1719, 2052],
            [1720, 2115.5],
            [1721, 2179],
            [1722, 1969],
            [1723, 1747],
            [1724, 1857],
            [1725, 1995.5],
            [1726, 2134],
            [1727, 2241],
            [1728, 2111],
            [1729, 2007],
            [1730, 1998],
            [1731, 1989],
            [1732, 2190],
            [1733, 2173],
            [1734, 1925],
            [1735, 2050],
            [1736, 2175],
            [1737, 1900],
            [1738, 1860],
            [1739, 2274],
            [1740, 2224],
            [1741, 2174],
            [1742, 2195],
            [1743, 2070],
            [1744, 2023],
            [1745, 2110],
            [1746, 2197],
            [1747, 2238],
            [1748, 2469],
            [1749, 2467],
            [1750, 2399.5],
            [1751, 2332],
            [1752, 2075],
            [1753, 2568],
            [1754, 2334],
            [1755, 2556.5],
            [1756, 2779],
            [1757, 2561],
            [1758, 2528],
            [1759, 2543],
            [1760, 2738.5],
            [1761, 2934],
            [1762, 2801],
            [1763, 2757],
            [1764, 2708],
            [1765, 2948.5],
            [1766, 3189],
            [1767, 3172],
            [1768, 3377],
            [1769, 3141],
            [1770, 3069],
            [1771, 2997],
            [1772, 3249],
            [1773, 3406],
            [1774, 4018],
            [1775, 4014],
            [1776, 4010],
            [1777, 4003],
            [1778, 3444],
            [1779, 3489],
            [1780, 3465.5],
            [1781, 3442],
            [1782, 3615],
            [1783, 4013],
            [1784, 4281],
            [1785, 4421],
            [1786, 4561],
            [1787, 4781],
            [1788, 5200],
            [1789, 5018],
            [1790, 5375.5],
            [1791, 5733],
            [1792, 6788],
            [1793, 6845],
            [1794, 7122],
            [1795, 7409],
            [1796, 7696],
            [1797, 7006],
            [1798, 7842],
            [1799, 7211]
        ],*/
    }
];
series = series.map(function (oneSeries) {
    oneSeries.data = oneSeries.data.map(function (onePoint) {
        onePoint[0] = yearToMillis(onePoint[0]);
        return onePoint;
    });
    return oneSeries;
});
function getConfig(scale){
    function getAnnotation(title, year, modalHtml, height){
        //if(scale !== 'logarithmic'){ height = height + 4; }
        var modalTitle = title;
        var calloutTitle = "<p style='text-align: center;'>"+title.replace(/ /g, "<br>")+"</p>";
        return {
            labelOptions: {
                //shape: 'connector',
                shape: 'callout',
                align: 'top',
                justify: true,
                crop: false,
                overflow:"justify",
                //className: 'climb',
                distance: 0,
                allowOverlap: true
            },
            labels: [{
                point: {
                    xAxis: 0,
                    yAxis: 0,
                    x: yearToMillis(year),
                    y: height
                },
                text: calloutTitle
            }],
            events:{
                click: function(e){
                    //window.open(url, "_blank");
                    showModal("<h1 style='text-align: center;'>"+modalTitle+"</h1>" +
                        modalHtml)
                }
            }
        }
    }
    return {
        chart: {
            zoomType: 'xy',
            height: 600
        },
        title: {
            text: 'Long-Term Trends in Human Well-Being'
        },
        subtitle: {
            text: '(' + scale + ' scale)'
        },
        tooltip: {
            xDateFormat: '%Y',
            formatter: function () {
                return this.points.reduce(function (s, point) {
                    //debugger
                    //console.log(point)
                    if (point.series.name.indexOf('GDP') > -1) {
                        return s + '<br/>$' + point.y + ' ' + point.series.name;
                    }
                    if (point.series.name.indexOf('Life') > -1) {
                        return s + '<br/>' + point.y + ' Year ' + point.series.name;
                    }
                    if (point.series.name.indexOf('Democracy') > -1) {
                        return s + '<br/>' + point.y + point.series.name;
                    }
                    return s + '<br/>' + point.y + " "+ point.series.name;
                }, '<b>' + millisToYear(this.x) + '</b>');
            },
            shared: true
        },
        plotOptions: {
            series: {
                connectNulls: true
            }
        },
        annotations: [
            getAnnotation("Little Ice Age", 1300,
                "<p>" +
                "As Europe moved out of the Medieval Warm Period and into the Little Ice Age, a decrease in " +
                "temperature and a great number of devastating floods disrupted harvests and caused mass famine. "+
                "</p>", 28),
            getAnnotation("Great Famine", 1317,
                "<p>" +
                "The cold and the rain proved to be particularly disastrous from 1315 to 1317 in which poor weather" +
                " interrupted the maturation of many grains and beans and flooding turned fields rocky and barren. "+
                "</p>", 29),
            getAnnotation("Hundred Years' War & Black Death", 1337,
                "<p>" +
                "The Hundred Years' War was a series of conflicts from 1337 to 1453, waged between the House of " +
                "Plantagenet, rulers of England and the French House of Valois, over the right to rule the Kingdom of France. "+
                "</p>"+
                "<h1>Black Death</h1>" +
                "<p>" +
                "The Black Death, also known as the Pestilence, the Great Bubonic Plague, the Great Plague or the " +
                "Plague, or less commonly the Great Mortality or the Black Plague, was the most devastating pandemic" +
                " recorded in human history, resulting in the deaths of up to 75-125 million people globally " +
                "(in Eurasia and North Africa), peaking in Europe from 1347 to 1351."+
                "</p>", 29),
            getAnnotation("Printing Press", 1470,
                "<p>" +
                "Through transmission of ideas, this printing press enabled the brain of one genius to " +
                "improve millions of crappier brains."+
                "</p>", 29),
            getAnnotation("Trigonometry", 1591,
                "<h2>1591: Francois Viete Invents Analytical Trigonometry</h2>" +
                "<p>" +
                "Viete's invention is essential to the study of physics and astronomy."+
                "</p>", 29),
            getAnnotation("Scientific Method", 1637,
                "<h2>1637: Rene Descartes Publishes His Discourse On Method</h2>" +
                "<p>" +
                "Descartes' work sets forth the principles of deductive reasoning as used in the modern scientific method."+
                "</p>", 29),
            getAnnotation("Gravity", 1687,
                "<h2>1687: Isaac Newton Publishes Philosophia Naturalis Principia Mathematica</h2>" +
                "<p>" +
                "Perhaps the most important event in the history of science, the Principia lays out Newton's " +
                "comprehensive model of the universe as organized according to the law of universal gravitation. " +
                "The Principia represents the integration of the works of all of the great astronomers who preceded " +
                "Newton, and remains the basis of modern physics and astronomy."+
                "</p>", 29),
            getAnnotation("Steam Engine", 1712,
                "<p>" +
                "The first practical steam engine is invented by Thomas Newcomen. Steam would become an important source of power for the Industrial Revolution."+
                "</p>", 29),
            getAnnotation("Industrial Revolution", 1750,
                "<p>" +
                "The First Industrial Revolution begins around 1760 in the textile industry in Great Britain. " +
                "Over the next decade, manufacturing will move from hand production in the home to machine production in factories."+
                "</p>", 29),
            getAnnotation("Cotton Gin", 1770,
                "<p>" +
                "Eli Whitney invents the cotton gin greatly increasing the productivity of processing cotton."+
                "</p>", 29),
            getAnnotation("Vaccines", 1799,
                "<div class=\"edit\"><div class=\"row\"><div class=\"col-md-12\"><img src=\"https://info.Proclinical.com/hubfs/vaccines.jpg\" alt=\"vaccines\" class=\"initial loading\" data-was-processed=\"true\"></div><div><br></div></div></div>" +
                "<p>" +
                "It is difficult to pinpoint when vaccines became an accepted practice, mostly because the journey to " +
                "discovery was long and complicated. Beginning with an attempt by Edward Jenner in 1796 to use" +
                " inoculations to tame the infamous smallpox virus, the usefulness and popularity of vaccines " +
                "grew very quickly. Throughout the 1800s and early 1900s, various vaccinations were created to combat" +
                " some of the world’s deadliest diseases, including smallpox, rabies, tuberculosis, and cholera." +
                " Over the course of 200 years, one of the deadliest diseases known to man – the small pox – was" +
                " wiped off the face of the earth. Today, vaccines continue to save millions of lives each year -" +
                " including jabs that protect against deadly flu strains and can help prevent some cancers."+
                "</p>", 29),
            getAnnotation("Steamboats", 1807,
                "<p>" +
                "Robert Fulton starts the first successful steamboat operation with his boat the Clermont."+
                "</p>", 29),
            getAnnotation("Trains", 1816,
                "<p>" +
                "1816 - The engineer George Stephenson patented the steam engine locomotive which would earn him the title of “Father of the Railways”. " +
                "</p>" +
                "<p>" +
                "1825 -The first passenger railway opens with Locomotion No.1 carrying passengers on a public line."+
                "</p>", 29),
            getAnnotation("Cells", 1838,
                "<p>" +
                "In 1838 Matthias Jakob Shleiden discovers that all plants are made of cells and, within the same year, " +
                "Theodor Schwann discovered that all animals are made of cells as well." +
                "</p>" +
                "<p>" +
                "Karl Theodor Ernst von Siebold suggests" +
                " the name 'Cell Theory' for the proposition that all animals are made of cells." +
                "</p>" +
                "<p>" +
                "In 1845, Karl Theodor Ernst von " +
                "Siebold discovered that microbes are also made of cells too, though not many cells, just one cell." +
                "</p>", 29),
            getAnnotation("Anesthesia", 1846,
                "<p>" +
                "Before the first use of a general anaesthetic in the mid-19th century, surgery was undertaken only as a last resort, with several patients opting for death rather than enduring the excruciating ordeal. Although there were countless earlier experiments with anaesthesia dating as far back to 4000 BC – William T. G. Morton made history in 1846 when he successfully used ether as an anaesthetic during surgery. Soon after, a faster-acting substance called chloroform became widely used, but was considered high-risk after several fatalities were reported. Over the 150 years since, safer anaesthetics have been developed, allowing millions of life-saving, painless operations to take place." +
                "</p>", 30),
            getAnnotation("Germs", 1860,
                "<p>Before the ‘germ’ theory came about, the widely believed theory was that disease was caused by ‘spontaneous generation’. In other words, physicians of the time thought that disease could appear out of thin air, rather than being air-borne or transferred via skin-to-skin contact. In 1861, French microbiologist Louis Pasteur proved through a simple experiment that infectious disease was a result of an invasion of specific microscopic organisms - also known as pathogens - into living hosts. This new understanding marked a significant turning point in how diseases were treated, controlled and prevented, helping to prevent devastating epidemics that were responsible for thousands of deaths every year, such as the plague, dysentery and typhoid fever.&nbsp;&nbsp;</p>",
                30),
            getAnnotation("Telephone", 1876,
                "<p>" +
                " Alexander Graham Bell invents the telephone." +
                "</p>", 30),
            getAnnotation("Light Bulb", 1879,
                "<p>" +
                "Thomas Edison invents the first practical incandescent light bulb. It will allow factories to remain open after dark." +
                "</p>", 34),
            getAnnotation("Power Plants", 1891,
                "<p>" +
                "The first modern electrical power station is completed to provide power to central London." +
                "</p>", 30),
            getAnnotation("Medical Imaging", 1895,
                "<div class=\"edit\"><img src=\"https://info.Proclinical.com/hubfs/X-ray.jpg\" alt=\"\" class=\"loading\" data-was-processed=\"true\"></div>"+
                "<p>" +
                "The first medical imaging machines were X-rays. The X-ray, a form of electromagnetic radiation, was ‘accidentally’ invented in 1895 by German physicist Wilhelm Conrad Rӧntgen when experimenting with electrical currents through glass cathode-ray tubes. The discovery transformed medicine overnight and by the following year, Glasgow hospital opened the world's very first radiology department.\n" +
                "\n" +
                "Ultrasound, although originally discovered many years before, began being used for medical diagnosis in 1955. This medical imaging device uses high frequency sound waves to create a digital image, and was no less than ground-breaking in terms of detecting pre-natal conditions and other pelvic and abdominal abnormalities. In 1967, the computed tomography (CT) scanner was created, which uses X-ray detectors and computers to diagnose many different types of disease, and has become a fundamental diagnostic tool in modern medicine.\n" +
                "\n" +
                "The next major medical imaging technology was discovered in 1973 when Paul Lauterbur produced the first magnetic resonance image (MRI). The nuclear magnetic resonance data creates detailed images within the body and is a crucial tool in detecting life-threatening conditions including tumours, cysts, damage to the brain and spinal cord and some heart and liver problems." +
                "</p>", 34),
            getAnnotation("Cars", 1908,
                "<p>" +
                "Henry Ford begins production on the Model T Ford. He uses the assembly line to build the first affordable automobile." +
                "</p>", 35),
            getAnnotation("Heart Surgery", 1923,
                "<p>" +
                "Eliot Cutler performs the world’s first successful heart valve surgery at the Peter Bent Brigham " +
                "Hospital, today part of Brigham and Women’s Hospital." +
                "</p>", 35),
            getAnnotation("Penicillin", 1928,
                "<div class=\"edit\"><img src=\"https://info.Proclinical.com/hubfs/antibiotics.jpg\" alt=\"antibiotics\" class=\"loading\" data-was-processed=\"true\"></div>"+
                "<p>" +
                "Alexander Fleming’s penicillin, the world’s first antibiotic, completely revolutionised the war against deadly bacteria. Famously, the Scottish biologist accidentally discovered the anti-bacterial ‘mould’ in a petri dish in 1928. However, Fleming’s incredible findings were not properly recognised until the 1940s, when they began being mass-produced by American drug companies for use in World War II. Two other scientists were responsible for the mass distribution of penicillin, Australian Howard Florey and Nazi-Germany refugee Ernst Chain, and their development of the substance ended up saving millions of future lives. Unfortunately, over the years certain bacterium have become increasingly resistant to antibiotics, leading to a world-wide crisis that calls for the pharmaceutical industry to develop new anti-bacterial treatments as soon as possible." +
                "</p>", 41),
            getAnnotation("Polio Treatment", 1929,
                "<p>" +
                "In a first, the newly developed Drinker Respirator (iron lung) saves a polio patient at Peter " +
                "Bent Brigham in collaboration with Children's Hospital Medical Center, today Boston Children’s " +
                "Hospital, and the Harvard School of Public Health." +
                "</p>", 45),
            getAnnotation("Organ Transplants", 1954,
                "<div class=\"edit\"><img src=\"https://info.Proclinical.com/hubfs/Transplant.jpg\" alt=\"\" class=\"loading\" data-was-processed=\"true\"></div>"+
                "<p>" +
                "In December 1954, the first successful kidney transplant was carried out by Dr Joseph Murray and Dr David Hume in Boston, USA. Despite many previous attempts in history, this was the first instance where the recipient of an organ transplant survived the operation. The turning point came when various technical issues were overcome, such as vascular anastomosis (the connection between two blood vessels), placement of the kidney and immune response. In 1963, the first lung transplant was carried out, followed by a pancreas/kidney in 1966, and liver and heart in 1967. Aside from saving thousands of lives in the years following, transplant procedures have also become increasingly innovative and complex, with doctors successfully completing the first hand transplant in 1998 and full-face transplant in 2010!" +
                "</p>", 42),
            getAnnotation("Antiviral Drugs", 1960,
                "<div class=\"edit\"><img src=\"https://info.Proclinical.com/hubfs/virus%202.jpg\" alt=\"\" class=\"loading\" data-was-processed=\"true\"></div>"+
                "<p>Terrible viruses such as small-pox, influenza and hepatitis have ravaged many human populations throughout history. Unlike the sweeping success of antibiotics in the late 1930s and 1940s, the development of antivirals did not really take off until the 1960s. This was mostly due to the structure of a virus, which was a core of genetic material surrounded by a protective protein coat that hides and reproduces inside a person’s cells. As the virus information is so protected, it was difficult to treat them without damaging the host cell. Over the years antivirals have improved significantly, and work by blocking the rapid reproduction of viral infections, and some can even stimulate the immune system to attack the virus. The development of effective antivirals has been significant in treating and controlling the spread of deadly virus outbreaks such as HIV/AIDS, Ebola and rabies. </p>",
                48),
            getAnnotation("Stem Cell Therapy", 1970,
                "<div class=\"edit\"><img src=\"https://info.Proclinical.com/hubfs/stem%20cells.jpg\" alt=\"\" class=\"loading\" data-was-processed=\"true\"></div>" +
                "<p>The incredible potential of stem cells was discovered in the late 1970s, when they were found inside human cord blood. Two specific characteristics make stem cells remarkable: they are unspecialised cells that can renew themselves through cell division even after being inactive, and under certain conditions can be used to make any type of human cell. This discovery has enormous potential and stem cell therapy has already been used to treat leukaemia and other blood disorders, as well as in bone marrow transplantation. Research is currently ongoing to use stem cells to treat spinal cord injuries and a number of neurological conditions such as Alzheimer’s, Parkinson’ and strokes. However, due to the ethical issues surrounding the&nbsp;<a href=\"https://www.eurostemcell.org/embryonic-stem-cell-research-ethical-dilemma\" target=\"_blank\">use of embryonic stem cells</a>, researchers are likely to face many obstacles when developing stem cell-based therapy.&nbsp;&nbsp;</p>" +
                48),
            getAnnotation("Immunotherapy", 1979,
                "<div class=\"edit\"><img src=\"https://info.Proclinical.com/hubfs/Artificial%20Intelligence.jpg\" alt=\"\" class=\"loading\" data-was-processed=\"true\"></div>"+
                "<p>Terrible viruses such as small-pox, influenza and hepatitis have ravaged many human populations throughout history. Unlike the sweeping success of antibiotics in the late 1930s and 1940s, the development of antivirals did not really take off until the 1960s. This was mostly due to the structure of a virus, which was a core of genetic material surrounded by a protective protein coat that hides and reproduces inside a person’s cells. As the virus information is so protected, it was difficult to treat them without damaging the host cell. Over the years antivirals have improved significantly, and work by blocking the rapid reproduction of viral infections, and some can even stimulate the immune system to attack the virus. The development of effective antivirals has been significant in treating and controlling the spread of deadly virus outbreaks such as HIV/AIDS, Ebola and rabies. </p>",
                55),
            // getAnnotation("Started Washing Our Damn Hands", 1905 ,
            //     "<p>" +
            //     "In 1905 Florence Nightingale discovered that being clean was essential in patient care and reducing " +
            //     "infectious diseases and earns an award for it. Joseph Lister developed a use of chemicals to help in " +
            //     "reducing the spreading of microbes and also wins an award for it, and William Stewart Halsted was one" +
            //     " of the very first to use gloves while performing surgery as a way to prevent the spread of microbes" +
            //     "</p>", 34),
        ],
        exporting: {
            csv: {
                dateFormat: '%Y'
            }
        },
        xAxis: {
            //min: Date.UTC(-10000, 1, 1),
            //max: Date.UTC(2014, 1, 1)
            ordinal: false,
        },
        yAxis: [
            { // 1st yAxis: Life expectancy at birth
                gridLineWidth: 0,
                type: scale,
                title: {
                    text: series[0].name,
                    style: {
                        color: series[0].color
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: series[0].color
                    }
                },
            }, { // 2nd yAxis: GDP/cap
                gridLineWidth: 0,
                type: scale,
                title: {
                    text: series[1].name,
                    style: {
                        color: series[1].color
                    }
                },
                labels: {
                    format: '${value}',
                    style: {
                        color: series[1].color
                    }
                },
            }, { // 6th yAxis: % living in a democracy
                gridLineWidth: 0,
                type: scale,
                title: {
                    text: series[2].name,
                    style: {
                        color: series[2].color
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: series[2].color
                    }
                },
            }, { // 6th yAxis: % living in a democracy
                gridLineWidth: 0,
                type: scale,
                title: {
                    text: series[3].name,
                    style: {
                        color: series[3].color
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: series[3].color
                    }
                },
            }
        ],
        legend: {
            enabled: true,
            align: 'left',
            verticalAlign: 'top',
            x: 0,
            y: 100,
            floating: true,
            layout: 'vertical',
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: series
    };
}
Highcharts.stockChart('container', getConfig('linear'));
Highcharts.stockChart('logarithmic-container', getConfig('logarithmic'));
