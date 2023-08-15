import React, { useEffect } from 'react';
import { Chevron } from '../Chevron';
import * as styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function GTranslateGetCurrentLang() {
  var keyValue = document['cookie'].match('(^|;) ?googtrans=([^;]*)(;|$)');
  return keyValue ? keyValue[2].split('/')[2] : null;
}
function GTranslateFireEvent(element, event) {
  try {
    if (document.createEventObject) {
      var evt = document.createEventObject();
      element.fireEvent('on' + event, evt);
    } else {
      var evt = document.createEvent('HTMLEvents');
      evt.initEvent(event, true, true);
      element.dispatchEvent(evt);
    }
  } catch (e) {}
}

const Translate = () => {
  const doGTranslate = lang_pair => {
    if ('target' in lang_pair) lang_pair = event.target;
    if ('value' in lang_pair) lang_pair = lang_pair.value;
    if (lang_pair == '') return;
    var lang = lang_pair?.split('|')[1];
    if (GTranslateGetCurrentLang() == null && lang == lang_pair?.split('|')[0])
      return;
    if (typeof ga != 'undefined') {
      ga(
        'send',
        'event',
        'GTranslate',
        lang,
        location.hostname + location.pathname + location.search
      );
    } else {
      if (typeof _gaq != 'undefined')
        _gaq.push([
          '_trackEvent',
          'GTranslate',
          lang,
          location.hostname + location.pathname + location.search,
        ]);
    }
    var teCombo = document.querySelector('select.goog-te-combo');

    if (
      document.getElementById('google_translate_element2') == null ||
      document.getElementById('google_translate_element2').innerHTML.length ==
        0 ||
      teCombo.length == 0 ||
      teCombo.innerHTML.length == 0
    ) {
      setTimeout(function () {
        doGTranslate(lang_pair);
      }, 500);
    } else {
      teCombo.value = lang;
      GTranslateFireEvent(teCombo, 'change');
      GTranslateFireEvent(teCombo, 'change');
    }
  };

  useEffect(() => {
    window.googleTranslateElementInit2 = () => {
      new google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element2'
      );
    };

    const script = document.createElement('script');
    script.src =
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';

    document.head.appendChild(script);
  }, []);

  return (
    <>
      <div id="translate-widget">
        <select
          onChange={doGTranslate}
          className="notranslate"
          id="gtranslate_selector"
        >
          <option value="en|en">English</option>
          <option value="en|bg">Български</option>
          <option value="en|fr">Français</option>
          <option value="en|es">Español</option>
          <option value="en|it">Italiano</option>
          <option value="en|de">Deutsch</option>
          <option value="en|nl">Nederlands</option>
          <option value="en|af">Afrikaans</option>
          <option value="en|sq">Shqip</option>
          <option value="en|am">አማርኛ</option>
          <option value="en|ar">العربية</option>
          <option value="en|hy">Հայերեն</option>
          <option value="en|az">Azərbaycan dili</option>
          <option value="en|eu">Euskara</option>
          <option value="en|be">Беларуская мова</option>
          <option value="en|bn">বাংলা</option>
          <option value="en|bs">Bosanski</option>
          <option value="en|ca">Català</option>
          <option value="en|ceb">Cebuano</option>
          <option value="en|ny">Chichewa</option>
          <option value="en|zh-CN">简体中文</option>
          <option value="en|zh-TW">繁體中文</option>
          <option value="en|co">Corsu</option>
          <option value="en|hr">Hrvatski</option>
          <option value="en|cs">Čeština</option>
          <option value="en|da">Dansk</option>
          <option value="en|eo">Esperanto</option>
          <option value="en|et">Eesti</option>
          <option value="en|tl">Filipino</option>
          <option value="en|fi">Suomi</option>
          <option value="en|fy">Frysk</option>
          <option value="en|gl">Galego</option>
          <option value="en|ka">ქართული</option>
          <option value="en|el">Ελληνικά</option>
          <option value="en|gu">ગુજરાતી</option>
          <option value="en|ht">Kreyol ayisyen</option>
          <option value="en|ha">Harshen Hausa</option>
          <option value="en|haw">Ōlelo Hawaiʻi</option>
          <option value="en|iw">עִבְרִית</option>
          <option value="en|hi">हिन्दी</option>
          <option value="en|hmn">Hmong</option>
          <option value="en|hu">Magyar</option>
          <option value="en|is">Íslenska</option>
          <option value="en|ig">Igbo</option>
          <option value="en|id">Bahasa Indonesia</option>
          <option value="en|ga">Gaelige</option>
          <option value="en|ja">日本語</option>
          <option value="en|jw">Basa Jawa</option>
          <option value="en|kn">ಕನ್ನಡ</option>
          <option value="en|kk">Қазақ тілі</option>
          <option value="en|km">ភាសាខ្មែរ</option>
          <option value="en|ko">한국어</option>
          <option value="en|ku">كوردی</option>
          <option value="en|ky">Кыргызча</option>
          <option value="en|lo">ພາສາລາວ</option>
          <option value="en|la">Latin</option>
          <option value="en|lv">Latviešu valoda</option>
          <option value="en|lt">Lietuvių kalba</option>
          <option value="en|lb">Lëtzebuergesch</option>
          <option value="en|mk">Македонски јазик</option>
          <option value="en|mg">Malagasy</option>
          <option value="en|ms">Bahasa Melayu</option>
          <option value="en|ml">മലയാളം</option>
          <option value="en|mt">Maltese</option>
          <option value="en|mi">Te Reo Māori</option>
          <option value="en|mr">मराठी</option>
          <option value="en|mn">Монгол</option>
          <option value="en|my">ဗမာစာ</option>
          <option value="en|ne">नेपाली</option>
          <option value="en|no">Norsk bokmål</option>
          <option value="en|ps">پښتو</option>
          <option value="en|fa">فارسی</option>
          <option value="en|pl">Polski</option>
          <option value="en|pt">Português</option>
          <option value="en|pa">ਪੰਜਾਬੀ</option>
          <option value="en|ro">Română</option>
          <option value="en|ru">Русский</option>
          <option value="en|sm">Samoan</option>
          <option value="en|gd">Gàidhlig</option>
          <option value="en|sr">Српски језик</option>
          <option value="en|st">Sesotho</option>
          <option value="en|sn">Shona</option>
          <option value="en|sd">سنڌي</option>
          <option value="en|si">සිංහල</option>
          <option value="en|sk">Slovenčina</option>
          <option value="en|sl">Slovenščina</option>
          <option value="en|so">Afsoomaali</option>
          <option value="en|su">Basa Sunda</option>
          <option value="en|sw">Kiswahili</option>
          <option value="en|sv">Svenska</option>
          <option value="en|tg">Тоҷикӣ</option>
          <option value="en|ta">தமிழ்</option>
          <option value="en|te">తెలుగు</option>
          <option value="en|th">ไทย</option>
          <option value="en|tr">Türkçe</option>
          <option value="en|uk">Українська</option>
          <option value="en|ur">اردو</option>
          <option value="en|uz">O‘zbekcha</option>
          <option value="en|vi">Tiếng Việt</option>
          <option value="en|cy">Cymraeg</option>
          <option value="en|xh">isiXhosa</option>
          <option value="en|yi">יידיש</option>
          <option value="en|yo">Yorùbá</option>
          <option value="en|zu">Zulu</option>
        </select>
        <Chevron down className={cx('chevron')} />
        <div id="google_translate_element2">
          <div className="skiptranslate goog-te-gadget" dir="ltr">
            <div id=":0.targetLanguage"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Translate };
