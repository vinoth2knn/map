const XLSX = require('xlsx')
const jsonfile = require('jsonfile')
const csv = require('csvtojson')

var workbook = XLSX.readFile('data.xlsx')
var worksheet = workbook.Sheets[workbook.SheetNames[0]]
worksheetdata = XLSX.utils.sheet_to_json(worksheet)

var data = {}

const states = [
    "Bihar",
    "Sikkim",
    "Jharkhand",
    "Rajasthan",
    "West Bengal",
    "Madhya Pradesh",
    "Chhatisgarh",
    "Odisha",
    "Gujarat",
    "Maharashtra",
    "Goa",
    "Andhra Pradesh",
    "Karnataka",
    "Kerala",
    "Tamil Nadu",
    "Uttar Pradesh",
    "Haryana",
    "Punjab",
    "Uttaranchal",
    "Himachal Pradesh",
    "Tripura",
    "Mizoram",
    "Manipur",
    "Nagaland",
    "Meghalaya",
    "Delhi",
    "Jammu & Kashmir",
    "Arunachal Pradesh",
    "Assam",
    "India"
]

const colNames = [
    '% Single-Classroom Schools',
    '% Single-Teacher Schools',
    '% Schools with Building',
    '% Schools with Girls Toilet',
    '% Schools with Boys Toilet',
    '% Schools with Toilet for CWSN',
    '% Schools with Drinking Water',
    '% Schools with Electricity',
    '% Schools with Ramp, if Needed',
    '% Schools with Library',
    '% Schools with Full time Librarian',
    '% Schools with Boundary wall',
    '% Schools Exclusively for CWSN',
    '% Schools with Lab. Assistant',
    '% Schools with Head Master Room',
    '% Schools with Hostel for Boys',
    '% Schools with Hostel for Girls',
    '% Schools with Computer & Internet',
    '% Schools with ICT Laboratory',
    '% Schools with Playground Facility',
    '% Schools Conducted Med. Check-up',
    '% Schools Having SMDC',
    '% Schools with Sch. Bld. Committee',
    '% Schools Having PTA',
    '% Schools Established Since 2006',
    'Pupil-Teacher Ratio',
    'Student-Classroom Ratio',
    'Avg. No. of Teachers per School',
    '% Female Teachers',
    '% Girls Enrolment',
]

colNames.forEach((colName, index) => {
    let datafield = 'df' + index
    data[datafield] = {}
    data[datafield].type = colName

    for (let j = 2012; j <= 2015; j++) {
        let year = j
        data[datafield][year] = {}

        states.forEach(state => {
            worksheetdata.forEach(rawData => {
                if (state == "Uttaranchal") state = "Uttarakhand"
                if (state == "Chhatisgarh") state = "Chhattisgarh"
                if (rawData.State == state && rawData.Year == year) {

                    if (state == "Uttarakhand") state = "Uttaranchal"
                    if (state == "Chhattisgarh") state = "Chhatisgarh"

                    if (rawData[colName] === undefined) {
                        data[datafield][year][state] = 'NA'
                    } else {
                        data[datafield][year][state] = rawData[colName].substring(0, rawData[colName].length - 1)
                    }
                }
            })
        })
    }
})

colNames.forEach((colName, index) => {
    for (let year = 2012; year <= 2015; year++) {
        let avg = 0
        let ctr = 0
        states.forEach(state => {
            if (state !== "India" && data['df' + index][year][state] !== "NA") {
                avg += Number(data['df' + index][year][state])
                ++ctr
            }
        })
        //console.log(avg)
        if (ctr === 0) {
            avg = "NA"
        } else {
            avg = avg / (ctr * 1.0)
        }
        //console.log(avg, ctr)
        data['df' + index][year]['National Average'] = String(avg)
    }
})

data['target'] = {}
data['target']['2013'] = {}
data['target']['2014'] = {}
data['target']['2015'] = {}

csv().fromFile('PredictByState.csv')
    .on("end_parsed", function (jsonArrayObj) { //when parse finished, result will be emitted here.
        jsonArrayObj.forEach(rawData => {

            let state = rawData.State
            if (state == "Uttarakhand") state = "Uttaranchal"
            if (state == "Chhattisgarh") state = "Chhatisgarh"

            data['target'][rawData.Year][state] = rawData.Target
        })

        jsonfile.writeFile('data.json', data, function (err) {
            console.error(err)
        })
    })

var workbook2 = XLSX.readFile('AttributesAndCorrelations.xlsx')
var worksheet2 = workbook2.Sheets[workbook2.SheetNames[0]]
worksheetdata2 = XLSX.utils.sheet_to_json(worksheet2)

let correlationData = {}
worksheetdata2.forEach(rawData => {
    correlationData[rawData.Attribute.trim()] = rawData['Correlation ']
})
jsonfile.writeFile('correlations.json', correlationData, function (err) {
    console.error(err)
})