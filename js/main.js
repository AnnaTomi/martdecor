/* Общая логика прототипа v2: шапка и подвал, «открыто сейчас», подборка вместо корзины,
   направления, каталог, товар с расчётом количества, стили, квиз, заявки. */
(function () {
  var T = window.typo || function (s) { return s; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var t = function (s) { return esc(T(s)); };
  // Заголовки: последнее слово не остаётся одно на строке
  var th = function (s) { return t(s).replace(/ ([^ ]+)$/, " $1"); };
  var byId = function (id) { return window.ITEMS.filter(function (i) { return i.id === id; })[0]; };
  var dirById = function (id) { return window.DIRS.filter(function (d) { return d.id === id; })[0]; };
  var PHONE = '+7&nbsp;(909)&nbsp;420‑04‑20';
  var TG = "https://t.me/+79094200420", VK = "https://vk.ru/martdecoronline";

  // График из группы ВК: Пн–Пт 10–19, Сб–Вс 10–17
  var HOURS = [[10, 17], [10, 19], [10, 19], [10, 19], [10, 19], [10, 19], [10, 17]]; // вс..сб
  function openState() {
    var d = new Date(), h = d.getHours() + d.getMinutes() / 60, w = HOURS[d.getDay()];
    if (h >= w[0] && h < w[1]) return { on: true, text: "Открыто до " + w[1] + ":00" };
    var next = h < w[0] ? w[0] + ":00 сегодня" : HOURS[(d.getDay() + 1) % 7][0] + ":00 завтра";
    return { on: false, text: "Откроемся в " + next };
  }
  function money(n) { return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽"; }
  function priceHtml(it, big) {
    if (!it.price) return '<span class="price"><small>' + t("Цена по запросу") + "</small></span>";
    return '<span class="' + (big ? "big-price" : "price") + '">' + (it.unit ? "" : "от ") + money(it.price) + (it.unit ? " <small>/ " + it.unit + "</small>" : "") + "</span>";
  }
  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; }

  // Подборка (вместо корзины): хранится в браузере посетителя
  var pick = {
    get: function () { try { return JSON.parse(localStorage.getItem("mart-pick") || "{}"); } catch (e) { return {}; } },
    set: function (o) { try { localStorage.setItem("mart-pick", JSON.stringify(o)); } catch (e) {} },
    add: function (id, q) { var o = pick.get(); o[id] = (o[id] || 0) + (q || 1); pick.set(o); },
    count: function () { return Object.keys(pick.get()).length; }
  };

  function toast(html) {
    var el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.innerHTML = html;
    el.classList.add("on");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { el.classList.remove("on"); }, 3200);
  }
  function addToPick(id, btn) {
    pick.add(id);
    if (btn) { btn.classList.add("in"); btn.innerHTML = '<i class="ti ti-check"></i>В подборке'; }
    toast('<i class="ti ti-check"></i>' + t("Добавили в подборку") + ' <a href="podborka.html">' + t("Получить расчёт →") + "</a>");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (b) { e.preventDefault(); addToPick(b.dataset.add, b); }
  });

  function header() {
    var st = openState(), el = $("#header");
    if (!el) return;
    el.innerHTML =
      '<div class="top"><div class="wrap">' +
      '<a class="logo" href="index.html"><span class="logo-mark"></span><span><b>МАРТдекор</b><small>интерьерный салон</small></span></a>' +
      '<nav class="nav"><div class="dd"><button type="button">Направления <i class="ti ti-chevron-down"></i></button><div class="dd-menu">' +
      window.DIRS.map(function (d) { return '<a href="napravlenie.html?id=' + d.id + '"><span class="sw ph ' + d.tx + '"></span><span><b>' + t(d.name) + "</b><span>" + t(d.note) + "</span></span></a>"; }).join("") +
      '</div></div><a href="index.html#stili">Идеи и стили</a><a href="index.html#podbor">Помощь с выбором</a><a href="dizayneram.html">Дизайнерам</a><a href="index.html#salon">Салон</a></nav>' +
      '<div class="top-right"><span class="open-now"><span class="dot' + (st.on ? "" : " off") + '"></span>' + st.text + "</span>" +
      '<a class="call-btn" href="tel:+79094200420" title="' + PHONE + '"><i class="ti ti-phone"></i><span class="lbl">Позвонить</span></a>' +
      '<div class="contact"><button type="button" class="contact-btn"><i class="ti ti-message-circle"></i><span class="lbl">Написать</span></button><div class="contact-menu">' +
      '<p>' + t("Где вам удобнее?") + '</p>' +
      '<a href="' + TG + '"><i class="ti ti-brand-telegram"></i>Telegram</a>' +
      '<a href="' + VK + '"><i class="ti ti-brand-vk"></i>ВКонтакте</a>' +
      "</div></div></div>" +
      "</div></div>";
    var bar = document.createElement("div");
    bar.className = "mbar";
    bar.innerHTML = '<a class="btn btn-line" href="tel:+79094200420"><i class="ti ti-phone"></i>Позвонить</a><a class="btn btn-main" href="index.html#podbor">Подобрать материалы</a>';
    document.body.appendChild(bar);
  }

  function footer() {
    var el = $("#footer");
    if (!el) return;
    el.innerHTML =
      '<footer><div class="wrap"><div class="foot">' +
      "<div><h4>МАРТдекор</h4><p>" + t("Интерьерный салон отделочных материалов в Ростове-на-Дону. Лепнина, панели, камень, обои, краски и свет — всё для стен в одном месте.") + '</p><p style="margin-top:14px;opacity:.7">ИП Арийская Людмила Руслановна, ИНН 231129240301</p></div>' +
      "<div><h4>Направления</h4>" + window.DIRS.map(function (d) { return '<p><a href="napravlenie.html?id=' + d.id + '">' + t(d.name) + "</a></p>"; }).join("") + "</div>" +
      '<div><h4>Покупателям</h4><p><a href="catalog.html">Каталог</a></p><p><a href="index.html#podbor">Помощь с выбором</a></p><p><a href="index.html#kak">Как купить и доставка</a></p><p><a href="podborka.html">Моя подборка</a></p><p><a href="dizayneram.html">Дизайнерам и мастерам</a></p></div>' +
      '<div><h4>Салон</h4><p>пр. Михаила Нагибина, 30Л</p><p>Дизайн-центр WEST</p><p>Пн–Пт 10:00–19:00</p><p>Сб–Вс 10:00–17:00</p><p style="margin-top:12px"><a href="tel:+79094200420">' + PHONE + '</a></p><p><a href="mailto:info@martdecor.ru">info@martdecor.ru</a></p><p><a href="' + TG + '">Telegram</a> · <a href="' + VK + '">ВКонтакте</a> · <a href="https://t.me/martdecorrostov">Telegram-канал</a></p></div>' +
      "</div>" +
      '<div class="proto">' + t("Прототип сайта для обсуждения. Цены — из каталога салона, группы ВКонтакте и Telegram на 3 ноября 2026; наличие уточняет менеджер. Фото — заглушки. Подготовила Анна, ноябрь 2026.") + "</div>" +
      "</div></footer>";
  }

  function card(it) {
    var inPick = !!pick.get()[it.id];
    return '<div class="card reveal">' + (it.brand ? '<span class="brand">' + esc(it.brand) + "</span>" : "") +
      '<div class="ph ' + dirById(it.dir).tx + '"><span class="ph-cap"><i class="ti ti-photo"></i>' + t("фото товара") + "</span></div>" +
      '<div class="card-body"><h3><a href="item.html?id=' + it.id + '">' + th(it.name) + '</a></h3><div class="short">' + t(it.short) + "</div>" +
      '<div class="bottom">' + priceHtml(it) + '<button class="add' + (inPick ? " in" : "") + '" data-add="' + it.id + '">' + (inPick ? '<i class="ti ti-check"></i>В подборке' : '<i class="ti ti-plus"></i>В подборку') + "</button></div></div></div>";
  }
  function minPrice(dir) {
    var p = window.ITEMS.filter(function (i) { return i.dir === dir && i.price; }).map(function (i) { return i.price; });
    return p.length ? "от " + money(Math.min.apply(null, p)) : "цена по запросу";
  }
  function dirTile(d) {
    return '<a class="dir reveal" href="napravlenie.html?id=' + d.id + '"><div class="ph ' + d.tx + '"></div><div class="dir-body"><h3>' + th(d.name) + "</h3><p>" + t(d.note) + '</p><div class="from">' + minPrice(d.id) + '<i class="ti ti-arrow-right"></i></div></div></a>';
  }

  // Главная
  function home() {
    var dirs = $("#dirs");
    if (!dirs) return;
    dirs.innerHTML = window.DIRS.map(dirTile).join("");
    $("#stylesList").innerHTML = window.STYLES.map(function (s) {
      var items = s.items.map(byId);
      return '<div class="style reveal"><div class="ph ' + s.tx + '"><span class="ph-cap"><i class="ti ti-photo"></i>' + t("фото интерьера в этом стиле") + '</span></div><div class="style-body"><h3>' + th(s.name) + '</h3><div class="tags">' + t(s.tags) + '</div><p class="small muted">' + t(s.text) + "</p><ul>" +
        items.map(function (i) { return '<li><span>' + t(i.name.replace(/ (Orac|Decomaster|Hiwood)\b.*$/, "")) + "</span><span>" + (i.price ? (i.unit ? "" : "от ") + money(i.price) : "") + "</span></li>"; }).join("") +
        '</ul><button class="btn btn-line btn-sm" data-style="' + s.id + '">Хочу так же</button></div></div>';
    }).join("");
    $$("[data-style]").forEach(function (b) {
      b.addEventListener("click", function () {
        var s = window.STYLES.filter(function (x) { return x.id === b.dataset.style; })[0];
        var o = pick.get(); s.items.forEach(function (id) { o[id] = o[id] || 1; }); pick.set(o);
        b.innerHTML = '<i class="ti ti-check"></i>' + t("Набор в подборке");
        toast('<i class="ti ti-check"></i>' + t("Набор «" + s.name + "» в подборке") + ' <a href="podborka.html">' + t("Получить расчёт →") + "</a>");
      });
    });
    $$("[data-zoom]").forEach(function (b) {
      b.addEventListener("click", function () {
        var z = document.createElement("div");
        z.className = "zoom";
        z.innerHTML = '<img src="' + b.dataset.zoom + '" alt="">';
        function close() { z.remove(); document.removeEventListener("keydown", esc); }
        function esc(e) { if (e.key === "Escape") close(); }
        z.addEventListener("click", close);
        document.addEventListener("keydown", esc);
        document.body.appendChild(z);
      });
    });
    $("#hits").innerHTML = ["trapezium", "tiramisu", "px202", "flexstone", "frost", "cx189", "silvia", "moonlight"].map(function (id) { return card(byId(id)); }).join("");
    $("#team").innerHTML = window.TEAM.map(function (m) {
      return '<div class="member reveal"><div class="ph tx-salon"><span class="ph-cap"><i class="ti ti-user"></i>' + t("фото") + "</span></div><h3>" + esc(m.name) + "</h3><p><b>" + t(m.role) + "</b><br>" + th(m.text) + '</p><a class="btn btn-line btn-sm" href="' + TG + '"><i class="ti ti-brand-telegram"></i>Написать</a></div>';
    }).join("");
    hoursTable();
    quiz();
  }
  function hoursTable() {
    var d = new Date().getDay();
    $$(".hours tr").forEach(function (tr) { if ((tr.dataset.days || "").split(",").indexOf(String(d)) >= 0) tr.classList.add("today"); });
    var on = $("#visitOpen");
    if (on) { var st = openState(); on.innerHTML = '<span class="dot' + (st.on ? "" : " off") + '"></span> ' + st.text; }
  }

  // Квиз «Подбор за 4 вопроса»
  function quiz() {
    var box = $("#quiz");
    if (!box) return;
    // первый вопрос разводит покупателей (b) и дизайнеров с мастерами (p) по своим вопросам
    var all = $$(".q-step", box), bars = $$(".q-progress span", box), who = all[0], fin = $(".q-final", box), seq, cur = 0, ans = [];
    function path(p) {
      box.dataset.path = p;
      seq = [who].concat(all.filter(function (s) { return s.dataset.path === p; })).concat([fin]);
    }
    function go(n) {
      cur = n;
      all.forEach(function (s) { s.classList.toggle("on", s === seq[n]); });
      bars.forEach(function (b, i) { b.classList.toggle("on", i <= n); });
      $("#qCount").textContent = n < 4 ? "Вопрос " + (n + 1) + " из 4" : "Последний шаг";
      $("#qBack").style.visibility = n ? "visible" : "hidden";
      if (n === 4) $("#qSum").innerHTML = t("Ваши ответы: " + ans.join(" · "));
    }
    all.forEach(function (s) {
      $$(".q-opts button", s).forEach(function (b) {
        b.addEventListener("click", function () {
          if (s === who) path(b.dataset.p);
          var i = seq.indexOf(s);
          $$(".q-opts button", s).forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel");
          ans.length = i;
          ans[i] = b.textContent.trim();
          setTimeout(function () { go(i + 1); }, 220);
        });
      });
    });
    $("#qBack").addEventListener("click", function () { if (cur) go(cur - 1); });
    path("b");
    go(0);
  }

  // Страница направления
  function direction() {
    var box = $("#dirPage");
    if (!box) return;
    var d = dirById(new URLSearchParams(location.search).get("id")) || window.DIRS[0];
    document.title = d.name + " в Ростове-на-Дону — МАРТдекор";
    var items = window.ITEMS.filter(function (i) { return i.dir === d.id; });
    box.innerHTML =
      '<div class="crumbs"><a href="index.html">Главная</a> / <a href="catalog.html">Каталог</a> / ' + t(d.name) + "</div>" +
      '<div class="dir-hero"><div><div class="eyebrow">' + t("Направление салона") + "</div><h1>" + t(d.name) + '</h1><p class="lead">' + t(d.lead) + '</p><div class="kinds">' + d.kinds.map(function (k) { return "<span>" + t(k) + "</span>"; }).join("") + "</div>" +
      '<div class="btns"><a class="btn btn-main" href="#dirForm"><i class="ti ti-sparkles"></i>Подобрать материалы</a><a class="btn btn-line" href="catalog.html?d=' + d.id + '">Все товары · ' + minPrice(d.id) + '</a></div><div class="btn-note"><i class="ti ti-clock"></i>' + t("Пришлите фото комнаты — подборка с ценами за 6 часов") + '</div></div><div class="ph ' + d.tx + '"><span class="ph-cap"><i class="ti ti-photo"></i>' + t("фото: " + d.name.toLowerCase() + " в интерьере") + "</span></div></div>";
    $("#dirItems").innerHTML = items.map(card).join("");
    $("#dirBrands").innerHTML = d.brands.map(function (b) { return "<span>" + esc(b) + "</span>"; }).join("");
    $("#dirTitle").innerHTML = th("Популярное: " + d.name.toLowerCase());
    $("#dirOther").innerHTML = window.DIRS.filter(function (x) { return x.id !== d.id; }).slice(0, 4).map(dirTile).join("");
    $("#dirSrc").textContent = "Источник: " + d.src + ".";
  }

  // Каталог: направление, поиск, цена, сортировка
  function catalog() {
    var list = $("#catalogList");
    if (!list) return;
    var params = new URLSearchParams(location.search);
    var state = { d: params.get("d") || "all", q: "", sort: "def", price: "all" };
    var fl = $("#fDirs");
    fl.innerHTML = '<button data-d="all">Все направления <span>' + window.ITEMS.length + "</span></button>" + window.DIRS.map(function (d) {
      return '<button data-d="' + d.id + '">' + t(d.name) + " <span>" + window.ITEMS.filter(function (i) { return i.dir === d.id; }).length + "</span></button>";
    }).join("");
    function draw() {
      $$("button", fl).forEach(function (c) { c.classList.toggle("on", c.dataset.d === state.d); });
      $$("#fPrice button").forEach(function (c) { c.classList.toggle("on", c.dataset.p === state.price); });
      var q = state.q.trim().toLowerCase();
      var items = window.ITEMS.filter(function (i) {
        var p = i.price;
        var okPrice = state.price === "all" || (state.price === "lo" && p && p < 2000) || (state.price === "mid" && p >= 2000 && p <= 10000) || (state.price === "hi" && p > 10000);
        return (state.d === "all" || i.dir === state.d) && okPrice &&
          (!q || (i.name + " " + i.short + " " + i.brand).toLowerCase().indexOf(q) >= 0);
      });
      if (state.sort === "asc") items.sort(function (a, b) { return (a.price || 1e9) - (b.price || 1e9); });
      if (state.sort === "desc") items.sort(function (a, b) { return b.price - a.price; });
      list.innerHTML = items.map(card).join("");
      $("#empty").style.display = items.length ? "none" : "block";
      $("#count").textContent = items.length + " " + plural(items.length, "позиция", "позиции", "позиций");
      var d = dirById(state.d);
      $("#catTitle").textContent = T(d ? d.name : "Каталог материалов");
      $$(".reveal", list).forEach(function (e) { e.classList.add("in"); });
    }
    fl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { state.d = b.dataset.d; draw(); } });
    $("#fPrice").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { state.price = b.dataset.p; draw(); } });
    $("#q").addEventListener("input", function (e) { state.q = e.target.value; draw(); });
    $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; draw(); });
    draw();
  }

  // Карточка товара
  function item() {
    var box = $("#item");
    if (!box) return;
    var it = byId(new URLSearchParams(location.search).get("id")) || window.ITEMS[0];
    var d = dirById(it.dir);
    document.title = it.name + " — МАРТдекор";
    var calc = "";
    if (it.calc) {
      var q = it.calc.type === "len" ? "Длина стен по периметру, м" : "Площадь стены, м²";
      calc = '<div class="calc"><h4><i class="ti ti-calculator"></i>' + t("Сколько нужно?") + '</h4><div class="calc-row"><input id="calcIn" type="number" min="1" step="0.5" value="' + (it.calc.type === "len" ? 16 : 12) + '" aria-label="' + q + '"><span class="small muted">' + t(q) + '</span></div><p class="calc-res" id="calcRes" style="margin:12px 0 0"></p></div>';
    }
    var styles = window.STYLES.filter(function (s) { return s.items.indexOf(it.id) >= 0; });
    box.innerHTML =
      '<div class="crumbs"><a href="index.html">Главная</a> / <a href="napravlenie.html?id=' + d.id + '">' + t(d.name) + "</a> / " + t(it.name) + "</div>" +
      '<div class="item-grid"><div class="item-photos"><div class="ph ' + d.tx + '"><span class="ph-cap"><i class="ti ti-photo"></i>' + t("фото товара крупно") + '</span></div><div class="thumbs"><div class="ph ' + d.tx + '"></div><div class="ph tx-salon"></div><div class="ph ' + d.tx + '"></div></div></div>' +
      "<div>" + (it.brand ? '<div class="item-brand">' + esc(it.brand) + "</div>" : "") + '<h1 style="font-size:clamp(34px,4vw,50px);margin-top:6px">' + t(it.name) + '</h1><p class="lead">' + t(it.short) + "</p>" +
      '<div style="margin:18px 0 22px">' + priceHtml(it, true) + "</div>" +
      '<div class="btns"><button class="btn btn-main" data-add="' + it.id + '"><i class="ti ti-bookmark-plus"></i>В подборку</button><a class="btn btn-line" href="' + TG + '"><i class="ti ti-brand-telegram"></i>Узнать наличие</a></div>' +
      calc +
      '<ul class="ul-check"><li><i class="ti ti-check"></i>' + t("Менеджер проверит наличие и посчитает количество с запасом") + '</li><li><i class="ti ti-check"></i>' + t("Образец можно посмотреть в салоне или взять на объект") + '</li><li><i class="ti ti-check"></i>' + t("Доставка по Ростову — Яндекс Go, по России — транспортной компанией") + "</li></ul>" +
      '<table class="specs">' + it.specs.map(function (p) { return "<tr><td>" + t(p[0]) + "</td><td>" + t(p[1]) + "</td></tr>"; }).join("") + "</table>" +
      (it.need ? '<div class="need"><b>Нужно от вас:</b> ' + t(it.need) + ".</div>" : "") +
      '<div class="src-note">Источник: ' + t(it.src) + ".</div></div></div>";
    if (it.calc) {
      var inp = $("#calcIn"), res = $("#calcRes");
      var upd = function () {
        var v = parseFloat(inp.value) || 0, need = v * 1.1, n;
        if (it.calc.type === "area" || (it.calc.type === "len" && it.calc.per === 1)) { n = Math.ceil(need); }
        else { n = Math.ceil(need / it.calc.per); }
        var unitWord = it.calc.type === "area" ? "м²" : it.calc.type === "roll" ? plural(n, "рулон", "рулона", "рулонов") : it.calc.type === "len" && it.calc.per === 1 ? "пог. м" : "шт.";
        res.innerHTML = t("С запасом 10%: ") + "<b>" + n + " " + unitWord + "</b>" + (it.price ? t(" · примерно ") + "<b>" + money(n * it.price) + "</b>" : "") + '<br><span class="small muted">' + t("Точный расчёт с учётом раппорта и подрезки сделает менеджер.") + "</span>";
      };
      inp.addEventListener("input", upd); upd();
    }
    var with_ = [];
    styles.forEach(function (s) { s.items.forEach(function (id) { if (id !== it.id && with_.indexOf(id) < 0) with_.push(id); }); });
    window.ITEMS.forEach(function (i) { if (i.dir === it.dir && i.id !== it.id && with_.indexOf(i.id) < 0) with_.push(i.id); });
    $("#more").innerHTML = with_.slice(0, 4).map(function (id) { return card(byId(id)); }).join("");
    $("#moreTitle").innerHTML = th(styles.length ? "С чем сочетается — стиль «" + styles[0].name + "»" : "Ещё в разделе «" + d.name + "»");
  }

  // Подборка
  function podborka() {
    var box = $("#pickList");
    if (!box) return;
    function draw() {
      var o = pick.get(), ids = Object.keys(o).filter(byId), sum = 0, noPrice = 0;
      box.innerHTML = ids.map(function (id) {
        var it = byId(id), q = o[id];
        if (it.price) sum += it.price * q; else noPrice++;
        return '<div class="pick"><div class="ph ' + dirById(it.dir).tx + '"></div><div><h3><a href="item.html?id=' + id + '">' + t(it.name) + "</a></h3>" + priceHtml(it) + '<br><button class="rm" data-rm="' + id + '">Убрать</button></div><div class="qty"><button data-q="' + id + '" data-v="-1">−</button><span>' + q + '</span><button data-q="' + id + '" data-v="1">+</button></div></div>';
      }).join("");
      $("#pickEmpty").style.display = ids.length ? "none" : "block";
      $("#pickSide").style.display = ids.length ? "block" : "none";
      $("#pickSum").textContent = "≈ " + money(sum);
      $("#pickCount").textContent = ids.length + " " + plural(ids.length, "позиция", "позиции", "позиций") + (noPrice ? T(", " + noPrice + " — цена по запросу") : "");
      $("#pickHidden").value = ids.map(function (id) { return byId(id).name + " × " + o[id]; }).join("; ");
    }
    box.addEventListener("click", function (e) {
      var o = pick.get(), b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.rm) delete o[b.dataset.rm];
      if (b.dataset.q) { o[b.dataset.q] = Math.max(1, o[b.dataset.q] + +b.dataset.v); }
      pick.set(o); draw();
    });
    draw();
  }

  // Статья
  function article() {
    var box = $("#article");
    if (!box) return;
    var id = new URLSearchParams(location.search).get("id");
    var a = window.ARTICLES.filter(function (x) { return x.id === id; })[0] || window.ARTICLES[0];
    document.title = a.title + " — МАРТдекор";
    box.innerHTML = '<div class="crumbs"><a href="index.html">Главная</a> / Советы</div><div class="eyebrow">Совет салона</div><h1 style="font-size:clamp(36px,5vw,54px)">' + t(a.title) + '</h1><p class="lead">' + t(a.lead) + '</p><div class="ph tx-lepnina" style="height:360px;margin:30px 0"><span class="ph-cap"><i class="ti ti-photo"></i>' + t("фото из салона") + "</span></div>" +
      a.body.map(function (p) { return "<p>" + t(p) + "</p>"; }).join("") +
      '<div class="btns" style="margin-top:30px"><a class="btn btn-main" href="index.html#podbor">Подобрать материалы</a><a class="btn btn-line" href="catalog.html">В каталог</a></div>' +
      '<div class="src-note">Источник: ' + t(a.src) + "</div>";
  }

  // Все формы — демо: показываем «спасибо»
  function forms() {
    $$("form[data-demo]").forEach(function (f) {
      var file = $("input[type=file]", f), fl = $(".file span", f);
      if (file) file.addEventListener("change", function () { if (file.files.length) fl.textContent = "Прикреплено: " + file.files[0].name; });
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        f.style.display = "none";
        var th = f.parentNode.querySelector(".thanks");
        if (th) th.style.display = "block";
        if (f.dataset.demo === "pick") pick.set({});
      });
    });
  }

  function reveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .1 });
    els.forEach(function (e) { io.observe(e); });
  }

  header(); footer(); home(); direction(); catalog(); item(); podborka(); article(); forms(); hoursTable(); reveal();
})();
