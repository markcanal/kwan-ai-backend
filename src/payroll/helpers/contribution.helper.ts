/**
 * Philippine Payroll Government Contribution Helper (2025)
 * Includes SSS, PhilHealth, and Pag-IBIG computations.
 * All returned values are semi-monthly (divided by 2).
 */

// SSS Contribution Table Effective January 2025
// Based on SSS Circular No. 2024-006
// All values in Philippine Pesos (PHP)

export function computeSSSContribution(baseSalary: number) {
  const table = [
    { min: 0, max: 4999.99, employee: 0, employer: 0 },
    { min: 5000, max: 5249.99, employee: 250, employer: 510 },
    { min: 5250, max: 5749.99, employee: 275, employer: 560 },
    { min: 5750, max: 6249.99, employee: 300, employer: 610 },
    { min: 6250, max: 6749.99, employee: 325, employer: 660 },
    { min: 6750, max: 7249.99, employee: 350, employer: 710 },
    { min: 7250, max: 7749.99, employee: 375, employer: 760 },
    { min: 7750, max: 8249.99, employee: 400, employer: 810 },
    { min: 8250, max: 8749.99, employee: 425, employer: 860 },
    { min: 8750, max: 9249.99, employee: 450, employer: 910 },
    { min: 9250, max: 9749.99, employee: 475, employer: 960 },
    { min: 9750, max: 10249.99, employee: 500, employer: 1010 },
    { min: 10250, max: 10749.99, employee: 525, employer: 1060 },
    { min: 10750, max: 11249.99, employee: 550, employer: 1110 },
    { min: 11250, max: 11749.99, employee: 575, employer: 1160 },
    { min: 11750, max: 12249.99, employee: 600, employer: 1210 },
    { min: 12250, max: 12749.99, employee: 625, employer: 1260 },
    { min: 12750, max: 13249.99, employee: 650, employer: 1310 },
    { min: 13250, max: 13749.99, employee: 675, employer: 1360 },
    { min: 13750, max: 14249.99, employee: 700, employer: 1410 },
    { min: 14250, max: 14749.99, employee: 725, employer: 1460 },
    { min: 14750, max: 15249.99, employee: 750, employer: 1510 },
    { min: 15250, max: 15749.99, employee: 775, employer: 1560 },
    { min: 15750, max: 16249.99, employee: 800, employer: 1610 },
    { min: 16250, max: 16749.99, employee: 825, employer: 1660 },
    { min: 16750, max: 17249.99, employee: 850, employer: 1710 },
    { min: 17250, max: 17749.99, employee: 875, employer: 1760 },
    { min: 17750, max: 18249.99, employee: 900, employer: 1810 },
    { min: 18250, max: 18749.99, employee: 925, employer: 1860 },
    { min: 18750, max: 19249.99, employee: 950, employer: 1910 },
    { min: 19250, max: 19749.99, employee: 975, employer: 1960 },
    { min: 19750, max: 20249.99, employee: 1000, employer: 2010 },
    { min: 20250, max: 20749.99, employee: 1025, employer: 2060 },
    { min: 20750, max: 21249.99, employee: 1050, employer: 2110 },
    { min: 21250, max: 21749.99, employee: 1075, employer: 2160 },
    { min: 21750, max: 22249.99, employee: 1100, employer: 2210 },
    { min: 22250, max: 22749.99, employee: 1125, employer: 2260 },
    { min: 22750, max: 23249.99, employee: 1150, employer: 2310 },
    { min: 23250, max: 23749.99, employee: 1175, employer: 2360 },
    { min: 23750, max: 24249.99, employee: 1200, employer: 2410 },
    { min: 24250, max: 24749.99, employee: 1225, employer: 2460 },
    { min: 24750, max: 25249.99, employee: 1250, employer: 2510 },
    { min: 25250, max: 25749.99, employee: 1275, employer: 2560 },
    { min: 25750, max: 26249.99, employee: 1300, employer: 2610 },
    { min: 26250, max: 26749.99, employee: 1325, employer: 2660 },
    { min: 26750, max: 27249.99, employee: 1350, employer: 2710 },
    { min: 27250, max: 27749.99, employee: 1375, employer: 2760 },
    { min: 27750, max: 28249.99, employee: 1400, employer: 2810 },
    { min: 28250, max: 28749.99, employee: 1425, employer: 2860 },
    { min: 28750, max: Infinity, employee: 1425, employer: 2880 }, // max MSC ₱35,000
  ];

  const bracket = table.find(row => baseSalary >= row.min && baseSalary <= row.max);
  const employee = bracket ? bracket.employee : 0;
  const employer = bracket ? bracket.employer : 0;

  return {
    employeeMonthly: employee,
    employerMonthly: employer,
    totalMonthly: employee + employer,
    // Semi-monthly breakdown (typical for payroll)
    employeeSemiMonthly: employee / 2,
    employerSemiMonthly: employer / 2,
    totalSemiMonthly: (employee + employer) / 2,
  };
}


/**
 * PhilHealth: 5% of salary (shared equally)
 * Max base = ₱100,000 | Min base = ₱10,000
 */
export function computePhilHealthContribution(baseSalary: number): number {
  const minSalary = 10000;
  const maxSalary = 100000;
  const rate = 0.05; // 5%
  const employeeShare = 0.5; // half of total

  const effectiveSalary = Math.min(Math.max(baseSalary, minSalary), maxSalary);
  const monthly = effectiveSalary * rate * employeeShare;
  return monthly / 2; // semi-monthly
}

/**
 * Pag-IBIG: 1% if salary ≤ ₱1,500, otherwise 2%
 * Employee share capped at ₱100 monthly
 */
export function computePagIbigContribution(baseSalary: number): number {
  const rate = baseSalary <= 1500 ? 0.01 : 0.02;
  const monthly = Math.min(baseSalary * rate, 100);
  return monthly / 2; // semi-monthly
}
