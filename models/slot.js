const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const DocumentSchema = schema({
        date: {
                type: Date,
        },
        from: {
                type: Date,
        },
        to: {
                type: Date,
        },
        isBooked: {
                type: Boolean,
                default: false,
        }
}, { timestamps: true });

DocumentSchema.plugin(mongoosePaginate);
DocumentSchema.methods.divideSlot = async function () {
        if (!this.divided) {
                const fromTime = new Date(this.from);
                const toTime = new Date(this.to);
                const halfHour = 15 * 60 * 1000;
                const middleTime = new Date(fromTime.getTime() + halfHour);
                const firstHalfSlot = new this.constructor({
                        date: this.date,
                        from: this.from,
                        to: middleTime.toISOString(),
                        divided: true,
                });
                const secondHalfSlot = new this.constructor({
                        date: this.date,
                        from: middleTime.toISOString(),
                        to: this.to,
                        divided: true,
                });
                await firstHalfSlot.save();
                await secondHalfSlot.save();
                this.divided = true;
                await this.save();
        }
};
module.exports = mongoose.model("slot", DocumentSchema);
