const express = require('express');
const router  = express.Router();
const cookieSession = require('cookie-session');
const { getHourMinute } = require('../server_scripts/getHourMinute')

module.exports = (db, io) => {
  router.get('/login', (req, res) => {
    res.render('employeeLogin');
  });

  router.get('/edit', (req, res) => {
    res.render('editMenu');
  });

  router.get('/', (req, res) => {
    const employee = req.session.employee;
    const newOrders = {};
    const oldOrders = {};

    if (!employee) {
      return res.redirect('/employee/login');
    }

    db.getIncomingOrders()
    .then(result => {
      result.forEach(item => {
        newOrders[item.orderid] = {
          items: {},
          message: item.message,
          time_created: getHourMinute(item.time_created),
        }
      })

      result.forEach(item => {
        newOrders[item.orderid] = {
          ...newOrders[item.orderid],
          items: {
            ...newOrders[item.orderid].items,
            [item.itemname]: item.itemquantity
          }
        }
      })

      db.getProcessedOrders()
      .then(result => {
        result.forEach(item => {
          oldOrders[item.orderid] = {
            items: {},
            estimated_pickup: item.estimated_pickup,
            message: item.message,
            time_created: getHourMinute(item.time_created),
          }

          let hour = oldOrders[item.orderid].estimated_pickup.slice(0,2);
          const minute = oldOrders[item.orderid].estimated_pickup.slice(3,5);
          const ampm = oldOrders[item.orderid].estimated_pickup.slice(5,7);
          if (ampm === 'pm') {
            hour = Number(hour) + 12;
          }

          oldOrders[item.orderid].estimated_pickup = `${hour}:${minute}`;
        })

        result.forEach(item => {
          oldOrders[item.orderid] = {
            ...oldOrders[item.orderid],
            items: {
              ...oldOrders[item.orderid].items,
              [item.itemname]: item.itemquantity
            }
          }
        })

        res.render('employeeIndex', {newOrders, oldOrders});
      })
      .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
  });


  router.post('/login', (req, res) => {
    const { employeeUsername, employeePassword } = req.body;
    if (employeeUsername === process.env.EMPLOYEE_USERNAME && employeePassword === process.env.EMPLOYEE_PASSWORD) {
      req.session.employee = true;
    } else {
      req.session.employee = null;
    }
    res.redirect('/employee');
  });


  router.get('/editmenu', (req, res) => {
    res.render('editMenu')
  })

  return router;
};
