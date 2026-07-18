// namespace: components/settings/github-syncer/sections/ConnectedSection
export default {
  'index.syncerConnected': 'Синхронизатор подключён',
  'dangerZoneSection.pauseSyncer': 'Приостановить синхронизатор',
  'dangerZoneSection.wantToPause': 'Хотите приостановить синхронизатор на время?',
  'dangerZoneSection.useButtonBelow':
    'Используйте кнопку ниже. Вы можете снова запустить его в любой момент.',
  'dangerZoneSection.disconnectSyncer': 'Отключить синхронизатор',
  'dangerZoneSection.wantToDisconnect':
    'Хотите отключить синхронизатор от вашего репозитория GitHub? Используйте кнопку ниже.',
  'dangerZoneSection.noteWillDeleteSettings':
    '<strong>Примечание: </strong> Это также удалит все настройки на этой странице, поэтому, пожалуйста, вручную сохраните все настройки, которые вы захотите использовать в будущем (например, ваш шаблон пути).',
  'dangerZoneSection.disconnectGithub': 'Отключить GitHub',
  'dangerZoneSection.areYouSureDisconnect':
    'Вы уверены, что хотите отключить ваш репозиторий GitHub?',
  'dangerZoneSection.thisActionCannotUndone': 'Это действие нельзя отменить.',
  'dangerZoneSection.disconnectSyncerConfirm': 'Отключить синхронизатор',
  'dangerZoneSection.cancel': 'Отмена',
  'fileStructureSection.fileStructure': 'Структура файлов',
  'fileStructureSection.configureFolderStructure':
    'Используйте эту опцию, чтобы настроить структуру папок для вашего репозитория.',
  'fileStructureSection.placeholderValues':
    'Вы можете использовать следующие подстановочные значения, которые будут подставлены для каждого коммита:',
  'fileStructureSection.trackSlug':
    '<code>$track_slug</code>: Слаг трека (например, "csharp").',
  'fileStructureSection.trackTitle':
    '<code>$track_title</code>: Название трека (например, "C#")',
  'fileStructureSection.exerciseSlug':
    '<code>$exercise_slug</code>: Слаг упражнения (например,  "hello-world")',
  'fileStructureSection.exerciseTitle':
    '<code>$exercise_title</code>: Название упражнения (например, "Hello World")',
  'fileStructureSection.iterationIdx':
    '<code>$iteration_idx</code>: Индекс итерации упражнения (например, "1")',
  'fileStructureSection.note1YourPath':
    '<strong>Примечание 1:</strong> Ваш путь должен содержать подстановку трека (<code>$track_slug</code> или <code>$track_title</code>) и подстановку упражнения ( <code>$exercise_slug</code> или <code>$exercise_title</code>.',
  'fileStructureSection.note2Iteration':
    '<strong>Примечание 2:</strong> Подстановка <code>$iteration_idx</code> необязательна, но если вы её пропустите, каждая итерация будет перезаписывать предыдущую. Это позволяет использовать Git для контроля версий ваших решений. Включение индекса итерации приведёт к созданию отдельной папки для каждой итерации.',
  'fileStructureSection.pathTemplateMustInclude':
    'Ваш шаблон пути должен включать либо <code>$track_slug</code>, либо <code>$track_title</code>, и либо <code>$exercise_slug</code>, либо <code>$exercise_title</code>.',
  'fileStructureSection.saveChanges': 'Сохранить изменения',
  'fileStructureSection.revertToDefault': 'Вернуть к значению по умолчанию',
  'fileStructureSection.areYouSureWantRevert':
    'Вы уверены, что хотите вернуть ваш шаблон пути к значению по умолчанию?',
  'fileStructureSection.revert': 'Вернуть',
  'fileStructureSection.cancel': 'Отмена',
  'statusSection.status':
    'Статус: <span style={{ color: textColor }}>{{status}}</span>',
  'statusSection.githubSyncerLinked':
    'Ваш синхронизатор GitHub связан с <code>{{repoFullName}}</code>.',
  'statusSection.enableSyncer': 'Включить синхронизатор',
  'statusSection.areYouSureResumeSyncing':
    'Вы уверены, что хотите возобновить синхронизацию решений с GitHub?',
  'statusSection.resume': 'Возобновить',
  'commitMessageTemplateSection.heading': 'Шаблон сообщения коммита',
  'commitMessageTemplateSection.intro':
    'Используйте эту опцию, чтобы определить, как должны выглядеть ваши сообщения коммитов и PR.',
  'commitMessageTemplateSection.placeholder_intro':
    'Вы можете использовать следующие подстановочные значения:',
  'commitMessageTemplateSection.placeholders.track_slug':
    'Слаг трека (например, "csharp").',
  'commitMessageTemplateSection.placeholders.track_title':
    'Название трека (например, "C#")',
  'commitMessageTemplateSection.placeholders.exercise_slug':
    'Слаг упражнения (например, "hello-world")',
  'commitMessageTemplateSection.placeholders.exercise_title':
    'Название упражнения (например, "Hello World")',
  'commitMessageTemplateSection.placeholders.iteration_idx':
    'Индекс итерации упражнения (например, "1")',
  'commitMessageTemplateSection.placeholders.sync_object':
    'Одно из "Iteration", "Solution", "Track" или "Everything" в зависимости от того, что синхронизируется.',
  'commitMessageTemplateSection.note.note': 'Примечание',
  'commitMessageTemplateSection.note.text':
    'Если ваше сообщение коммита содержит начальные или конечные слэши либо дефисы, они будут удалены. Несколько идущих подряд слэшей или дефисов будут сведены к одному.',
  'commitMessageTemplateSection.save_button': 'Сохранить изменения',
  'commitMessageTemplateSection.revert_button': 'Вернуть к значению по умолчанию',
  'commitMessageTemplateSection.confirm_modal.title':
    'Вы уверены, что хотите вернуть ваш шаблон сообщения коммита к значению по умолчанию?',
  'commitMessageTemplateSection.confirm_modal.confirm': 'Вернуть',
  'commitMessageTemplateSection.confirm_modal.cancel': 'Отмена',
  'processingMethodSection.processingMethod': 'Метод обработки',
  'processingMethodSection.commitDirectly': 'Коммитить напрямую',
  'processingMethodSection.createPullRequest': 'Создавать pull request',
  'processingMethodSection.whatIsTheName':
    'Как называется ваша основная ветка?',
  'processingMethodSection.ourBot':
    'Наш бот может коммитить напрямую в ваш репозиторий для полностью автоматической настройки, либо создавать pull request, который вы будете утверждать каждый раз. Какой метод вы предпочитаете?',
  'processingMethodSection.saveChange': 'Сохранить изменения',
  'justConnectedModal.repositoryConnected':
    'Репозиторий успешно подключён!',
  'justConnectedModal.accountConnected':
    'Мы подключили ваш аккаунт Exercism к выбранному вами репозиторию.',
  'justConnectedModal.happyWithDefaults':
    'Если вас устраивают значения по умолчанию, вы можете сделать резервную копию всего прямо сейчас. Или вы можете настроить параметры, а затем использовать кнопку внизу страницы настроек, чтобы сделать копию позже. Хотите сделать резервную копию всего сейчас?',
  'justConnectedModal.backUpEverythingNow': 'Сделать резервную копию всего сейчас',
  'justConnectedModal.backUpLater': 'Сделать копию позже',
  'manualSyncSection.backupTrack': 'Сделать резервную копию трека',
  'manualSyncSection.backupTrackInfo':
    'Если вы хотите сделать резервную копию трека на GitHub, вы можете воспользоваться этой функцией.',
  'manualSyncSection.pleaseUseSparing':
    '<strong className="font-medium">Примечание:</strong> Пожалуйста, используйте это умеренно, например, когда хотите сделать резервную копию трека в первый раз. Это не предназначено для регулярного использования и, скорее всего, приведёт к превышению лимитов при частом применении.',
  'manualSyncSection.selectTrackToBackup': 'Выберите трек для резервного копирования',
  'manualSyncSection.backupTrackButton': 'Сделать копию трека',
  'manualSyncSection.backupEverything': 'Сделать резервную копию всего',
  'manualSyncSection.backupEverythingInfo':
    'Если вы хотите сделать резервную копию всех ваших упражнений по всем трекам на GitHub, вы можете воспользоваться этой функцией.',
  'manualSyncSection.pleaseUseSparingBootstrap':
    '<strong className="font-medium">Примечание:</strong> Пожалуйста, используйте это умеренно, например, когда хотите инициализировать новый репозиторий. Это не предназначено для регулярного использования.',
  'manualSyncSection.backupEverythingButton': 'Сделать резервную копию всего',
  'iterationFilesSection.iterationFiles': 'Файлы итерации',
  'iterationFilesSection.whenSyncing':
    'При синхронизации вы хотите, чтобы все файлы упражнения (например, ваше решение, тесты, README, подсказки и т. д.) синхронизировались с GitHub, или только файлы вашего решения?',
  'iterationFilesSection.theFullExercise': 'Всё упражнение целиком',
  'iterationFilesSection.onlyMySolutionFiles': 'Только файлы моего решения',
  'iterationFilesSection.saveChanges': 'Сохранить изменения',
  'syncBehaviourSection.syncBehaviour': 'Поведение синхронизации',
  'syncBehaviourSection.chooseWhetherSyncing':
    'Выберите, должна ли синхронизация происходить автоматически при создании новой итерации, или вручную по вашему запросу. <strong>Автоматически</strong> поддерживает ваш репозиторий GitHub в актуальном состоянии, а <strong>вручную</strong> даёт вам полный контроль.',
  'syncBehaviourSection.automatic': 'Автоматически',
  'syncBehaviourSection.manual': 'Вручную',
}
