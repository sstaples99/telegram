var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var partySchema = new Schema({
    title: {type: String, default: "Untitled (new)"},
    clientID: {type: String, required: true},
    customer_name: {type: String, default: ""},
    customer_phone: {type: String, default: ""},
    customer_email: {type: String, default: ""},
    event_info: {
        description: {type: String, default: ""},
        date: {type: String, default: ""},
        location: {type: String, default: ""},
        num_guests: {
            adults: {type: Number, default: 0},
            kids: {type: Number, default: 0}
        }
    },
    drinks: {
        package_type: {type: String, default: ""},
        unit_price: {type: Number, default: 0},
        payment_method: {type: String, default: ""},
        other: {type: String, default: ""}
    },
    food: {
        package_type: {type: String, default: ""},
        serving_type: {type: String, default: ""},
        price: {
            tax_included: {type: Boolean, default: false},
            tip_included: {type: Boolean, default: false},
            adult: {type: Number, default: 0},
            kid: {type: Number, default: 0},
        },
        payment: {type: String, default: ""},
        food_selections: {type: Array, default: []},
    },
    linensOnTables: {type: Boolean, default: false},
    special_instructions: {type: String, default: ""},
    admin_info: {
        deposit_amt: {type: Number, default: 0},
        yelp: {type: Boolean, default: false}
    }
});

module.exports = mongoose.model('partie', partySchema);
