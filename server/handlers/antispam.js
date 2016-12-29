/**
 * Created by zoonman on 12/26/16.
 */

const natural = require('natural');
const purify = require('./purify');
const mailer = require('./mailer');


const ClassifierModel = require('../schema').Classifier;
const CommentModel = require('../schema').Comment;

natural.PorterStemmerRu.attach();

const classifierName = 'BayesAntiSpam';
var classifier;

function initFirstSpamClassifier(classifier) {
    classifier.stemmer = natural.PorterStemmerRu;

    classifier.addDocument('Скачать MacKeeper', 'spam'); // 1 = spam
    classifier.addDocument('Скачать Mail.ru Agent', 'spam'); // 1 = spam
    classifier.addDocument('Накрутка лайков', 'spam'); // 1 = spam
    classifier.addDocument('Накрутить лайки', 'spam'); // 1 = spam
    classifier.addDocument('Присоединяйтесь к нам в ВК >>>', 'spam'); // 1 = spam
    classifier.addDocument('Присоединяйтесь к нам в Facebook >>>', 'spam'); // 1 = spam
    classifier.addDocument('натуральный комплекс веществ, состоящий из природных компонентов >>>', 'spam'); // 1 = spam
    classifier.addDocument('для суставов из уникальных пант канадского марала', 'spam'); // 1 = spam
    classifier.addDocument('Черная и Красная икра доставим домой и в офис >>>', 'spam'); // 1 = spam
    classifier.addDocument('Венера Мухамедовна Абдуллаева    Директор ООО «СЕРТ Академия» в г. Казань    Телефон: (843) 514-76-32, (843) 524-72-19, 8(917)281-28-19    E-mail: russia@cert-academy.org', 'spam'); // 1 = spam
    classifier.addDocument('Как дела?', 'ok'); // 0 - not spam
    classifier.addDocument('Да', 'ok');
    classifier.addDocument('Нет', 'ok');
    classifier.addDocument('Буду', 'ok');
    classifier.addDocument('Ок', 'ok');
    classifier.addDocument('OK', 'ok');
    classifier.addDocument('Хорошо', 'ok');
    classifier.addDocument('Как сделать?', 'ok');
    classifier.addDocument('Накрутка виток к витку', 'ok'); // 0 - not spam
    classifier.addDocument('Я пользуюсь fastvps уже наверно больше 5 лет на маленьких и средних проектах. Из проблем могу только вспомнить DDOS их DNS, но меня он не задел. Техподдержка у них отличная, всегда помогали. Даунтаймы у них всегда плановые и короткие, они предупреждают о них заранее. Держал у них dedicated, там аптайм был почти два года, пока сам не перезагрузил.        По поводу производительности ничего не могу сказать, т.к. не мониторил, но скомпилить что-нибудь вместе с тем что-бы отдавать что-нибудь через LAMP хватает. Сейчас у меня EVO-8-SSD и с десяток сайтов вашего размера на нем крутится. Проекты разные, софт примерно такой PHP, MySQL, MongoDB, Ruby on Rails, Node.js, и рассыпуха всякая вроде почты, gearman, memcached и т.д.. ', 'ok'); // 0 - not spam
    classifier.addDocument('Использовать спарсенные данные не выйдет. Вам нужно использовать Lookalike аудиторию своего сайта. ', 'ok'); // 0 - not spam
    classifier.addDocument('https://developers.facebook.com/docs/messenger-platform/send-api-reference', 'ok'); // 0 - not spam
    classifier.addDocument('Не используйте изображение во фрейме. Иначе не будет работать. Можно решить проксируя все запросы через свой сервер. ', 'ok'); // 0 - not spam
    console.log('training is running...');
    registerSpamClassifierSaver(classifier);
    classifier.train();
}

function registerSpamClassifierSaver(classifier) {
    classifier.stemmer = natural.PorterStemmerRu;

    classifier.events.on('doneTraining', function(obj) {
        console.log('training is done!', obj);
        ClassifierModel.update(
            {
                classifier: classifierName
            },
            {
                $set: {
                    data: JSON.stringify(classifier)
                }
            },
            {upsert: true}
        ).exec();
    });
}

ClassifierModel.findOne({classifier: classifierName}).then(function(doc) {
    console.log('edoc', doc);
    if (doc) {
        classifier = natural.BayesClassifier.restore(JSON.parse(doc.data));
        registerSpamClassifierSaver(classifier);
    } else {
        classifier = new natural.BayesClassifier();
        initFirstSpamClassifier(classifier);
    }
}).catch(function(e) {
    console.log('e', e);
    classifier = new natural.BayesClassifier();
    initFirstSpamClassifier(classifier);
});

module.exports.getClassifications = function(text) {
    return classifier.getClassifications(text);
};

module.exports.isSpam = function(text) {
    var cls = classifier.getClassifications(text);
    console.log('Classifier:', cls);

    return (classifier.classify(text) === 'spam');
};

module.exports.processComment = function(savedComment) {

    var r = purify(savedComment.body, true);


    var classifications = classifier.getClassifications(r);
    var html = '<p>' + savedComment.body + '</p><hr>';

    html += '<table border="1" style="border-collapse: collapse;border-color: #8fa1b4" cellpadding="5" cellspacing="0">';

    if (classifications) {
        var url = 'http://'+ process.env.npm_package_config_server_host +':';
        url += process.env.npm_package_config_server_port + '/admin/teach/comments/' ;
        url += savedComment._id + '/';
        classifications.forEach(function(item) {
            html += '<tr>';
            html += '<td><a href="'+url + '' + item.label + '">' + item.label + '</a></td>';
            html += '<td>' + item.value + '</td>';
            html += '</tr>';
        });
    }
    html += '</table>';

    {
        //return fn({error: 'spam'});
        mailer({
            to: 'zoonman@gmail.com',
            subject: 'LQ Bayes',
            text: r,
            html: html
        });
    }
};


module.exports.router = function (req, res, next) {
    "use strict";

    if (req.params.hasOwnProperty('comment')) {

        CommentModel.findOne({_id: req.params.comment}).then(function(comment) {
            if (comment) {

                var commentText = purify(comment.body, true);
                classifier.addDocument(commentText, req.params.label);
                classifier.retrain();

                if (req.params.label === 'spam') {
                    comment.spam = true;
                    comment.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                //
                res.writeHead(200, {
                    "Content-Type": "text/javascript"
                });
                res.write('{"success":"true"}');
                res.end();
            } else {
                res.writeHead(404, {
                    "Content-Type": "text/javascript"
                });
                res.write('{"success":"false"}');
                res.end();

            }
        });

    }
    else {
        next();
    }
};
