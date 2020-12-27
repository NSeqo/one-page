
// 页面js

// echarts字体比例系数
var base = 2

// 测试环境接口数据走本地
var flag = false;

// 接口函数封装
function http(params) {
    if (flag) {
        params.callback && params.callback(); // 走本地
    } else {
        $.ajax({
            url: '/recyclePlatform/' + params.url,
            success: function (data) {
                params.callback && params.callback(data)
            }
        })
    }
}


// 右上角的关闭按钮
$('.full .close').click(function () {
    if (window.confirm('确认关闭当前页面？')) {
        window.close()
    }
})

// 四分类颜色  #42c7ff  #f4dc3d #41ee49  #f1505f



$(function () {

    // 数据接口相关

    // 天气接口
    function getWeatherForecast() {
        $.ajax({
            url: '/recyclePlatform/a/app/report/compDisNew/weather',
            success: function (data) {
                if (data.succeed) {
                    var high = data.high ? data.high.split('℃')[0] : '';
                    var low = data.low ? data.low.split('℃')[0] : '';
                    var val = '';
                    if (high !== '' && low !== '') {
                        val = low + ' ~ ' + high;
                    } else if (high !== '') {
                        val = high;
                    } else {
                        val = low;
                    }
                    val = val + '℃'
                    $(".head .weather .desc").text(data.weather);
                    $(".head .weather img").attr("src", "/recyclePlatform/static/images/weather/b_" + data.pic1 || "");
                    $(".head .weather .range").text(val);
                }
            }
        });
    }

    getWeatherForecast();


    // 头部 - 右侧时间
    function setDateTime() {
        var weekArray = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        var date = new Date()
        var yyyy = date.getFullYear()
        var mm = date.getMonth() + 1
        mm = mm < 10 ? ('0' + mm) : mm
        var dd = date.getDate()
        dd = dd < 10 ? ('0' + dd) : dd
        var hh = date.getHours()
        hh = hh < 10 ? ('0' + hh) : hh
        var min = date.getMinutes()
        min = min < 10 ? ('0' + min) : min
        var second = date.getSeconds();
        second = second < 10 ? ('0' + second) : second
        var weekday = date.getDay()
        weekday = weekArray[weekday]
        $('.head .time').html(yyyy + '年' + mm + '月' + dd + '日 ' + hh + ':' + min + weekday)
    }

    setDateTime();
    setInterval(setDateTime, 5000)



    // 地图
    http({
        url: "openness/api/v2/oneweb/map",
        callback(res) {
            mapCharts(res);
        }
    });

    function mapCharts(data) {

        // 四分类垃圾颜色
        function fourColors(type) {
            switch (type) {
                case '0100':
                    return '#42c7ff'
                case '0200':
                    return '#f4dc3d'
                case '0300':
                    return '#41ee49'
                case '0400':
                    return '#f1505f'
            }
        }

        // scatter 图标分类
        function scatter(type) {
            var symbol, symbolSize;
            type = type.toString();
            switch (type) {
                case '0':
                    //居民小区
                    symbol = 'image:///recyclePlatform/static/images/y4.png';
                    symbolSize = 20;
                    break;
                case '2':
                    //中
                    symbol = 'image:///recyclePlatform/static/images/y3.png';
                    symbolSize = 20;
                    break;
                case '3':
                    //码头
                    symbol = 'image:///recyclePlatform/static/images/y2.png';
                    symbolSize = 20
                    break;
                case '4':
                    //码头
                    symbol = 'image:///recyclePlatform/static/images/y2.png';
                    symbolSize = 20
                    break;
                case 3.14:
                    //大码头
                    symbol = 'image:///recyclePlatform/static/images/y2_b.png';
                    symbolSize = 30;
                    break;
                case 5.1:
                    //大处理厂
                    symbol = 'image:///recyclePlatform/static/images/y1_b.png';
                    symbolSize = 30;
                    break;
                case '9':
                    //可回收
                    symbol = 'image:///recyclePlatform/static/images/y1_re.png';
                    symbolSize = 20;
                    break;
                case '11':
                    //有毒有害
                    symbol = 'image:///recyclePlatform/static/images/y1_du.png';
                    symbolSize = 20;
                    break;
                default:
                    //处理厂
                    symbol = 'image:///recyclePlatform/static/images/y1.png';
                    symbolSize = 20;
            }
            return {
                symbol: symbol,
                symbolSize: symbolSize * base * .8
            }
        }

        $.get('/recyclePlatform/static/report/js/shanghai.json', function (geoJson) {

            // geoJson = geoJson;

            var node = data.node;
            var link = data.link;

            var scatter_data = node.map(function (item) {
                return $.extend({}, {
                    name: item.name,
                    value: [item.longitude, item.latitude],
                }, scatter(item.type))
            })
            var lines_data = []
            link.forEach(function (item) {
                var sourceObj = node.find(function (v) {
                    return v.name === item.source
                })
                var targetObj = node.find(function (v) {
                    return v.name === item.target
                })
                if (sourceObj && targetObj) {
                    lines_data.push({
                        coords: [
                            [sourceObj.longitude, sourceObj.latitude],
                            [targetObj.longitude, targetObj.latitude]
                        ],
                        lineStyle: {
                            color: fourColors(item.type)
                        }
                    })
                }

            })

            echarts.registerMap('SH', geoJson);
            mapInstance = echarts.init(document.getElementById('map'))
            var option = {
                tooltip: {
                    backgroundColor: "#9cc2f2",
                    textStyle: {
                        color: "#0f234e",
                        fontSize: 12 * base,
                    },
                    formatter: function (params) {
                        return params.name
                    }
                },
                geo: [
                    {
                        map: "SH",
                        roam: false,
                        //视角缩放比例
                        aspectScale: 1,
                        zoom: 1.1,
                        // center: [121.470192, 31.115188],
                        layoutCenter: ['50%', '40%'],
                        layoutSize: '100%',
                        scaleLimit: {
                            min: 1,
                        },
                        //显示文本样式
                        label: {
                            show: false
                        },
                        itemStyle: {
                            areaColor: '#0B336A',
                            borderColor: '#00CAFF',
                            borderWidth: 2,
                            shadowColor: '#032969',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 1
                        },
                        emphasis: {
                            label: {
                                show: false,
                            },
                            itemStyle: {
                                areaColor: '#2A93E4',
                                // shadowColor: 'rgba(0, 0, 0, 0.3)',
                                shadowBlur: 1
                            }
                        }
                    },

                    // 重影 叠层放置两个
                    {
                        zlevel: -1,
                        map: "SH",
                        roam: false,
                        //视角缩放比例
                        aspectScale: 1,
                        zoom: 1.1,
                        // center: [121.470192, 31.115188],
                        layoutCenter: ['50.1%', '41%'],
                        layoutSize: '100%',
                        scaleLimit: {
                            min: 1,
                        },
                        //显示文本样式
                        label: {
                            show: false
                        },
                        itemStyle: {
                            areaColor: '#0B336A',
                            borderColor: '#095486',
                            borderWidth: 2,
                            shadowColor: '#032969',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 1
                        },
                        emphasis: {
                            label: {
                                show: false,
                            },
                            itemStyle: {
                                areaColor: '#0B336A',
                                borderColor: '#095486',
                                borderWidth: 2,
                                shadowColor: '#032969',
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,
                                shadowBlur: 1
                            },
                        }
                    },

                    {
                        zlevel: -2,
                        map: "SH",
                        roam: false,
                        //视角缩放比例
                        aspectScale: 1,
                        zoom: 1.1,
                        // center: [121.470192, 31.115188],
                        layoutCenter: ['50.2%', '42%'],
                        layoutSize: '100%',
                        scaleLimit: {
                            min: 1,
                        },
                        //显示文本样式
                        label: {
                            show: false
                        },
                        itemStyle: {
                            areaColor: '#0B336A',
                            borderColor: '#0C325F',
                            borderWidth: 2,
                            shadowColor: '#032969',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 1
                        },
                        emphasis: {
                            label: {
                                show: false,
                            },
                            itemStyle: {
                                areaColor: '#0B336A',
                                borderColor: '#0C325F',
                                borderWidth: 2,
                                shadowColor: '#032969',
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,
                                shadowBlur: 1
                            },
                        }
                    },
                ],
                series: [
                    // {
                    //     type: "map",
                    //     map: 'SH',
                    //     // geoIndex: 0, // 所有的样式采用geo中配置
                    //     // center: [121.318414,28.049249],
                    //     zoom: 1,
                    //     data: geoJson.features.map(function (item) {
                    //         return {
                    //             name: item.properties.name
                    //         }
                    //     })
                    // },

                    {
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        data: scatter_data
                    },

                    {
                        type: 'lines',
                        effect: {
                            show: true,
                            period: 6,
                            trailLength: 0.1,
                            symbol: 'pin', //标记类型
                            symbolSize: 6
                        },
                        lineStyle: {
                            normal: {
                                width: 2, //线条宽度
                                opacity: 0.4,
                                curveness: .3 //尾迹线条曲直度
                            }
                        },

                        data: lines_data

                    }
                ]
            };

            mapInstance.setOption(option);

        });
    }


    // 上月各类垃圾占比
    function lastMonthProp(data) {
        data = data || []
        var charts = echarts.init(document.getElementById('last-month-prop'));
        var option = {
            tooltip: {
                show: false,
            },
            legend: {
                orient: 'vertical',
                right: 0,
                bottom: 0,
                itemGap:5,
                itemWidth:20,
                itemHeight:10,
                data: ['干垃圾', '湿垃圾', '可回', '有害'],
                textStyle: {
                    color: '#CDD6EC',
                    fontSize: 8 * base,
                    fontFamily: "Microsoft YaHei"
                }
            },
            series: [
                {
                    type: 'pie',
                    radius: ['50%', '65%'],
                    center: ['45%', '45%'],
                    avoidLabelOverlap: true,
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{d}%',
                        textStyle: {
                            fontSize: 13 * base
                        }
                    },
                    hoverAnimation: false,
                    labelLine: {
                        show: false,
                        length: 3,
                        length2: 3,
                    },
                    data: data
                }
            ]
        };
        charts.setOption(option);
    }


    /** 四分类清运量 */
    http({
        url: 'openness/api/v2/oneweb/clean',
        callback: function (res) {
            var dayData = res.day || [];
            var monData = res.mon || {};

            // 今日清运量
            $('.right .four-cates .content .left-part .box .item:nth-child(1) .num').html((dayData['dry'] || 0) + 't')
            $('.right .four-cates .content .left-part .box .item:nth-child(2) .num').html((dayData['wet'] || 0) + 't')
            $('.right .four-cates .content .left-part .box .item:nth-child(3) .num').html((dayData['recy'] || 0) + 't')
            $('.right .four-cates .content .left-part .box .item:nth-child(4) .num').html((dayData['harm'] || 0) + 't')

            // 上月垃圾分类占比
            lastMonthProp([
                { value: monData['dry'], name: '干垃圾', itemStyle: { color: '#D9AD2A' }, label: { color: '#00FDFA', fontFamily: "DIN Condensed" } },
                { value: monData['wet'], name: '湿垃圾', itemStyle: { color: '#CD6748' }, label: { color: '#00FDFA', fontFamily: "DIN Condensed" } },
                { value: monData['recy'], name: '可回', itemStyle: { color: '#3482D3' }, label: { color: '#00FDFA', fontFamily: "DIN Condensed" } },
                { value: monData['harm'], name: '有害', itemStyle: { color: '#D33C55' }, label: { color: '#00FDFA', fontFamily: "DIN Condensed" } },
            ]);

        }
    })
})  