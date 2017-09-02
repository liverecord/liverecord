# LiveRecord

[![GitHub release](https://img.shields.io/github/release/liverecord/liverecord.svg)](https://github.com/liverecord/liverecord)
[![Build Status](https://travis-ci.org/liverecord/liverecord.svg?branch=master)](https://travis-ci.org/liverecord/liverecord)
[![Github All Releases](https://img.shields.io/github/downloads/liverecord/liverecord/total.svg)](https://github.com/liverecord/liverecord)
[![David](https://img.shields.io/david/liverecord/liverecord.svg)](https://github.com/liverecord/liverecord)
[![GitHub contributors](https://img.shields.io/github/contributors/liverecord/liverecord.svg)](http://github.com/liverecord/liverecord)

[English](README.md) | [**Русский**](README.ru.md)

Проект LiveRecord - это нечто среднее между форумом и обычным чатом.
Он может быть использован там, где нужно оперативное общение, 
например форум технической поддержки, 
обсуждение событий или новостей в режиме реального времени,
любые удаленные консультации, обучение, репетиторство, 
сервисы вроде вопрос-ответ. 
Также может быть использован докторами для разговоров с пациентами из удаленных мест.
 
 
[Демо](https://www.linuxquestions.ru/)

## Возможности

 - обсуждение вопросов в режиме реального времени (как в чате), но с сохранением результатов (как на форумах)
 - голосовое и видео общение 
 - обмен фотографиями, документами, файлами
 - удобный визуальный редактор тем и сообщений
 - уведомления в браузере и на почту
 - возможность создания как публичных обсуждений, так и закрытых
 - закрытые обсуждения могут быть как персональные, так и внутри группы

## Документация 

[Документация](https://liverecord.github.io/liverecord/)


### Установка

Существует 2 способа установки: 
 - быстрая, через Docker
 - [усложненная с настройкой](docs/configuration.md)


#### Быстрая установка через Docker контейнер

1. Установите [Docker](https://docs.docker.com/engine/installation/)
2. Установите [Docker Compose](https://docs.docker.com/compose/install/)
3. Клонируйте репозитарий и запустите команду `docker-compose up`. Нужно будет подождать, минут 5-10, зависит от Интернета и производительности вашего ПК. Откройте [localhost:8914](http://localhost:8914/).

Все готово.
