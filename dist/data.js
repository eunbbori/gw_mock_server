export const departments = [
    {
        departmentId: 1,
        departmentName: '인사팀'
    },
    {
        departmentId: 2,
        departmentName: '개발팀'
    },
    {
        departmentId: 3,
        departmentName: '연구소'
    }
];
export const employees = [
    {
        employeeId: 1,
        userId: 'gildong',
        employeeName: '홍길동',
        departmentId: 2,
        passwd: 'gildongpwd'
    },
    {
        employeeId: 2,
        userId: 'heungmin',
        employeeName: '손흥민',
        departmentId: 2,
        passwd: 'heungminpwd'
    },
    {
        employeeId: 3,
        userId: 'michael',
        employeeName: '마이클 잭슨',
        departmentId: 3,
        passwd: 'michael'
    },
    {
        employeeId: 4,
        userId: 'lim',
        employeeName: '임꺽정',
        departmentId: 3,
        passwd: 'limpwd'
    },
    {
        employeeId: 5,
        userId: 'bts',
        employeeName: 'BTS',
        departmentId: 3,
        passwd: 'btspwd'
    },
    {
        employeeId: 6,
        userId: 'lee',
        employeeName: '이순신',
        departmentId: 2,
        passwd: 'leepwd'
    },
    {
        employeeId: 7,
        userId: 'doolie',
        employeeName: '둘리',
        departmentId: 2,
        passwd: 'dooliepwd'
    },
    {
        employeeId: 8,
        userId: 'hulk',
        employeeName: '헐크',
        departmentId: 3,
        passwd: 'hulkpwd'
    },
    {
        employeeId: 9,
        userId: 'ironman',
        employeeName: '아이언맨',
        departmentId: 3,
        passwd: 'ironmanpwd'
    },
    {
        employeeId: 10,
        userId: 'soldier',
        employeeName: '윈터 솔져',
        departmentId: 3,
        passwd: 'soldierpwd'
    },
    {
        employeeId: 11,
        userId: 'mandalorian',
        employeeName: '만달로리안',
        departmentId: 3,
        passwd: 'mandalorianpwd'
    },
    {
        employeeId: 12,
        userId: 'skywalker',
        employeeName: '스카이워커',
        departmentId: 3,
        passwd: 'skywalkerpwd'
    },
    {
        employeeId: 13,
        userId: 'superman',
        employeeName: '수퍼맨',
        departmentId: 3,
        passwd: 'supermanpwd'
    },
    {
        employeeId: 14,
        userId: 'black-widow',
        employeeName: '블랙위도우',
        departmentId: 3,
        passwd: 'black-widowpwd'
    },
    {
        employeeId: 15,
        userId: 'spiderman',
        employeeName: '스파이더맨',
        departmentId: 3,
        passwd: 'spidermanpwd'
    },
    {
        employeeId: 16,
        userId: 'doctor-strange',
        employeeName: '닥터스트레인지',
        departmentId: 3,
        passwd: ';doctor-strangepwd'
    },
    {
        employeeId: 17,
        userId: 'Tom',
        employeeName: '톰 크루즈',
        departmentId: 3,
        passwd: 'Tompwd'
    },
];
/*
query EmployeeWorking($dt: String) {
  employeeWorking(dt: $dt) {
    employeeId
    employeeName
    department {
      departmentId
      departmentName
    }
    userId
    workingDate
    workingType
    startAt
    endAt
  }
}
{
  "dt" : "2023-05-09",
}
*/ 
