/**
 * A&J Gala Christmas Party — sponsor applications → Google Sheet + email.
 *
 * Receives POSTs from the website's /api/sponsors route, appends one row per
 * application to the "Solicitudes" tab and emails NOTIFY_EMAIL.
 *
 * SETUP (one time):
 *  1. Create a Google Sheet (e.g. "Gala 2026 — Sponsors").
 *  2. Extensions → Apps Script → paste this file → Save.
 *  3. Project Settings → Script properties → add:
 *       SHARED_SECRET = <long random string, same as SPONSOR_SHEET_SECRET in Vercel>
 *       NOTIFY_EMAIL  = adrysofirealestate@gmail.com   (comma-separate for more)
 *       SHEET_ID      = <optional: the id in the Sheet URL, between /d/ and /edit;
 *                        only needed if this script was NOT created from
 *                        Extensions → Apps Script inside the Sheet>
 *  4. Deploy → New deployment → type "Web app"
 *       Execute as: Me · Who has access: Anyone
 *     Authorize, then copy the /exec URL into SPONSOR_SHEET_WEBHOOK_URL.
 *  5. After editing this script, Deploy → Manage deployments → ✏️ edit →
 *     Version: "New version" → Deploy. Without this the /exec URL keeps
 *     running the OLD code (the URL itself stays the same).
 *  6. Optional check: run the function `testSetup` from the editor once; it
 *     writes nothing, just confirms the Sheet and the email address resolve.
 */

var SHEET_NAME = 'Solicitudes';

var COLUMNS = [
  ['submittedAt', 'Fecha'],
  ['tier', 'Paquete'],
  ['priceUsd', 'Precio (USD)'],
  ['businessName', 'Negocio'],
  ['industry', 'Industria'],
  ['businessLink', 'Web / Redes'],
  ['firstName', 'Nombre'],
  ['lastName', 'Apellido'],
  ['email', 'Email'],
  ['phone', 'Teléfono'],
  ['wantsVideo', 'Quiere video producido'],
  ['raffle', 'Donará premio de rifa'],
  ['raffleItem', 'Premio'],
  ['message', 'Mensaje'],
  ['language', 'Idioma'],
  ['sourceUrl', 'Página'],
];

// Columns the team fills in by hand while following up.
var TRACKING_COLUMNS = ['Estado', 'Pago recibido', 'Logo recibido', 'Video grabado', 'Notas'];

function doPost(e) {
  // Any uncaught error would make Google answer with an HTML error page, so
  // everything is wrapped and the reason comes back as JSON for the site's logs.
  try {
    return handlePost_(e);
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function handlePost_(e) {
  var props = PropertiesService.getScriptProperties();
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }
  if (!data || data.secret !== props.getProperty('SHARED_SECRET')) {
    return json_({ ok: false, error: 'unauthorized' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_(props);
    var row = COLUMNS.map(function (c) {
      var value = data[c[0]];
      if (c[0] === 'submittedAt') return new Date(value || Date.now());
      if (c[0] === 'wantsVideo') return value ? 'Sí' : 'No';
      return sanitize_(value);
    });
    row.push('Nueva', '', '', '', '');
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  try {
    notify_(data, props.getProperty('NOTIFY_EMAIL'), getSpreadsheet_(props).getUrl());
  } catch (err) {
    // The row is saved; a mail quota hiccup must not fail the submission.
    console.error(err);
  }

  return json_({ ok: true });
}

function getSpreadsheet_(props) {
  // Bound script (Extensions → Apps Script) → its own Sheet; standalone
  // script → the Sheet named in the SHEET_ID property.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  var id = props.getProperty('SHEET_ID');
  if (!id) throw new Error('No spreadsheet: create the script from the Sheet (Extensions → Apps Script) or set the SHEET_ID script property');
  return SpreadsheetApp.openById(id);
}

function getSheet_(props) {
  var ss = getSpreadsheet_(props);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    var headers = COLUMNS.map(function (c) { return c[1]; }).concat(TRACKING_COLUMNS);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#102037').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell).
function sanitize_(value) {
  if (value === undefined || value === null) return '';
  var s = String(value).slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function notify_(d, to, sheetUrl) {
  if (!to) return;
  var tierLabel = String(d.tier || '').toUpperCase();
  var subject = 'Nuevo sponsor (' + tierLabel + ') — ' + d.businessName;
  var lines = [
    'Nueva solicitud de sponsor para la Gala Christmas Party.',
    '',
    'Paquete: ' + tierLabel + ' ($' + d.priceUsd + ')',
    'Negocio: ' + d.businessName + ' · ' + d.industry,
    'Web / Redes: ' + (d.businessLink || '—'),
    'Contacto: ' + d.firstName + ' ' + d.lastName,
    'Email: ' + d.email,
    'Teléfono: ' + d.phone,
    'Video producido: ' + (d.wantsVideo ? 'Sí' : 'No'),
    'Premio de rifa: ' + d.raffle + (d.raffleItem ? ' — ' + d.raffleItem : ''),
    'Idioma: ' + d.language,
    '',
    'Mensaje:',
    d.message || '—',
    '',
    'Hoja: ' + sheetUrl,
  ];
  MailApp.sendEmail({ to: to, replyTo: d.email, subject: subject, body: lines.join('\n') });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run from the editor to confirm the setup (and to grant permissions).
function testSetup() {
  var props = PropertiesService.getScriptProperties();
  var ss = getSpreadsheet_(props);
  console.log('Sheet: ' + ss.getName() + ' — ' + ss.getUrl());
  console.log('NOTIFY_EMAIL: ' + (props.getProperty('NOTIFY_EMAIL') || '(missing)'));
  console.log('SHARED_SECRET set: ' + Boolean(props.getProperty('SHARED_SECRET')));
  console.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
}
