/**
 * Created by zoonman on 12/26/16.
 */

const httpUtils = require('../common/http');
const TopicSchema = require('../schema').Topic;
const TOPICS_PER_PAGE = 1000;
const errorHandler = require('./errors');

function tag(tag, content) {
  return '<' + tag + '>' + content + '</' + tag + '>';
}

module.exports.router = function(req, res, next) {
  'use strict';
  res.writeHead(200, {
        'Content-Type': 'text/xml;charset: utf8'
      }
  );
  res.write('<?xml version="1.0" encoding="UTF-8"?>');
  res.write(
      '<urlset ' +
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  );
  res.write(tag(
      'url',
          tag('loc',
              httpUtils.url('/')
          ) +
          tag('lastmod', new Date().toISOString()) +
          tag('priority', 1) +
          tag('changefreq', 'daily')
      )
  );
  let d = new Date(); // Today!
  d.setYear(d.getYear() - 1);

  TopicSchema
      .find({updated: {$gte: d}, spam: false, private: false, deleted: false})
      .sort({updated: -1, created: -1})
      .limit(TOPICS_PER_PAGE)
      .select('slug category created updated')
      .populate('category')
      .lean()
      .then(topics => {
        if (topics) {
          topics.forEach(topic => {
            if (topic && topic.category && topic.category.slug && topic.slug) {
              res.write(tag(
                  'url',
                      tag('loc',
                          httpUtils.url(
                              topic.category.slug + '/' +
                              topic.slug)
                      ) +
                      tag('lastmod', topic.updated.toISOString()) +
                      tag('priority', 0.5) +
                      tag('changefreq', 'daily')
                  )
              );
            }
          });
          res.write('</urlset>');
          res.end();
        } else {
          res.end();
        }
      })
      .catch(err => {
        res.end();
        errorHandler(err);
      });
};
