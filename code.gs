// ⭐ Sheet ID ของคุณ
const SHEET_ID = '1XFXDrFMKvw0CFZcOwTQ3vo1XRfCQAqLgEeHrculja-c';


const ss = SpreadsheetApp.openById(SHEET_ID);
let studentSheet;
let transactionSheet;


/**
 * Initializes sheets and headers if they don't exist.
 */
function setupSheets() {
  const studentSheetName = 'Students';
  const studentHeaders = ['student_id', 'prefix', 'first_name', 'last_name', 'student_number', 'class', 'registration_date', 'status'];
  studentSheet = ss.getSheetByName(studentSheetName);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(studentSheetName);
    studentSheet.appendRow(studentHeaders);
    studentSheet.getRange(1, 1, 1, studentHeaders.length).setFontWeight("bold");
  }


  const transactionSheetName = 'Transactions';
  const transactionHeaders = ['transaction_id', 'timestamp', 'student_id', 'transaction_type', 'amount', 'recorded_by'];
  transactionSheet = ss.getSheetByName(transactionSheetName);
  if (!transactionSheet) {
    transactionSheet = ss.insertSheet(transactionSheetName);
    transactionSheet.appendRow(transactionHeaders);
    transactionSheet.getRange(1, 1, 1, transactionHeaders.length).setFontWeight("bold");
  }
}


// Run setup when the script is loaded
setupSheets();




/**
 * Serves the main web application.
 */
function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('ระบบออมทรัพย์นักเรียน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  } catch (err) {
      Logger.log(`CRITICAL ERROR in doGet: ${err.message}`);
      return HtmlService.createHtmlOutput(`<h1>เกิดข้อผิดพลาดร้ายแรงบนเซิร์ฟเวอร์</h1><p>ไม่สามารถโหลดหน้าหลักของแอปพลิเคชันได้ กรุณาตรวจสอบ Executions log</p><p>Error: ${err.message}</p>`);
  }
}


/**
 * Includes HTML content from other files, with error handling.
 */
function include(filename) {
  try {
    const content = HtmlService.createHtmlOutputFromFile(filename).getContent();
    if (content && content.trim() !== '') {
      return content;
    } else {
      Logger.log(`Warning: The file '${filename}.html' was found but it is empty.`);
      return `<div class="alert alert-warning m-3"><strong>คำเตือน:</strong> ไฟล์ '${filename}.html' มีอยู่แต่ไม่มีเนื้อหาข้างใน</div>`;
    }
  } catch (e) {
    Logger.log(`Error: Failed to include file '${filename}'. Reason: ${e.message}`);
    return `<div class="alert alert-danger m-3"><strong>เกิดข้อผิดพลาด:</strong> ไม่สามารถโหลดไฟล์ '${filename}.html' ได้ อาจเป็นเพราะไฟล์ไม่มีอยู่จริง หรือมีชื่อไฟล์ไม่ถูกต้อง</div>`;
  }
}


/**
 * Formats a JavaScript Date object into a Thai date string.
 */
function formatThaiDate(date) {
  if (!date || !(date instanceof Date)) return "-";
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}


/**
 * Checks if a student number already exists in a specific class.
 */
function checkStudentNumber(className, studentNumber) {
  try {
    if (studentSheet.getLastRow() > 1) {
      const dataRange = studentSheet.getRange(2, 5, studentSheet.getLastRow() - 1, 2).getValues();
      const isDuplicate = dataRange.some(row => {
        const existingNumber = (row[0] || '').toString().trim();
        const existingClass = (row[1] || '').toString().trim();
        return existingNumber === studentNumber && existingClass === className;
      });
      return { isDuplicate: isDuplicate };
    }
    return { isDuplicate: false };
  } catch (e) {
    Logger.log(`Error in checkStudentNumber: ${e.message}`);
    return { isDuplicate: false };
  }
}


/**
 * Registers a new student after a final duplicate check.
 */
function registerStudent(studentData) {
  try {
    const isDuplicate = checkStudentNumber(studentData.class, studentData.studentNumber).isDuplicate;
    if (isDuplicate) {
      return { success: false, message: `ลงทะเบียนไม่สำเร็จ: มีนักเรียนเลขที่ ${studentData.studentNumber} ในชั้น ${studentData.class} อยู่แล้ว` };
    }
    const lastRow = studentSheet.getLastRow();
    const lastIdCell = studentSheet.getRange(lastRow, 1).getValue();
    const newId = (lastRow > 1 && typeof lastIdCell === 'string' && lastIdCell.startsWith('STD'))
                  ? parseInt(lastIdCell.replace('STD', '')) + 1 : 1;
    const newStudentId = `STD${String(newId).padStart(4, '0')}`;
    const registrationDate = new Date();
    const newRowData = [ newStudentId, studentData.prefix, studentData.firstName, studentData.lastName, studentData.studentNumber, studentData.class, registrationDate, 'Active' ];
    studentSheet.appendRow(newRowData);
   
    const savedStudent = {
      studentId: newStudentId,
      prefix: studentData.prefix,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      fullName: `${studentData.prefix}${studentData.firstName} ${studentData.lastName}`,
      class: studentData.class,
      studentNumber: studentData.studentNumber,
      regDate: formatThaiDate(registrationDate)
    };
    return { success: true, student: savedStudent };
  } catch (error) {
    Logger.log(`Error in registerStudent: ${error.message}`);
    return { success: false, message: `เกิดข้อผิดพลาดบนเซิร์ฟเวอร์: ${error.message}` };
  }
}


/**
 * Gets all student data for the table display.
 */
function getStudentsForTable() {
  try {
    if (studentSheet.getLastRow() < 2) return [];
    const range = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 7);
    const values = range.getValues();
    return values.map(row => ({
      studentId: row[0],
      prefix: row[1],
      firstName: row[2],
      lastName: row[3],
      studentNumber: row[4],
      class: row[5],
      regDate: formatThaiDate(new Date(row[6]))
    })).filter(student => student.studentId);
  } catch (e) {
    Logger.log(`Error in getStudentsForTable: ${e.message}`);
    return [];
  }
}


/**
 * Deletes a student record by their ID.
 */
function deleteStudent(studentId) {
  try {
    const data = studentSheet.getRange("A2:A").getValues().flat();
    const rowToDelete = data.indexOf(studentId);
    if (rowToDelete > -1) {
      studentSheet.deleteRow(rowToDelete + 2);
      return { success: true, message: 'ลบข้อมูลนักเรียนสำเร็จ' };
    }
    return { success: false, message: 'ไม่พบรหัสนักเรียนที่ต้องการลบ' };
  } catch (e) {
    Logger.log(`Error in deleteStudent: ${e.message}`);
    return { success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล: ' + e.message };
  }
}


/**
 * Updates an existing student's record.
 */
function updateStudent(studentData) {
  try {
    const data = studentSheet.getRange("A2:A").getValues().flat();
    const rowToUpdate = data.indexOf(studentData.studentId);
    if (rowToUpdate > -1) {
      const targetRow = rowToUpdate + 2;
      studentSheet.getRange(targetRow, 2).setValue(studentData.prefix);
      studentSheet.getRange(targetRow, 3).setValue(studentData.firstName);
      studentSheet.getRange(targetRow, 4).setValue(studentData.lastName);
      studentSheet.getRange(targetRow, 5).setValue(studentData.studentNumber);
      studentSheet.getRange(targetRow, 6).setValue(studentData.class);
      return { success: true, message: 'อัปเดตข้อมูลสำเร็จ' };
    }
    return { success: false, message: 'ไม่พบรหัสนักเรียนที่ต้องการแก้ไข' };
  } catch(e) {
    Logger.log(`Error in updateStudent: ${e.message}`);
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + e.message };
  }
}


/**
 * Records a new deposit transaction for a student.
 */
function depositMoney(depositData) {
  try {
    if (studentSheet.getLastRow() < 2) {
       return { success: false, message: 'ยังไม่มีข้อมูลนักเรียนในระบบ' };
    }
    const studentIds = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 1).getValues().flat();
    if (!studentIds.includes(depositData.studentId)) {
      return { success: false, message: 'ไม่พบรหัสนักเรียนนี้ในระบบ' };
    }
    const lastRow = transactionSheet.getLastRow();
    const lastIdCell = transactionSheet.getRange(lastRow, 1).getValue();
    const newId = (lastRow > 1 && typeof lastIdCell === 'string' && lastIdCell.startsWith('TRN'))
                 ? parseInt(lastIdCell.replace('TRN', '')) + 1 : 1;
    transactionSheet.appendRow([ `TRN${String(newId).padStart(6, '0')}`, new Date(), depositData.studentId, 'Deposit', parseFloat(depositData.amount), Session.getActiveUser().getEmail() ]);
    return { success: true, message: `ฝากเงินให้นักเรียนรหัส ${depositData.studentId} สำเร็จ!` };
  } catch (error) {
    return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` };
  }
}


/**
 * Gets summary data for the dashboard.
 */
function getDashboardData() {
  try {
    const totalStudents = studentSheet.getLastRow() - 1;
    const lastTransRow = transactionSheet.getLastRow();
    let totalSavings = 0;
    if (lastTransRow > 1) {
        const transactionData = transactionSheet.getRange(2, 5, lastTransRow - 1, 1).getValues();
        totalSavings = transactionData.reduce((sum, row) => sum + (Number(row[0]) || 0), 0);
    }
    let lastTransactionDetails = { date: '-', studentId: '-', type: '-', amount: '-' };
    if (lastTransRow > 1) {
        const lastTransactionValues = transactionSheet.getRange(lastTransRow, 2, 1, 4).getValues()[0];
        lastTransactionDetails = {
            date: formatThaiDate(lastTransactionValues[0]),
            studentId: lastTransactionValues[1],
            type: lastTransactionValues[2],
            amount: (Number(lastTransactionValues[3]) || 0).toFixed(2)
        };
    }
    return {
      totalStudents: totalStudents > 0 ? totalStudents : 0,
      totalSavings: totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      lastTransaction: lastTransactionDetails
    };
  } catch (e) {
    return { totalStudents: 0, totalSavings: '0.00', lastTransaction: { date: '-', studentId: '-', type: '-', amount: '-' } };
  }
}


/**
 * Gets a list of students for search/dropdowns in deposit page.
 */
function getStudentsForSearch() {
  if (studentSheet.getLastRow() < 2) return [];
  const data = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 4).getValues();
  return data.map(row => ({
    id: row[0],
    name: `${row[1]}${row[2]} ${row[3]}`
  }));
}


/**
 * Generates report data based on filters.
 */
function getReportData(filters) {
  if (transactionSheet.getLastRow() < 2) return [];
  const transData = transactionSheet.getRange(2, 1, transactionSheet.getLastRow() - 1, 5).getValues();
  if (studentSheet.getLastRow() < 2) return [];
  const studentData = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 4).getValues();
  const studentMap = new Map(studentData.map(s => [s[0], `${s[1]}${s[2]} ${s[3]}`]));
  const startDate = filters.startDate ? new Date(filters.startDate) : null;
  const endDate = filters.endDate ? new Date(filters.endDate) : null;
  if(startDate) startDate.setHours(0, 0, 0, 0);
  if(endDate) endDate.setHours(23, 59, 59, 999);
  return transData.map(t => {
      const transDate = new Date(t[1]);
      return {
        transactionId: t[0], date: transDate, studentId: t[2],
        studentName: studentMap.get(t[2]) || 'ไม่พบข้อมูล',
        type: t[3], amount: parseFloat(t[4] || 0),
        formattedDate: formatThaiDate(transDate)
      };
    })
    .filter(item => {
        if (startDate && item.date < startDate) return false;
        if (endDate && item.date > endDate) return false;
        return true;
    })
    .sort((a, b) => b.date - a.date);
}


/**
 * Exports data to a new Google Sheet.
 */
function exportDataToSheet(dataToExport) {
  const exportSs = SpreadsheetApp.create(`รายงานการออมทรัพย์ ${new Date().toLocaleString('th-TH')}`);
  const sheet = exportSs.getActiveSheet();
  sheet.setName('ReportData');
  const headers = ["รหัสรายการ", "วันที่", "รหัสนักเรียน", "ชื่อนักเรียน", "ประเภท", "จำนวนเงิน (บาท)"];
  sheet.appendRow(headers);
  sheet.getRange("A1:F1").setFontWeight("bold");
  if(dataToExport.length > 0){
    const rows = dataToExport.map(item => [ item.transactionId, item.formattedDate, item.studentId, item.studentName, item.type, item.amount ]);
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.autoResizeColumns(1, headers.length);
  }
  exportSs.addEditor(Session.getActiveUser().getEmail());
  return exportSs.getUrl();
}
