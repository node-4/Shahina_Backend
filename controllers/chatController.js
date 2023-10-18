const chatSchema = require('../models/Chat/chat');

module.exports = {
    oneToOneChat: (req) => {
        var query = { clearStatus: false }, response, chatQuery = {}, chatHistory = [];
        if (req.senderId && req.receiverId) {
            query.$and = [{ $or: [{ senderId: req.senderId }, { senderId: req.receiverId }] }, { $or: [{ receiverId: req.receiverId }, { receiverId: req.senderId }] }]
        }
        if (req.senderId && req.receiverId) {
            chatQuery.$or = [{ receiverId: req.receiverId }, { senderId: req.receiverId }]
        }
        return new Promise(async (resolve, reject) => {
            chatSchema.findOne(query).exec(async (err, result) => {
                if (err) {
                    response = ({ response_code: 500, response_message: 'Internal server error.', err })
                    resolve(response)
                }
                else if (!result) {
                    req.messages = [{
                        message: req.message,
                        mediaType: req.mediaType || "text",
                        receiverId: req.receiverId
                    }]
                    new chatSchema(req).save(async (err1, succ) => {
                        if (err1) {
                            response = ({ response_code: 500, response_message: "Internal server error.", err1 })
                            resolve(response)
                        }
                        else {
                            chatHistory = await chatSchema.find(chatQuery).sort({ "messages.createdAt": -1 }).populate("senderId receiverId", "name profilePic").exec()
                            var reversed_array = succ
                            reversed_array.messages = reversed_array.messages.reverse();
                            response = ({ response_code: 200, response_message: 'Message send successfully.', result: reversed_array, chatHistory })
                            resolve(response)
                        }
                    })
                }
                else {
                    if (result.status == "ACTIVE") {
                        var messages = [{
                            message: req.message,
                            receiverId: req.receiverId
                        }]
                        // chatHistory = await chatSchema.find(chatQuery).sort({ "messages.createdAt": -1 }).populate("senderId receiverId", "name profilePic").exec()
                        chatSchema.findByIdAndUpdate({ "_id": result._id }, { $push: { messages: messages } }, { new: true }, (err2, succ1) => {
                            if (err2) {
                                response = ({
                                    response_code: 500,
                                    response_message: "Internal server error", err2
                                })
                                resolve(response)
                            }
                            else if (!succ1) {
                                response = ({
                                    response_code: 404,
                                    response_message: "Data not found"
                                })
                                resolve(response)
                            }
                            else {
                                var reversed_array = succ1;
                                reversed_array.messages = reversed_array.messages.reverse();
                                response = ({ response_code: 200, response_message: 'Message send successfully.', result: reversed_array, chatHistory })
                                resolve(response)
                            }
                        })
                    }
                    else {
                        response = ({ response_code: 404, response_message: 'You cant chat', result: result })
                        resolve(response)
                    }
                }
            })
        })
    },
    viewChat: (req) => {
        let response = {}
        return new Promise((resolve, reject) => {
            chatSchema.findOne({ _id: req.chatId, status: "ACTIVE" }).sort({ "messages.createdAt": -1 }).exec((error, findRes) => {
                if (error) {
                    response = { response_code: 500, response_message: "Internal server error.", err }
                    resolve(response)
                } else if (!findRes) {
                    response = { response_code: 404, response_message: "Data not found", result: [] }
                    resolve(response)
                } else {
                    response = { response_code: 200, response_message: "Data found successfully.", result: findRes }
                    resolve(response)
                }
            })
        })
    },

  

    //********************************ends of exports***************************/

}

