/* Oscar bilingual dictionary — plain script, file:// safe. Loaded before script.js */
(function () {
  var LANG_KEY = 'flukeblind-lang';
  var STR = {
    th: {
      'nav.home': 'หน้าแรก', 'nav.stats': 'สถิติ', 'nav.activities': 'กิจกรรมการมีส่วนร่วม',
      'nav.notif': 'แจ้งเตือน', 'nav.profile': 'โปรไฟล์',
      'search.ph': 'ค้นหาสถานที่ เช่น โรงเรียนสุรศักดิ์มนตรี ตึก 3, ตลาดไท',
      'search.empty': 'ไม่พบสถานที่ ลองคำอื่น เช่น “ตลาดไท” หรือ “Bangkok”',
      'search.loading': 'กำลังค้นหา…', 'search.need': 'กรุณากรอกชื่อสถานที่ที่ต้องการค้นหา',
      'search.found': 'พบ "{name}" — แสดงบนแผนที่แล้ว',
      'loc.current': 'ตำแหน่งปัจจุบัน', 'loc.viewmap': 'ดูแผนที่',
      'overview.title': 'ภาพรวมการปล่อยคาร์บอน', 'overview.unit': 'กก./วัน',
      'overview.vs': 'เทียบกับค่าเฉลี่ย', 'overview.great': 'ยอดเยี่ยม!',
      'overview.zero': 'คุณยังไม่ปล่อยคาร์บอน ในวันนี้', 'overview.detail': 'ดูรายละเอียด',
      'info.title': 'ข้อมูลส่วนตัว', 'info.edit': 'แก้ไข',
      'info.name': 'ชื่อผู้ใช้ / อาคาร', 'info.school': 'โรงเรียน/สถานศึกษา',
      'info.grade': 'ระดับชั้น', 'info.grade.v': 'มัธยมศึกษาปีที่ 3',
      'info.type': 'ประเภทผู้ใช้', 'info.type.v': 'นักเรียน',
      'info.prov': 'จังหวัด', 'info.co2': 'เป้าหมาย CO₂', 'info.co2.v': 'ลดการปล่อยคาร์บอน',
      'cat.title': 'หมวดหมู่การปล่อยคาร์บอน', 'cat.all': 'ดูทั้งหมด',
      'cat.travel': 'การเดินทาง', 'cat.food': 'อาหาร', 'cat.energy': 'การใช้พลังงาน',
      'cat.goods': 'สินค้าและบริการ', 'cat.home': 'ที่อยู่อาศัย', 'cat.other': 'อื่น ๆ',
      'cat.unit': 'กก./กม.',
      'saved.title': 'จุดส่งของที่บันทึกไว้', 'saved.all': 'ดูทั้งหมด',
      'saved.route.sub': '3 จุด • ล่าสุด 12 ก.ย. 2568', 'saved.veh': 'ยานพาหนะ',
      'saved.veh.sub': '{n} คัน • พร้อมใช้งาน', 'saved.places': 'จุดที่บันทึกไว้',
      'saved.count': '{n} จุด (คลิกเพื่อจัดการ)',
      'veh.badge': 'ยานพาหนะ {n} คัน',
      'back': '‹ กลับหน้าแรก',
      'stats.title': 'สถิติการปล่อยคาร์บอน', 'stats.week': 'สรุปการปล่อยคาร์บอนประจำสัปดาห์',
      'stats.today': 'วันนี้', 'stats.thisweek': 'สัปดาห์นี้', 'stats.saved': 'ประหยัดได้',
      'stats.pass': 'เป้าหมายผ่าน', 'stats.share': 'สัดส่วนการปล่อยคาร์บอนตามหมวดหมู่',
      'act.title': 'กิจกรรมการมีส่วนร่วม', 'act.week': 'ภารกิจลดคาร์บอนประจำสัปดาห์',
      'act.join': 'เข้าร่วม', 'act.reg': 'ลงทะเบียน',
      'act.1t': 'ปั่นจักรยานหรือเดินไปโรงเรียน', 'act.1d': 'ลดคาร์บอนได้ 0.45 กก./ครั้ง • รับ 50 แต้ม',
      'act.2t': 'พกแก้วน้ำส่วนตัวมาเอง', 'act.2d': 'ลดขยะพลาสติก 1 ชิ้น • รับ 20 แต้ม',
      'act.3t': 'ร่วมปลูกต้นไม้ในโรงเรียน', 'act.3d': 'วันศุกร์นี้ ณ สวนเกษตร • รับ 100 แต้ม',
      'act.done': 'บันทึกกิจกรรมสำเร็จ!', 'act.reg.done': 'ลงทะเบียนร่วมกิจกรรมสำเร็จ!',
      'notif.title': 'การแจ้งเตือน',
      'notif.1t': 'ยอดเยี่ยม! วันนี้คุณยังไม่ปล่อยคาร์บอน', 'notif.1d': 'ร่วมกันรักษาสิ่งแวดล้อมเพื่อโลกที่ดีกว่า',
      'notif.1time': '10 นาทีที่แล้ว', 'notif.2t': 'บันทึกจุดส่งของสำเร็จ',
      'notif.2d': 'โรงเรียนสุรศักดิ์มนตรี, ตลาดไท 3 จุด', 'notif.2time': 'เมื่อวานนี้',
      'notif.3t': 'เป้าหมาย CO₂ ประจำสัปดาห์สำเร็จแล้ว 80%', 'notif.3d': 'อีกเพียง 20% เพื่อรับเหรียญตรา Eco Champion',
      'notif.3time': '2 วันที่แล้ว',
      'profile.title': 'โปรไฟล์ผู้ใช้งาน', 'profile.level': 'ผู้พิทักษ์สิ่งแวดล้อม ระดับ 2',
      'profile.edit': 'แก้ไขข้อมูลส่วนตัว', 'profile.notif.set': 'การตั้งค่าการแจ้งเตือน',
      'profile.co2.set': 'ตั้งค่าเป้าหมายการลดคาร์บอน', 'profile.logout': 'ออกจากระบบ',
      'toast.edit': 'เปิดหน้าต่างแก้ไขข้อมูลส่วนตัว',
      'toast.cat': 'หมวดหมู่: {name} ({num} {unit})',
      'toast.pin': 'เลื่อนไปยังจุดส่งของและแผนที่แล้ว',
      'toast.dark': 'เปลี่ยนเป็นธีมมืดแล้ว', 'toast.light': 'เปลี่ยนเป็นธีมสว่างแล้ว',
      'toast.dir.need': 'เลือกจุดส่งของก่อนเปิดเส้นทางนำทาง',
      'toast.zoom.none': 'ยังไม่ได้เลือกจุด — แสดงจุดเริ่มต้น',
      'toast.zoom.to': 'ซูมไปยัง "{name}"',
      'veh.filter.all': 'ทั้งหมด', 'veh.filter.ready': 'พร้อมใช้งาน',
      'veh.filter.delivering': 'กำลังจัดส่ง', 'veh.filter.charging': 'กำลังชาร์จ',
      'veh.ready.n': '{n} คันพร้อมใช้งาน', 'veh.need.name': 'กรุณาระบุชื่อรถ',
      'veh.added': 'เพิ่มยานพาหนะ "{name}" สำเร็จ!', 'veh.removed': 'ลบยานพาหนะ "{name}" ออกจากระบบแล้ว',
      'fuel.diesel': 'ดีเซล', 'fuel.gasoline': 'เบนซิน', 'fuel.electric': 'ไฟฟ้า (EV)', 'fuel.ngv': 'NGV',
      'route.done2': 'บันทึกส่งมอบ: โรงเรียนสุรศักดิ์มนตรี (ตึก 3) สำเร็จแล้ว!',
      'route.done3': 'ยอดเยี่ยม! จัดส่งครบทั้ง 3 จุดเรียบร้อยแล้ว ลดคาร์บอนรวม 8.6 กก. CO₂',
      'route.p2': 'ส่งมอบแล้ว 2 จาก 3 จุด (66%)', 'route.p3': 'ส่งมอบครบถ้วน 3 จาก 3 จุด (100%)',
      'route.all.done': 'เสร็จสิ้นทุกจุดแล้ว',
      'stop.need.title': 'กรุณาระบุชื่อสถานที่สำหรับจุดส่งใหม่',
      'stop.added': 'เพิ่มจุดส่งใหม่: "{name}" สำเร็จ!',
      'place.deleted': 'ลบสถานที่ที่บันทึกไว้เรียบร้อยแล้ว',
      'place.need.name': 'กรุณาระบุชื่อสถานที่ที่ต้องการบันทึก',
      'place.added': 'บันทึกสถานที่ "{name}" สำเร็จ! เพิ่มลงแผนที่แล้ว',
      'place.empty': 'ยังไม่มีสถานที่ที่บันทึกไว้',
      'map.none': '— ยังไม่เลือกจุด —', 'map.none.hint': 'เปิดสวิตช์จุดด้านบนเพื่อดูเส้นทาง',
      'map.from.origin': 'จากจุดเริ่มต้น',
      'login.title': 'เข้าสู่ระบบ', 'login.sub': 'ร่วมกันลดคาร์บอน เพื่อโลกที่ดีกว่า',
      'login.user': 'ชื่อผู้ใช้ / รหัสนักเรียน', 'login.user.ph': 'กรอกชื่อผู้ใช้ หรือ ตึก 3',
      'login.pass': 'รหัสผ่าน', 'login.pass.ph': 'กรอกรหัสผ่านของคุณ',
      'login.forgot': 'ลืมรหัสผ่าน?', 'login.remember': 'จดจำการเข้าสู่ระบบ',
      'login.submit': 'เข้าสู่ระบบ', 'login.quick': 'หรือเข้าสู่ระบบแบบด่วน',
      'login.noacc': 'ยังไม่มีบัญชีใช้งาน?', 'login.contact': 'ติดต่อฝ่ายวิชาการ',
      'login.guest': '‹ ข้ามไปหน้าหลักในฐานะผู้เยี่ยมชม',
      'unit.m': 'ม.', 'unit.km': 'กม.', 'unit.kg': 'กก.'
    },
    en: {
      'nav.home': 'Home', 'nav.stats': 'Stats', 'nav.activities': 'Activities',
      'nav.notif': 'Notifications', 'nav.profile': 'Profile',
      'search.ph': 'Search places e.g. Surasakmontri School Bldg 3, Talat Thai',
      'search.empty': 'No places found. Try another keyword.',
      'search.loading': 'Searching…', 'search.need': 'Please enter a place to search',
      'search.found': 'Found "{name}" — shown on map',
      'loc.current': 'Current location', 'loc.viewmap': 'View map',
      'overview.title': 'Carbon emission overview', 'overview.unit': 'kg/day',
      'overview.vs': 'vs. average', 'overview.great': 'Excellent!',
      'overview.zero': "You haven't emitted carbon today", 'overview.detail': 'View details',
      'info.title': 'Personal info', 'info.edit': 'Edit',
      'info.name': 'User / Building', 'info.school': 'School',
      'info.grade': 'Grade', 'info.grade.v': 'Grade 9 (M.3)',
      'info.type': 'User type', 'info.type.v': 'Student',
      'info.prov': 'Province', 'info.co2': 'CO₂ goal', 'info.co2.v': 'Reduce carbon emissions',
      'cat.title': 'Emission categories', 'cat.all': 'View all',
      'cat.travel': 'Transport', 'cat.food': 'Food', 'cat.energy': 'Energy',
      'cat.goods': 'Goods & services', 'cat.home': 'Housing', 'cat.other': 'Others',
      'cat.unit': 'kg/km',
      'saved.title': 'Saved delivery points', 'saved.all': 'View all',
      'saved.route.sub': '3 stops • latest 12 Sep 2025', 'saved.veh': 'Vehicles',
      'saved.veh.sub': '{n} vehicles • ready', 'saved.places': 'Saved places',
      'saved.count': '{n} places (tap to manage)',
      'veh.badge': '{n} vehicles',
      'back': '‹ Back home',
      'stats.title': 'Carbon emission stats', 'stats.week': 'Weekly emission summary',
      'stats.today': 'Today', 'stats.thisweek': 'This week', 'stats.saved': 'Saved',
      'stats.pass': 'Goal passed', 'stats.share': 'Emissions by category',
      'act.title': 'Engagement activities', 'act.week': 'Weekly carbon missions',
      'act.join': 'Join', 'act.reg': 'Register',
      'act.1t': 'Bike or walk to school', 'act.1d': 'Save 0.45 kg/time • earn 50 pts',
      'act.2t': 'Bring your own cup', 'act.2d': 'Save 1 plastic item • earn 20 pts',
      'act.3t': 'Join school tree planting', 'act.3d': 'This Friday at the farm garden • earn 100 pts',
      'act.done': 'Activity saved!', 'act.reg.done': 'Registered successfully!',
      'notif.title': 'Notifications',
      'notif.1t': "Great! You haven't emitted carbon today", 'notif.1d': "Let's protect the planet together",
      'notif.1time': '10 min ago', 'notif.2t': 'Delivery points saved',
      'notif.2d': 'Surasakmontri School, Talat Thai · 3 stops', 'notif.2time': 'Yesterday',
      'notif.3t': 'Weekly CO₂ goal 80% done', 'notif.3d': '20% more to earn the Eco Champion badge',
      'notif.3time': '2 days ago',
      'profile.title': 'User profile', 'profile.level': 'Eco Guardian Lv. 2',
      'profile.edit': 'Edit profile', 'profile.notif.set': 'Notification settings',
      'profile.co2.set': 'Set carbon reduction goal', 'profile.logout': 'Log out',
      'toast.edit': 'Opening profile editor',
      'toast.cat': 'Category: {name} ({num} {unit})',
      'toast.pin': 'Scrolled to delivery points and map',
      'toast.dark': 'Switched to dark theme', 'toast.light': 'Switched to light theme',
      'toast.dir.need': 'Select a delivery point first',
      'toast.zoom.none': 'No point selected — showing origin',
      'toast.zoom.to': 'Zooming to "{name}"',
      'veh.filter.all': 'All', 'veh.filter.ready': 'Ready',
      'veh.filter.delivering': 'Delivering', 'veh.filter.charging': 'Charging',
      'veh.ready.n': '{n} vehicles ready', 'veh.need.name': 'Please enter a vehicle name',
      'veh.added': 'Vehicle "{name}" added!', 'veh.removed': 'Vehicle "{name}" removed',
      'fuel.diesel': 'Diesel', 'fuel.gasoline': 'Gasoline', 'fuel.electric': 'Electric (EV)', 'fuel.ngv': 'NGV',
      'route.done2': 'Delivered: Surasakmontri School (Bldg 3) done!',
      'route.done3': 'All 3 stops delivered! Saved 8.6 kg CO₂',
      'route.p2': 'Delivered 2 of 3 stops (66%)', 'route.p3': 'All 3 of 3 stops done (100%)',
      'route.all.done': 'All stops completed',
      'stop.need.title': 'Please enter a name for the new stop',
      'stop.added': 'New stop added: "{name}"!',
      'place.deleted': 'Saved place deleted',
      'place.need.name': 'Please enter a place name to save',
      'place.added': 'Place "{name}" saved! Added to map',
      'place.empty': 'No saved places yet',
      'map.none': '— No point selected —', 'map.none.hint': 'Toggle a point above to show route',
      'map.from.origin': 'from origin',
      'login.title': 'Log in', 'login.sub': 'Reduce carbon together for a better world',
      'login.user': 'Username / Student ID', 'login.user.ph': 'Enter username or Bldg 3',
      'login.pass': 'Password', 'login.pass.ph': 'Enter your password',
      'login.forgot': 'Forgot password?', 'login.remember': 'Remember me',
      'login.submit': 'Log in', 'login.quick': 'or quick log in',
      'login.noacc': "Don't have an account?", 'login.contact': 'Contact academic office',
      'login.guest': '‹ Continue as guest',
      'unit.m': 'm', 'unit.km': 'km', 'unit.kg': 'kg'
    }
  };
  function cur() {
    try { return localStorage.getItem(LANG_KEY) || ((navigator.language || 'th').toLowerCase().indexOf('en') === 0 ? 'en' : 'th'); }
    catch (e) { return 'th'; }
  }
  var lang = cur();
  function t(key, vars) {
    var s = (STR[lang] && STR[lang][key]) || STR.th[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function apply(l) {
    lang = l === 'en' ? 'en' : 'th';
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = (STR[lang] && STR[lang][el.getAttribute('data-i18n')]) || STR.th[el.getAttribute('data-i18n')];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var v = (STR[lang] && STR[lang][el.getAttribute('data-i18n-ph')]) || STR.th[el.getAttribute('data-i18n-ph')];
      if (v != null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var v = (STR[lang] && STR[lang][el.getAttribute('data-i18n-aria')]) || STR.th[el.getAttribute('data-i18n-aria')];
      if (v != null) el.setAttribute('aria-label', v);
    });
    document.querySelectorAll('.lang-toggle-btn').forEach(function (b) {
      b.textContent = lang === 'th' ? 'EN' : 'TH';
      b.setAttribute('aria-pressed', String(lang === 'en'));
    });
    if (typeof window.onLangChange === 'function') try { window.onLangChange(lang); } catch (e) {}
  }
  window.i18n = { t: t, apply: apply, get lang() { return lang; } };
  window.__LANG_KEY = LANG_KEY;
  document.addEventListener('DOMContentLoaded', function () { apply(lang); });
}
)();
