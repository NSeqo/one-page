
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

var alertLine = '#c12937';	// 警戒线颜色


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
                itemGap: 5,
                itemWidth: 20,
                itemHeight: 10,
                data: ['干垃圾', '湿垃圾', '可回', '有害'],
                textStyle: {
                    color: '#CDD6EC',
                    fontSize: 8 * base,
                    fontFamily: "Microsoft YaHei"
                },
                icon: 'rect'
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


    // 趋势分析
    function gbCategories(data) {
        var myChart = echarts.init(document.getElementById('four-trend-chart'));
        var options = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#091E60',
                textStyle: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei'
                },
            },
            color: ['#38B9F1', '#A07DFC'],
            legend: {
                // show: false,
                data: ['实际量', '预测量'],
                right: '3%',
                top: '3%',
                itemWidth: 20,
                itemHeight: 10,
                textStyle: {
                    color: '#fff',
                    fontSize: 8 * base,
                    fontFamily: 'Microsoft YaHei'
                },
                icon: 'rect'
            },
            grid: {
                top: '15%',
                left: '3%',
                right: '5%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                nameTextStyle: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#3281D2',
                        width: 2
                    },

                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                data: data.map(function (v) {
                    return v.time
                })
            },
            yAxis: {
                name: "(t)",
                nameTextStyle: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#3281D2',
                        width: 2
                    },
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#232D5E'
                    }
                }
            },
            series: [
                {
                    name: '实际量',
                    type: 'line',
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#38B9F1' // 0% 处的颜色
                            }, {
                                offset: 1, color: 'transparent' // 100% 处的颜色
                            }],
                        },
                    },
                    // color:'#38B9F1',
                    smooth: true,
                    symbol: "none",
                    data: data.map(function (v) {
                        return v.weight1
                    })
                },
                {
                    name: '预测量',
                    type: 'line',
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#41AE60' // 0% 处的颜色
                            }, {
                                offset: 1, color: 'transparent' // 100% 处的颜色
                            }],
                        }
                    },
                    color: '#41AE60',
                    smooth: true,
                    symbol: "none",
                    data: data.map(function (v) {
                        return v.weight2
                    })
                },
            ]
        };
        myChart.setOption(options);

        // 点击事件
        myChart.on('click', function (params) {
            console.log('params', params); // componentType: "markPoint",
            if (params.componentType === 'markPoint') {
                //标记点x轴的下标索引
                var xAxisIndex = params.data.coord[0];
            }
        })
    }


    /**趋势分析 tab切换 */
    $('.trend-ana .content .tbs').on('click', 'span', function () {
        // console.log(this) 
        if ($(this).hasClass('active')) return
        $(this).addClass('active')
        $(this).siblings().removeClass('active')

        var index = $(this).index(); // 0：干垃圾， 1：湿垃圾， 2：可回收， 4：有害

        http({
            url: `openness/api/v2/oneweb/clean/trend/1/0/${index}`,
            callback(res) {
                var data = res.data || [];
                if (data.length > 0) {
                    data = data.map(function (val) {
                        return {
                            ...val,
                            diff: (val.weight1 || 0) - (val.weight2 || 0)
                        }
                    })
                    gbCategories(data);
                }
            }
        })

    })
    $('.trend-ana .content .tbs span:first-child').trigger('click')



    /**末端排放 */
    function pieChart(data, unit) {
        data = data || [  /* 趋势图 */
            {
                name: '黎明',
                value: 2000
            },
            {
                name: '老港一期',
                value: 8000
            },
            {
                name: '天马',
                value: 7300
            },
            {
                name: '老港二期',
                value: 1600
            },
        ];
        var pieChartInstance = echarts.init(document.getElementById('pie-chart'));
        pieChartInstance.clear();
        var pie2color = ['#38b9f1', '#42c6b9'];
        var pie10color = ['#ca245a', '#cb6e1d', '#cbb418', '#83c025', '#009a3f', '#11a492', '#1799ce', '#0f74b8', '#a923b6', '#c72282'];
        var options = {
            series: [
                {
                    color: data.length > 2 ? pie10color : pie2color,
                    type: 'pie',
                    radius: data.length > 2 ? ['35%', '45%'] : [0, '65%'],
                    avoidLabelOverlap: true,
                    hoverAnimation: false,
                    center: data.length > 2 ? ['50%', '70%'] : ['50%', '50%'],
                    label: {
                        // alignTo:'edge',
                        // margin:'5%',
                        show: true,
                        color: '#fff',
                        formatter: [
                            '{b|{b}}',
                            '{hr|}',
                            '{c|{c}' + unit + '} {d|{d}%}'
                        ].join('\n'),
                        rich: {
                            b: {
                                align: 'center',
                                lineHeight: 8 * base,
                                // height: 18 * base,
                                color: '#fff',
                                fontSize: 8 * base,
                                fontFamily: "DIN Condensed"

                            },
                            hr: {
                                borderColor: '#fff',
                                width: '100%',
                                borderWidth: 1,
                                height: 0
                            },
                            c: {
                                lineHeight: 14 * base,
                                // height: 20 * base,
                                fontSize: 9 * base,
                                color: '#00CAFF',
                                fontFamily: "DIN Condensed"
                            },
                            d: {
                                lineHeight: 14 * base,
                                // height: 20 * base,
                                fontSize: 9 * base,
                                color: '#00CAFF',
                                fontFamily: "DIN Condensed",
                            },
                        }
                    },

                    labelLine: {
                        show: true,
                        // length1: 1,
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    data: data
                }
            ]
        };
        pieChartInstance.setOption(options);
    }

    function barChart(data) {
        data = data || [  /* 趋势图 */
            {
                "value2": "21088.92",
                "value3": "16800",
                "id": 1,
                "type": 8,
                "value": "一期"
            },
            {
                "value2": "17402.87",
                "value3": "16800",
                "id": 2,
                "type": 8,
                "value": "二期"
            },
            {
                "value2": "21819.66",
                "value3": "16800",
                "id": 3,
                "type": 8,
                "value": "天马"
            },
            {
                "value2": "22167.18",
                "value3": "16800",
                "id": 4,
                "type": 8,
                "value": "金山"
            },
            {
                "value2": "20774.37",
                "value3": "16800",
                "id": 5,
                "type": 8,
                "value": "御桥"
            },
            {
                "value2": "19366.78",
                "value3": "16800",
                "id": 6,
                "type": 8,
                "value": "黎明"
            },
            {
                "value2": "17662.14",
                "value3": "16800",
                "id": 7,
                "type": 8,
                "value": "嘉定"
            },

        ];

        // debugger;

        var markLineValue1 = 40;
        var markLineValue2 = 43;

        var barChartInstance = echarts.init(document.getElementById('bar-chart'));
        barChartInstance.clear();

        var options = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#091E60',
                textStyle: {
                    fontSize: 10 * base
                }
            },
            color: ['#38B9F1', '#A07DFC'],
            legend: {
                show: false,
                data: ['实际量', '指标量'],
                right: '3%',
                top: '3%',
                textStyle: {
                    color: '#fff',
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    padding: [2, 3, 0, 0]
                },
                icon: 'rect'
            },
            grid: {
                top: '15%',
                left: '3%',
                right: '5%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                nameTextStyle: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                type: 'category',
                boundaryGap: true,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#3281D2',
                        width:2
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                data: data.map(function (v) {
                    return v.name
                })
            },
            yAxis: {
                name: "(ug/m3)",
                nameTextStyle: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#3281D2',
                        width:2
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    fontSize: 10* base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: '#232D5E'
                    }
                }
            },
            series: [
                {
                    data: data.map(function (value, index, array) {
                        return {
                            name: value.name,
                            value: value.value,
                            itemStyle: {
                                barBorderRadius: 5,
                                color: value.value >= markLineValue2 ? '#DE1A4C' : value.value >= markLineValue1 ? '#F5C025' : '#18dad8'
                            }
                        }
                    }),

                    type: 'bar',
                    barWidth: 15 * base,
                    markLine: {
                        symbol: 'none',
                        label: {
                            show: false
                        },
                        data: [
                            {
                                yAxis: markLineValue1,
                                lineStyle: {
                                    color: '#F5C025',
                                    type: 'dashed'
                                },
                            },
                            {
                                yAxis: markLineValue2,
                                lineStyle: {
                                    color: alertLine,
                                    type: 'dashed'
                                },
                            }
                        ]
                    }
                },
            ]
        };
        barChartInstance.setOption(options);
    }

    // 电力和排放两个一级切换
    var emiss_first = true; // 两个标记量用来确定第一次点击调用函数
    var elec_first = true;
    $('.end-emission .switches').on('click', 'span', function () {
        if ($(this).hasClass('active')) return
        $(this).addClass('active')
        $(this).siblings().removeClass('active')

        var index = $(this).index()

        if (index === 0) {
            $('.end-emission .elec').hide()
            $('.end-emission .emiss').show()
            debugger;
            emiss_first && $('.end-emission .emiss .tbs span:first-child').trigger('click')
            emiss_first = false
        } else {
            $('.end-emission .elec').show()
            $('.end-emission .emiss').hide()
            elec_first && $('.end-emission .elec .tbs span:first-child').trigger('click')
            elec_first = false
        }

    })

    $('.end-emission .switches span:first-child').trigger('click');

    // 二级切换 电力，排放

    function render(type, data) {
        data = data.filter(function (val) {
            return val.type === type
        })
        var sum = data.reduce(function (acc, curr) {
            return acc + curr.value;
        }, 0);
        var unit = type == '发电量' ? '万度' : 'm³';
        $('.end-emission .elec-sum').show();
        $('.end-emission .elec-sum').html(
            `
        	总量：<span class="num">${sum.toFixed(2)}</span>${unit}
            `
        )
        pieChart(data, unit);
    }

    function render2(type, data) {
        data = data || [];
        data = data.filter(function (val) {
            return val.type == type
        })
        var sum = data.reduce(function (acc, curr) {
            return acc + curr.value;
        }, 0)

        $('.end-emission .avag-index').show()
        $('.end-emission .avag-index').html(
            `
        	平均指数：<span>${(sum / data.length).toFixed(0)}</span> 
            `
        )
        // //console.log('data', data);
        barChart(data);
    }

    function render3(type, data) {
        data = data || [];
        data = data.filter(function (val) {
            return val.type == type
        });
        // 发电总量
        $('.end-emission .elec-sum').hide();
        var pieChartInstance = echarts.init(document.getElementById('pie-chart'));
        var options = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#091E60',
                fontSize: 10 * base
            },
            color: ['#38B9F1', '#A07DFC'],
            grid: {
                top: '15%',
                left: '3%',
                right: '5%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: {
                nameTextStyle: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                type: 'category',
                boundaryGap: true,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#3281D2',
                        width: 2
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                data: data.map(function (v) {
                    return v.name
                })
            },
            yAxis: {
                name: "(t)",
                nameTextStyle: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#3281D2',
                        width: 2
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    fontSize: 10 * base,
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff',
                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: '#232D5E'
                    }
                }
            },
            series: [
                {
                    data: data.map(function (value, index, array) {
                        return {
                            name: value.name,
                            value: value.value,
                        }
                    }),
                    type: 'bar',
                    barWidth: 20,
                },
            ]
        };
        pieChartInstance.setOption(options);
    }

    // 电力
    $('.end-emission .emiss .tbs').on('click', 'span', function () {
        if ($(this).hasClass('active')) return

        $(this).addClass('active')
        $(this).siblings().removeClass('active')

        var index = $(this).index();
        http({
            url: 'openness/api/v2/oneweb/green',
            callback(res) {
                if (index === 0) {
                    // 发电量
                    render('发电量', res.data)
                } else if (index === 1) {
                    render('沼气量', res.data)
                } else {
                    render3('生物柴油', res.data)	// 柱状图
                }
            }
        });
    })

    // 排放
    $('.end-emission .elec .tbs').on('click', 'span', function () {
        if ($(this).hasClass('active')) return

        $(this).addClass('active')
        $(this).siblings().removeClass('active')

        var index = $(this).index();

        http({
            url: 'openness/api/v2/oneweb/out',
            callback(res) {
                console.log(res)
                if (index === 0) {
                    // 臭氧
                    render2(1, res.data)
                } else if (index === 1) {
                    // 二氧化硫
                    render2(2, res.data)
                } else {
                    // todo 暂时没数据
                }
            }
        });
    })


})  