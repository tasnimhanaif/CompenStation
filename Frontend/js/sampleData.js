// Sample Data 

const employees = [
    {
        firstName: "Jason",
        middleName: null,
        lastName: "Dilone",
        birthDate: new Date(1996, 7, 27),
        sex: "male",
        employeeID: 12345678,
        employmentType: "full-time",
        email: "jason@gmail.com",
        payType: "salary",
        pay: 100000,
        hoursWorked: null,
        address: "123 1st St",
        city: "Brooklyn",
        state: "NY",
        zip: 10101,
        ssn: "123-12-1234",
        phone: "123-123-1234",
        jobTitle: "Frontend Engineer",
        benefits: ["Medical", "Dental", "401(k)"],
        username: "jasond",
        password: "",
        accountType: "Admin",
        taxes: {federal: 22.5, state: 10.2},
        status: "Active",
        statusChangeDate: new Date(2025, 11, 10),
        companyID: 9876
    },
    {
        firstName: "Gerald",
        middleName: null,
        lastName: "Pickle",
        birthDate: new Date(1990, 4, 11),
        sex: "male",
        employeeID: 12345679,
        employmentType: "full-time",
        email: "gerald@gmail.com",
        payType: "salary",
        pay: 165000,
        hoursWorked: null,
        address: "501 15th St",
        city: "Brooklyn",
        state: "NY",
        zip: 10112,
        ssn: "932-99-0011",
        phone: "123-234-5678",
        jobTitle: "Senior Developer",
        benefits: ["Medical", "Dental", "401(k)", "Vision"],
        username: "geraldP",
        password: "",
        accountType: "Employee",
        taxes: {federal: 28.0, state: 12.5},
        status: "Active",
        statusChangeDate: new Date(2017, 9, 17),
        companyID: 9876
    }
];

const benefits = [
    {name: "Medical", percentage: 7.8},
    {name: "Vision", percentage: 5.1},
    {name: "Dental", percentage: 6.0},
    {name: "401(k)", percentage: 10.2},
];

const stateTaxes = [
    { percentage: 6.8, bracketStart: 0, bracketEnd: 0 },
    { percentage: 10.2, bracketStart: 0, bracketEnd: 0 }
];
const federalTaxes = [
    { percentage: 10.0, bracketStart: 0, bracketEnd: 0 },
    { percentage: 12.0, bracketStart: 0, bracketEnd: 0 },
    { percentage: 22.0, bracketStart: 0, bracketEnd: 0 },
    { percentage: 24.0, bracketStart: 0, bracketEnd: 0 },
    { percentage: 32.0, bracketStart: 0, bracketEnd: 0 },
    { percentage: 35.0, bracketStart: 0, bracketEnd: 0 },
    { percentage: 37.0, bracketStart: 0, bracketEnd: 0 }
];

//export {employees, benefits, stateTaxes, federalTaxes};

benefits.push({name:"Car", percentage: 20.3});
console.log(benefits);

