const _ = require('lodash');

const itemSchema = require('../../models/item');
const tagSchema = require('../../models/tag');

const createSubmenu = (menuID, submenuName) =>
  new Promise((resolve, reject) => {
    tagSchema.findOneAndUpdate({ _id: menuID }, { $push: { submenus: submenuName } },
      (err) => {
        if (err) {
          console.log(`ERROR: ${err}`);
          return reject(err);
        }
        return resolve();
      });
  });

const deleteSubmenu = (menuID, submenuName) =>
  new Promise((resolve, reject) => {
    tagSchema.findById(menuID, (findErr, menu) => {
      if (findErr) {
        return reject(findErr);
      }
      const menuRef = menu;
      menuRef.submenus = _.reject(menuRef.submenus, submenu => submenu === submenuName);
      menu.save((saveErr) => {
        if (saveErr) {
          return reject(saveErr);
        }
        return resolve();
      });
    });
  });

const findAllMenus = clientID =>
  new Promise((resolve, reject) => {
    tagSchema.find({ clientID }, {}, (err, tags) => {
      if (err) {
        return reject(err);
      }
      return resolve(tags);
    });
  });

const findAllMenuItems = clientID =>
  new Promise((resolve, reject) => {
    itemSchema.find({ clientID }, {}, (err, items) => {
      if (err) {
        return reject(err);
      }
      const sortedItems = _.sortBy(items, ['order']);
      return resolve(sortedItems);
    });
  });

module.exports = {
  createSubmenu,
  deleteSubmenu,
  findAllMenus,
  findAllMenuItems,
};
