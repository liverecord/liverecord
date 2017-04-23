<div class="flex-column">
  <div class="wrapper welcome">
    <div id="topic">
      <h1>Добро пожаловать на форум СПО!</h1>
      <p>Наш проект посвящен любым проектам с открытым исходным кодом или просто свободным программам.
        Мы приветствуем такие проекты как Linux, FreeBSD, ReactOS, Android.</p>
      <div ng-if="user">
        <a ng-click="logout()" href="/">Выйти</a>
      </div>
      <div ng-if="!user">
        <p>Если вы программист, системный администратор или просто интересуетесь свободными программами -
          присоединяйтесь.</p>
        <p>Если вы разрабатываете любой другой проект с открытым исходным кодом и хотите о нем рассказать -
          присоедняйтесь.</p>
        <p>Если вы разрабатываете железо, разного рода Open Hardware, мы вас тоже приглашаем присоединиться.</p>
        <users-login-form user="user"></users-login-form>
      </div>
      <h5>Новичкам</h5>
      <p>Cвободные программы - это программы, которые дают человеку право на свою установку, использование, изучение,
        изменение и распространение.</p>
      <h6>Примеры свободных операционных систем</h6>
      <ul class="small">
        <li>386BSD, FreeBSD, FreeDOS, GNU Hurd, Linux, MenuetOS, NetBSD, OpenBSD, OpenIndiana, OpenSolaris</li>
      </ul>
      <h6>Примеры свободных программ</h6>
      <ul class="small">
        <li>Обработка графики
          Blender, Cinelerra, CinePaint (en), GIMP, Hugin, Inkscape, Krita, Paint.NET, QCad, Sodipodi
        </li>
        <li>Браузеры, чаты:
          Chromium, FileZilla, Jabber, Miranda IM, Mozilla, Mozilla Firefox, Mozilla Thunderbird, Pidgin, Psi, Simple
          Instant Messenger, QuteCom (en, uk), WinSCP
        </li>
        <li>
          Ardour, Audacity, aRts, JACK, mpg123, XMMS, Zinf
          Amarok, FLAC, Kaffeine, LAME, MPlayer, MythTV, Ogg, Theora, Медиапроигрыватель VLC, Vorbis, Xine, Xvid, Media
          Player Classic
        </li>
        <li>Игры
          Battle for Wesnoth, BZFlag, Crossfire, FlightGear, Freeciv, Nexuiz, OpenArena, Scorched 3D, SuperTux,
          Tremulous, Tux Racer, Warzone 2100
        </li>
        <li>Управление сайтом: Drupal, Joomla, MediaWiki, ModX, OpenCart, Plone, TYPO3, WordPress, XOOPS</li>
        <li>Офисные и издательские программы:
          Latex, LibreOffice, OpenOffice.org, KOffice, GNOME Office, FreeMind, PDFCreator, Scribus
        </li>
        <li>Антивирусы и безопастность
          ClamAV, dm-crypt (en), Freenet, FreeOTFE, GNU Privacy Guard, Nmap, OpenSSH, Tor, TrueCrypt, Wireshark,
          ZoneMinder
        </li>
        <li>Корпоративные системы, базы данных, хранилища:
          Alfresco, Apache, Asterisk, iFolder (en), LAMP, MEAN, MySQL, PostgreSQL, FreeNAS, Firebird, Samba, Postfix,
          Sendmail, Tomcat, Zope, Open-XChange (en), OpenLDAP
        </li>
        <li>Инструменты разработки:
          Eclipse, KDevelop, Code::Blocks, CVS, Subversion, Git, GNU Compiler Collection, Ant, Apache Maven, Make, GTK,
          Qt, Mono, Motif, wxWidgets, Simple DirectMedia Layer
        </li>
      </ul>
      <h6>Правила</h6>
      <p>У нас банят за неадекватность и спам.</p>
      <p>Если есть вопрос не по теме, задавайте его в категории <a href="/random">Разное</a>.</p>
      <hr>
      <h6>Технические требования</h6>
      <p>Наш сайт использует передовые и частично экспериментальные технологии, поэтому мы не может гарантировать
        корректную работу в старых или редких браузерах.</p>
      <div class="small">
        <p>Минимально необходимые технологии</p>
        <ul>
          <li>HTML5</li>
          <li>Javascript</li>
          <li>WebSockets</li>
          <li>Push API</li>
          <li>WebWorkers</li>
        </ul>
        <p>Мы не поддерживаем Internet Explorer.</p>
      </div>
    </div>
  </div>
</div>
