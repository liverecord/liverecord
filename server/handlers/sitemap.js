/**
 * Created by zoonman on 12/26/16.
 */

const natural = require('natural');
const purify = require('./purify');
const mailer = require('./mailer');

const Topic = require('../schema').Topic;
const TOPICS_PER_PAGE = 100;

function tag(tag, content) {
  return '<' + tag + '>' + content + '</' + tag + '>';
}

module.exports.router = function(req, res, next) {
  "use strict";

  var d = new Date(); // Today!
  d.setMonth(d.getMonth() - 1);

  Topic.find({updated: {$gte: d}, spam: false, private: false, deleted: false})
      .sort({updated: -1})
      .limit(TOPICS_PER_PAGE)
      .select('slug category created updated')
      .populate('category')
      .lean()
      .exec(function(err, data) {
            if (err) {
              handleError(err);
            } else {
              if (data) {
                res.writeHead(200, {
                      'Content-Type': 'text/xml;charset: utf8'
                    }
                );
                res.write('<?xml version="1.0" encoding="UTF-8"?>');
                res.write(
                    '<urlset ' +
                    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                );
                data.forEach(function(item) {
                  if (
                      item && item.category && item.category.slug && item.slug
                  ) {
                        res.write(tag(
                            'url',
                                tag('loc',
                                    'https://' +
                                    process.env.npm_package_config_server_name +
                                    '/' +
                                    item.category.slug + '/' +
                                    item.slug
                                ) +
                                tag('lastmod', item.updated.toISOString()) +
                                tag('priority', 0.5) +
                                tag('changefreq', 'daily')
                            )
                        );
                      }
                });
                res.write('</urlset>');
                res.end();
              }
            }
          }
      );
};
