var require = meteorInstall({"both":{"methods":{"establishment":{"QR":{"codeGenerator.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/QR/codeGenerator.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../../../models/establishment/node");
const Collections = require("typescript-collections");
class CodeGenerator {
    constructor(_pStringToConvert) {
        this.diccionary = new Collections.Dictionary();
        this.sortList = new Array();
        this.map = new Collections.Dictionary();
        this.finalTree = new node_1.Node();
        this.binaryCode = '';
        this.significativeBits = 0;
        this.stringToConvert = _pStringToConvert;
        this.finalTree.createNodeExtend(0, 256, null, null);
        this.finalBytes = [];
    }
    generateCode() {
        this.buildFrecuencyTable();
        this.sortData();
        this.createTree();
        this.codeTree();
        this.createQRCode();
    }
    buildFrecuencyTable() {
        let _lNode;
        let _lChars = 0;
        for (let _i = 0; _i < this.stringToConvert.length; _i++) {
            _lChars = this.stringToConvert.charCodeAt(_i);
            _lNode = this.diccionary.getValue('' + _lChars);
            if (_lNode == null) {
                let _lAux = new node_1.Node();
                _lAux.createNode(_lChars);
                this.diccionary.setValue(_lChars + '', _lAux);
            }
            else {
                _lNode.setFrecuency(_lNode.getFrecuency() + 1);
            }
        }
    }
    sortData() {
        let _lNode;
        let _lFrecuency;
        let _lSortFrecuency = [];
        let _lSortTMP = new Array();
        let _AuxCont = 0;
        for (let _i = 0; _i <= 255; _i++) {
            _lSortTMP.splice(0, 0, 0);
        }
        this.diccionary.values().forEach((res) => {
            _lSortFrecuency.splice(_AuxCont, 0, res.getFrecuency());
            _lSortTMP.splice(res.getChar(), 1, res.getFrecuency());
            _AuxCont++;
        });
        _lSortFrecuency.sort();
        _lSortFrecuency.forEach((nod) => {
            let tmp = _lSortTMP.indexOf(nod);
            _lSortTMP.splice(tmp, 1, 0);
            let tmpNode = new node_1.Node();
            tmpNode.createNodeExtend(nod, tmp, null, null);
            this.sortList.push(tmpNode);
        });
    }
    createNewNode(_pNodeLeft, _pNodeRight) {
        let _lNewNode = new node_1.Node();
        let _lFrecuencyNewNode;
        _lFrecuencyNewNode = (_pNodeLeft.getFrecuency() + _pNodeRight.getFrecuency());
        _lNewNode.createNodeExtend(0, 256, null, null);
        _lNewNode.setFrecuency(_lFrecuencyNewNode);
        _lNewNode.setNodeLeft(_pNodeLeft);
        _lNewNode.setNodeRight(_pNodeRight);
        return _lNewNode;
    }
    insertNewNode(_pNewNode, _pSortList) {
        let _lFirstNode = new node_1.Node();
        let _lSecondNode = new node_1.Node();
        _lFirstNode.createNodeExtend(0, 256, null, null);
        _lSecondNode.createNodeExtend(0, 256, null, null);
        _pSortList.splice(0, 0, _pNewNode);
        for (let _i = 0; _i < _pSortList.length - 1; _i++) {
            _lFirstNode = _pSortList[_i];
            _lSecondNode = _pSortList[(_i + 1)];
            if (_lFirstNode.getFrecuency() >= _lSecondNode.getFrecuency()) {
                _pSortList.splice((_i + 1), 1, _lFirstNode);
                _pSortList.splice(_i, 1, _lSecondNode);
            }
        }
        return _pSortList;
    }
    createTree() {
        let _lTempNodeLeft = new node_1.Node();
        let _lTempNodeRight = new node_1.Node();
        let _lTempNewNode = new node_1.Node();
        _lTempNodeLeft.createNodeExtend(0, 256, null, null);
        _lTempNodeRight.createNodeExtend(0, 256, null, null);
        _lTempNewNode.createNodeExtend(0, 256, null, null);
        while (this.sortList.length != 1) {
            _lTempNodeLeft = this.sortList.shift();
            _lTempNodeRight = this.sortList.shift();
            _lTempNewNode = this.createNewNode(_lTempNodeLeft, _lTempNodeRight);
            this.sortList = this.insertNewNode(_lTempNewNode, this.sortList);
        }
        this.finalTree = this.sortList.shift();
        this.preOrder(this.finalTree, "");
    }
    preOrder(_pNode, _pVal) {
        if (_pNode.getNodeLeft() == null && _pNode.getNodeRight() == null) {
            this.map.setValue(_pNode.getChar() + '', _pVal);
            return;
        }
        this.preOrder(_pNode.getNodeLeft(), _pVal.concat("1"));
        this.preOrder(_pNode.getNodeRight(), _pVal.concat("0"));
    }
    codeTree() {
        let _lCodeBytes = '';
        let _lChars = 0;
        let _lEnd = false;
        let _lByte;
        let _lCode = '';
        for (let _i = 0; _i < this.stringToConvert.length; _i++) {
            _lChars = this.stringToConvert.charCodeAt(_i);
            this.binaryCode += this.map.getValue(_lChars + '');
        }
        _lCode = this.binaryCode;
        while (!_lEnd) {
            let BytesInfo = { bits: '', finalByte: 0, originalByte: 0 };
            for (let _j = 0; _j < 8; _j++) {
                _lCodeBytes += _lCode.charAt(_j);
            }
            _lByte = parseInt(_lCodeBytes, 2);
            BytesInfo.originalByte = _lByte;
            while (true) {
                _lByte = this.byteNivelator(_lByte);
                if (_lByte >= 65 && _lByte <= 90) {
                    break;
                }
            }
            BytesInfo.finalByte = _lByte;
            BytesInfo.bits = _lCodeBytes;
            this.finalBytes.push(BytesInfo);
            _lCodeBytes = '';
            _lCode = _lCode.substring(8, _lCode.length);
            if (_lCode.length == 0) {
                _lEnd = true;
                break;
            }
            if (_lCode.length < 8) {
                _lCode = this.addSignificativeBits(_lCode);
            }
        }
    }
    addSignificativeBits(_code) {
        while (_code.length < 8) {
            _code += "0";
            this.significativeBits += 1;
        }
        return _code;
    }
    byteNivelator(_pByte) {
        let _lNumberConvert = 0;
        if (_pByte < 65) {
            _lNumberConvert = _pByte + 10;
        }
        else if (_pByte > 90) {
            _lNumberConvert = _pByte - 10;
        }
        else {
            _lNumberConvert = _pByte;
        }
        return _lNumberConvert;
    }
    createQRCode() {
        let _lQRCode = '';
        this.finalBytes.forEach((byte) => {
            _lQRCode += String.fromCharCode(byte.finalByte);
        });
        _lQRCode += (this.finalBytes[0].finalByte + '');
        _lQRCode += (this.finalBytes[this.finalBytes.length - 1].finalByte + '');
        this.QRCode = _lQRCode;
    }
    getFinalBytes() {
        return this.finalBytes;
    }
    getSignificativeBits() {
        return this.significativeBits;
    }
    getQRCode() {
        return this.QRCode;
    }
}
exports.CodeGenerator = CodeGenerator;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"waiter-queue":{"queues.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/waiter-queue/queues.methods.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const vsivsi_job_collection_1 = require("meteor/vsivsi:job-collection");
const user_detail_collection_1 = require("../../../collections/auth/user-detail.collection");
const waiter_call_detail_collection_1 = require("../../../collections/establishment/waiter-call-detail.collection");
const establishment_collection_1 = require("../../../collections/establishment/establishment.collection");
const queue_collection_1 = require("../../../collections/general/queue.collection");
if (meteor_1.Meteor.isServer) {
    /**
     * This function validate if exist queues and creates the instances correspondly
     */
    meteor_1.Meteor.startup(function () {
        let queues = queue_collection_1.Queues.findOne({});
        if (queues) {
            queues.queues.forEach(element => {
                meteor_1.Meteor.call('initProcessJobs', element);
            });
        }
    });
    meteor_1.Meteor.methods({
        /**
         * This Meteor Method allow find the queue corresponding to current establishment of the user
         * @param { any } _data
         */
        findQueueByEstablishment: function (_data) {
            let establishment = establishment_collection_1.Establishments.findOne({ _id: _data.establishments });
            let queue = establishment.queue;
            let valEmpty = Number.isInteger(establishment.queue.length);
            let queueName = "";
            if (valEmpty && establishment.queue.length > 0) {
                let position = meteor_1.Meteor.call('getRandomInt', 0, establishment.queue.length - 1);
                if (establishment.queue[position] !== "") {
                    queueName = "queue" + position;
                    meteor_1.Meteor.call("queueValidate", queueName, _data, (err, result) => {
                        if (err) {
                            throw new Error("Error on Queue validating");
                        }
                        else {
                            meteor_1.Meteor.call('waiterCall', queueName, false, _data);
                        }
                    });
                }
                else {
                    throw new Error("Error in call the waiter/waitress");
                }
            }
            else {
                throw new Error("Error in call the waiter/waitress");
            }
        },
        /**
         * This Meteor Method validate if exist queue in the collection
         * @param { string } _queue
         */
        queueValidate: function (_queue, _data) {
            let queueNew = { name: _queue };
            ;
            let queues = queue_collection_1.Queues.findOne({});
            if (queues) {
                let doc = queue_collection_1.Queues.findOne({ queues: { $elemMatch: { name: _queue } } });
                if (!doc) {
                    queue_collection_1.Queues.update({ _id: queues._id }, {
                        $addToSet: { queues: queueNew }
                    });
                    meteor_1.Meteor.call('initProcessJobs', queueNew, _data);
                }
            }
            else {
                queue_collection_1.Queues.insert({ queues: [queueNew] });
                meteor_1.Meteor.call('initProcessJobs', queueNew, _data);
            }
        },
        /**
         * This Meteor Method startup the queue and process jobs
         * @param { string } _queue
         */
        initProcessJobs(element, _data) {
            let queueCollection = vsivsi_job_collection_1.JobCollection(element.name);
            queueCollection.startJobServer();
            var workers = queueCollection.processJobs('waiterCall', {
                concurrency: 1,
                payload: 1,
                pollInterval: 1 * 1000,
                prefetch: 1
            }, function (job, callback) {
                let queueName = element.name;
                let data_detail;
                let usr_id_enabled;
                data_detail = waiter_call_detail_collection_1.WaiterCallDetails.findOne({ job_id: job._doc._id });
                if (data_detail === undefined || data_detail === null) {
                    meteor_1.Meteor.call('waiterCall', queueName, false, _data);
                    data_detail = waiter_call_detail_collection_1.WaiterCallDetails.findOne({ job_id: job._doc._id });
                }
                let establishment = establishment_collection_1.Establishments.findOne({ _id: data_detail.establishment_id });
                usr_id_enabled = meteor_1.Meteor.call('validateWaiterEnabled', data_detail.establishment_id, establishment.max_jobs, data_detail.table_id);
                if (usr_id_enabled === undefined || usr_id_enabled === null) {
                    meteor_1.Meteor.call('jobRemove', queueName, job._doc._id, data_detail);
                    usr_id_enabled = meteor_1.Meteor.call('validateWaiterEnabled', data_detail.establishment_id, establishment.max_jobs, data_detail.table_id);
                }
                job.done();
                var toDate = new Date().toLocaleDateString();
                establishment_collection_1.EstablishmentTurns.update({ establishment_id: data_detail.establishment_id, creation_date: { $gte: new Date(toDate) } }, {
                    $set: { last_waiter_id: usr_id_enabled.user_id, modification_user: 'SYSTEM', modification_date: new Date(), }
                });
                //Waiter call detail update in completed state
                waiter_call_detail_collection_1.WaiterCallDetails.update({ job_id: job._doc._id }, {
                    $set: { "waiter_id": usr_id_enabled.user_id, "status": "completed" }
                });
                //Waiter update of current jobs and state
                let usr_jobs = usr_id_enabled.jobs + 1;
                if (usr_jobs < establishment.max_jobs) {
                    user_detail_collection_1.UserDetails.update({ user_id: usr_id_enabled.user_id }, { $set: { "jobs": usr_jobs } });
                }
                else if (usr_jobs == establishment.max_jobs) {
                    user_detail_collection_1.UserDetails.update({ user_id: usr_id_enabled.user_id }, { $set: { "enabled": false, "jobs": usr_jobs } });
                }
                callback();
            });
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"waiter-queue.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/waiter-queue/waiter-queue.methods.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const vsivsi_job_collection_1 = require("meteor/vsivsi:job-collection");
const user_detail_collection_1 = require("../../../collections/auth/user-detail.collection");
const waiter_call_detail_collection_1 = require("../../../collections/establishment/waiter-call-detail.collection");
const establishment_collection_1 = require("../../../collections/establishment/establishment.collection");
const order_collection_1 = require("../../../collections/establishment/order.collection");
const table_collection_1 = require("../../../collections/establishment/table.collection");
const reward_point_collection_1 = require("../../../collections/establishment/reward-point.collection");
const establishment_points_collection_1 = require("../../../collections/points/establishment-points.collection");
const negative_points_collection_1 = require("../../../collections/points/negative-points.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This Meteor Method add a job in the Waiter call queue
         * @param {boolean} _priorityHigh
         * @param {any} _data
         */
        waiterCall: function (_queue, _priorityHigh, _data) {
            let priority = 'normal';
            let delay = 0;
            var waiterCallDetail;
            var job = new vsivsi_job_collection_1.Job(_queue, 'waiterCall', { data: '' });
            job.priority(priority)
                .delay(delay)
                .save();
            if (_priorityHigh) {
                priority = 'critical', delay = 10000;
                waiter_call_detail_collection_1.WaiterCallDetails.update({ job_id: _data.job_id }, { $set: { waiter_id: _data.waiter_id, job_id: job._doc._id } });
                waiterCallDetail = _data.waiter_call_id;
            }
            else {
                let newTurn = meteor_1.Meteor.call('turnCreate', _data);
                waiterCallDetail = waiter_call_detail_collection_1.WaiterCallDetails.collection.insert({
                    establishment_id: _data.establishments,
                    table_id: _data.tables,
                    user_id: _data.user,
                    turn: newTurn,
                    status: _data.status,
                    creation_user: _data.user,
                    creation_date: new Date(),
                    queue: _queue,
                    job_id: job._doc._id,
                    type: _data.type,
                    order_id: _data.order_id,
                });
            }
            return;
        },
        /**
         * Job remove
         * @param pQueueName
         * @param pJobId
         * @param pDataDetail
         * @param pEnabled
         */
        jobRemove(pQueueName, pJobId, pDataDetail) {
            vsivsi_job_collection_1.Job.getJob(pQueueName, pJobId, function (err, job) {
                if (job) {
                    job.cancel();
                    job.remove(function (err, result) {
                        if (result) {
                            if (pDataDetail !== null && pDataDetail !== undefined) {
                                var data = {
                                    job_id: job._doc._id,
                                    establishments: pDataDetail.establishment_id,
                                    tables: pDataDetail.table_id,
                                    user: pDataDetail.user_id,
                                    waiter_id: pDataDetail.waiter_id,
                                    status: 'waiting'
                                };
                                meteor_1.Meteor.call('waiterCall', pQueueName, true, data);
                            }
                        }
                    });
                }
            });
        },
        /**
         * This Meteor method allow get new turn to the client
         * @param { any } _data
         */
        turnCreate(_data) {
            var newTurn = 1;
            var toDate = new Date().toLocaleDateString();
            var establishmentTurn = establishment_collection_1.EstablishmentTurns.findOne({
                establishment_id: _data.establishments,
                creation_date: { $gte: new Date(toDate) }
            });
            if (establishmentTurn) {
                newTurn = establishmentTurn.turn + 1;
                establishment_collection_1.EstablishmentTurns.update({ _id: establishmentTurn._id }, {
                    $set: { turn: newTurn, modification_user: 'SYSTEM', modification_date: new Date(), }
                });
            }
            else {
                establishment_collection_1.EstablishmentTurns.insert({
                    establishment_id: _data.establishments,
                    turn: newTurn,
                    last_waiter_id: "",
                    creation_user: 'SYSTEM',
                    creation_date: new Date(),
                });
            }
            return newTurn;
        },
        /**
         * This Meteor Method allow delete a job in the Waiter call queue
         * @param {string} _waiter_call_detail_id
         * @param {string} _waiter_id
         */
        closeCall: function (_jobDetail, _waiter_id) {
            vsivsi_job_collection_1.Job.getJob(_jobDetail.queue, _jobDetail.job_id, function (err, job) {
                job.remove(function (err, result) {
                    waiter_call_detail_collection_1.WaiterCallDetails.update({ _id: _jobDetail._id }, {
                        $set: { "status": "closed", modification_user: _waiter_id, modification_date: new Date() }
                    });
                    let waiterDetail = waiter_call_detail_collection_1.WaiterCallDetails.findOne({ job_id: _jobDetail.job_id });
                    if (waiterDetail.type === "CUSTOMER_ORDER" && waiterDetail.order_id !== null) {
                        let _lOrder = order_collection_1.Orders.findOne({ _id: waiterDetail.order_id });
                        let _lConsumerDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _lOrder.creation_user });
                        if (_lOrder.total_reward_points > 0) {
                            let _establishment = establishment_collection_1.Establishments.findOne({ _id: _lOrder.establishment_id });
                            let _lExpireDate = new Date();
                            reward_point_collection_1.RewardPoints.insert({
                                id_user: _lOrder.creation_user,
                                establishment_id: _lOrder.establishment_id,
                                points: _lOrder.total_reward_points,
                                days_to_expire: Number.parseInt(_establishment.points_validity.toString()),
                                gain_date: new Date(),
                                expire_date: new Date(_lExpireDate.setDate(_lExpireDate.getDate() + Number.parseInt(_establishment.points_validity.toString()))),
                                is_active: true
                            });
                            if (_lConsumerDetail.reward_points === null || _lConsumerDetail.reward_points === undefined) {
                                let _lUserReward = { index: 1, establishment_id: _lOrder.establishment_id, points: _lOrder.total_reward_points };
                                user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id }, { $set: { reward_points: [_lUserReward] } });
                            }
                            else {
                                let _lPoints = _lConsumerDetail.reward_points.filter(p => p.establishment_id === _lOrder.establishment_id)[0];
                                if (_lPoints) {
                                    let _newPoints = Number.parseInt(_lPoints.points.toString()) + Number.parseInt(_lOrder.total_reward_points.toString());
                                    user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id, 'reward_points.establishment_id': _lOrder.establishment_id }, { $set: { 'reward_points.$.points': (_newPoints) } });
                                }
                                else {
                                    let _lUserRewardPoints = [];
                                    let _newIndex;
                                    _lUserRewardPoints = _lConsumerDetail.reward_points;
                                    _lUserRewardPoints.sort(function (a, b) { return b.index - a.index; });
                                    _newIndex = (_lUserRewardPoints[0].index) + 1;
                                    let _lUserReward = { index: _newIndex, establishment_id: _lOrder.establishment_id, points: _lOrder.total_reward_points };
                                    user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id }, { $push: { reward_points: _lUserReward } });
                                }
                            }
                        }
                        _lOrder.items.forEach((it) => {
                            if (it.is_reward) {
                                let _lRedeemedPoints = it.redeemed_points;
                                let _lValidatePoints = true;
                                reward_point_collection_1.RewardPoints.collection.find({ id_user: _lOrder.creation_user, establishment_id: _lOrder.establishment_id }, { sort: { gain_date: -1 } }).fetch().forEach((pnt) => {
                                    if (_lValidatePoints) {
                                        if (pnt.difference !== null && pnt.difference !== undefined && pnt.difference !== 0) {
                                            let aux = pnt.points - pnt.difference;
                                            _lRedeemedPoints = _lRedeemedPoints - aux;
                                            reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { points: pnt.difference, difference: 0 } });
                                        }
                                        else if (!pnt.is_active) {
                                            _lRedeemedPoints = _lRedeemedPoints - pnt.points;
                                            if (_lRedeemedPoints === 0) {
                                                _lValidatePoints = false;
                                            }
                                        }
                                    }
                                });
                            }
                        });
                        order_collection_1.Orders.update({ _id: waiterDetail.order_id }, {
                            $set: {
                                status: 'ORDER_STATUS.RECEIVED',
                                modification_user: _waiter_id,
                                modification_date: new Date()
                            }
                        });
                        meteor_1.Meteor.call('generateOrderHistory', _lOrder, waiterDetail.waiter_id);
                    }
                    let usr_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _waiter_id });
                    if (usr_detail) {
                        let jobs = usr_detail.jobs - 1;
                        user_detail_collection_1.UserDetails.update({ _id: usr_detail._id }, { $set: { "enabled": true, "jobs": jobs } });
                    }
                });
            });
            return;
        },
        cancelOrderCall: function (_jobDetail, _waiter_id) {
            vsivsi_job_collection_1.Job.getJob(_jobDetail.queue, _jobDetail.job_id, function (err, job) {
                job.remove(function (err, result) {
                    waiter_call_detail_collection_1.WaiterCallDetails.update({ _id: _jobDetail._id }, {
                        $set: { "status": "closed", modification_user: _waiter_id, modification_date: new Date() }
                    });
                    let waiterDetail = waiter_call_detail_collection_1.WaiterCallDetails.findOne({ job_id: _jobDetail.job_id });
                    if (waiterDetail.type === "CUSTOMER_ORDER" && waiterDetail.order_id !== null) {
                        let _lOrder = order_collection_1.Orders.findOne({ _id: waiterDetail.order_id });
                        if (_lOrder.status === 'ORDER_STATUS.CONFIRMED') {
                            _lOrder.items.forEach((it) => {
                                if (it.is_reward) {
                                    let _lConsumerDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _lOrder.creation_user });
                                    let _lPoints = _lConsumerDetail.reward_points.filter(p => p.establishment_id === _lOrder.establishment_id)[0];
                                    user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id, 'reward_points.establishment_id': _lOrder.establishment_id }, { $set: { 'reward_points.$.points': (Number.parseInt(_lPoints.points.toString()) + Number.parseInt(it.redeemed_points.toString())) } });
                                    let _lRedeemedPoints = it.redeemed_points;
                                    let _lValidatePoints = true;
                                    reward_point_collection_1.RewardPoints.collection.find({ id_user: _lOrder.creation_user, establishment_id: _lOrder.establishment_id }, { sort: { gain_date: -1 } }).fetch().forEach((pnt) => {
                                        if (_lValidatePoints) {
                                            if (pnt.difference !== null && pnt.difference !== undefined && pnt.difference !== 0) {
                                                let aux = pnt.points - pnt.difference;
                                                _lRedeemedPoints = _lRedeemedPoints - aux;
                                                reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { difference: 0 } });
                                            }
                                            else if (!pnt.is_active) {
                                                _lRedeemedPoints = _lRedeemedPoints - pnt.points;
                                                reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { is_active: true } });
                                                if (_lRedeemedPoints === 0) {
                                                    _lValidatePoints = false;
                                                }
                                            }
                                        }
                                    });
                                    let _establishmentPoints = establishment_points_collection_1.EstablishmentPoints.findOne({ establishment_id: _lOrder.establishment_id });
                                    let _negativePoints = negative_points_collection_1.NegativePoints.findOne({ establishment_id: _lOrder.establishment_id, order_id: _lOrder._id, user_id: _lOrder.creation_user });
                                    if (_negativePoints) {
                                        negative_points_collection_1.NegativePoints.update({ _id: _negativePoints._id }, { $set: { was_cancelled: true } });
                                        let _newPoints = Number.parseInt(_establishmentPoints.current_points.toString()) + Number.parseInt(_negativePoints.redeemed_points.toString());
                                        if (_newPoints >= 0) {
                                            establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _newPoints, negative_balance: false } });
                                        }
                                        else {
                                            establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _newPoints, negative_balance: true } });
                                        }
                                    }
                                    else {
                                        let _pointsResult = Number.parseInt(_establishmentPoints.current_points.toString()) + Number.parseInt(it.redeemed_points.toString());
                                        establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _pointsResult, negative_balance: false } });
                                    }
                                }
                            });
                            order_collection_1.Orders.update({ _id: _lOrder._id }, {
                                $set: {
                                    status: 'ORDER_STATUS.CANCELED', modification_user: _jobDetail.waiter_id,
                                    modification_date: new Date()
                                }
                            });
                        }
                    }
                    let usr_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _waiter_id });
                    if (usr_detail) {
                        let jobs = usr_detail.jobs - 1;
                        user_detail_collection_1.UserDetails.update({ _id: usr_detail._id }, { $set: { "enabled": true, "jobs": jobs } });
                    }
                });
            });
            return;
        },
        closeWaiterCall: function (_jobDetail) {
            vsivsi_job_collection_1.Job.getJob(_jobDetail.queue, _jobDetail.job_id, function (err, job) {
                job.remove(function (err, result) {
                    waiter_call_detail_collection_1.WaiterCallDetails.update({ _id: _jobDetail._id }, {
                        $set: { "status": "closed", modification_user: _jobDetail.waiter_id, modification_date: new Date() }
                    });
                    let usr_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _jobDetail.waiter_id });
                    if (usr_detail) {
                        let jobs = usr_detail.jobs - 1;
                        user_detail_collection_1.UserDetails.update({ _id: usr_detail._id }, { $set: { "enabled": true, "jobs": jobs } });
                    }
                });
            });
            return;
        },
        /**
         * This meteor method allow cancel call to waiter by the user
         * @param {WaiterCallDetail} _jobDetail
         * @param {string} _userId
         */
        cancelCallClient: function (_jobDetail, _userId) {
            vsivsi_job_collection_1.Job.getJob(_jobDetail.queue, _jobDetail.job_id, function (err, job) {
                if (job._doc.status !== 'completed') {
                    job.cancel();
                }
                job.remove(function (err, result) {
                    waiter_call_detail_collection_1.WaiterCallDetails.update({ job_id: _jobDetail.job_id }, {
                        $set: { "status": "cancel", modification_user: _userId, modification_date: new Date() }
                    });
                    let waiterDetail = waiter_call_detail_collection_1.WaiterCallDetails.findOne({ job_id: _jobDetail.job_id });
                    if (waiterDetail.type === "CALL_OF_CUSTOMER" && waiterDetail.waiter_id) {
                        let usr_detail = user_detail_collection_1.UserDetails.findOne({ user_id: waiterDetail.waiter_id });
                        if (usr_detail) {
                            let jobs = usr_detail.jobs - 1;
                            user_detail_collection_1.UserDetails.update({ user_id: waiterDetail.waiter_id }, { $set: { "enabled": true, "jobs": jobs } });
                        }
                    }
                });
            });
        },
        /**
         * This function validate waiters enabled
         * @param {string} _establishment
         * @param {string} _maxJobs
         */
        validateWaiterEnabled(_establishment, _maxJobs, _tableId) {
            let usr = null;
            let position = 0;
            let _randomLast;
            let table = table_collection_1.Tables.findOne({ _id: _tableId });
            let waiterEnableds = user_detail_collection_1.UserDetails.collection.find({
                establishment_work: _establishment,
                is_active: true,
                enabled: true,
                role_id: "200",
                jobs: { $lt: _maxJobs },
                table_assignment_init: { $lte: table._number },
                table_assignment_end: { $gte: table._number }
            }).fetch();
            if (waiterEnableds.length > 0) {
                let establishmentTurn = establishment_collection_1.EstablishmentTurns.findOne({ "establishment_id": _establishment }, {
                    sort: { "creation_date": -1 }
                });
                if (establishmentTurn) {
                    _randomLast = establishmentTurn.last_waiter_id;
                }
                do {
                    if (waiterEnableds.length > 0) {
                        position = meteor_1.Meteor.call('getRandomInt', 0, waiterEnableds.length - 1);
                    }
                    usr = waiterEnableds[position];
                } while (usr.user_id == _randomLast && waiterEnableds.length > 1);
                return usr;
            }
            else {
                return null;
            }
        },
        /**
        * This function return a random number
        */
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"establishment.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/establishment.methods.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const codeGenerator_1 = require("/both/methods/establishment/QR/codeGenerator");
const table_collection_1 = require("/both/collections/establishment/table.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const order_collection_1 = require("/both/collections/establishment/order.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
const user_penalty_collection_1 = require("/both/collections/auth/user-penalty.collection");
const reward_point_collection_1 = require("/both/collections/establishment/reward-point.collection");
/**
 * This function create random code with 9 length to establishments
 */
function createEstablishmentCode() {
    let _lText = '';
    let _lPossible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let _i = 0; _i < 9; _i++) {
        _lText += _lPossible.charAt(Math.floor(Math.random() * _lPossible.length));
    }
    return _lText;
}
exports.createEstablishmentCode = createEstablishmentCode;
/**
 * This function create random code with 5 length to establishments
 */
function createTableCode() {
    let _lText = '';
    let _lPossible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let _i = 0; _i < 5; _i++) {
        _lText += _lPossible.charAt(Math.floor(Math.random() * _lPossible.length));
    }
    return _lText;
}
exports.createTableCode = createTableCode;
/**
 * This function create QR Codes to establishments
 * @param {string} _pStringToCode
 * @return {Table} generateQRCode
 */
function generateQRCode(_pStringToCode) {
    let _lCodeGenerator = new codeGenerator_1.CodeGenerator(_pStringToCode);
    _lCodeGenerator.generateCode();
    return _lCodeGenerator;
}
exports.generateQRCode = generateQRCode;
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This Meteor Method return establishment object with QR Code condition
         * @param {string} _qrcode
         * @param {string} _userId
         */
        getEstablishmentByQRCode: function (_qrcode, _userId) {
            let _table = table_collection_1.Tables.collection.findOne({ QR_code: _qrcode });
            let _establishment;
            let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
            if (_lUserDetail.penalties.length === 0) {
                let _lUserPenalty = user_penalty_collection_1.UserPenalties.findOne({ user_id: _userId, is_active: true });
                if (_lUserPenalty) {
                    let _lUserPenaltyDays = parameter_collection_1.Parameters.findOne({ name: 'penalty_days' });
                    let _lCurrentDate = new Date();
                    let _lDateToCompare = new Date(_lUserPenalty.last_date.setDate((_lUserPenalty.last_date.getDate() + Number(_lUserPenaltyDays.value))));
                    if (_lDateToCompare.getTime() >= _lCurrentDate.getTime()) {
                        let _lDay = _lDateToCompare.getDate();
                        let _lMonth = _lDateToCompare.getMonth() + 1;
                        let _lYear = _lDateToCompare.getFullYear();
                        throw new meteor_1.Meteor.Error('500', _lDay + '/' + _lMonth + '/' + _lYear);
                    }
                    else {
                        user_penalty_collection_1.UserPenalties.update({ _id: _lUserPenalty._id }, { $set: { is_active: false } });
                    }
                }
            }
            if (_table) {
                _establishment = establishment_collection_1.Establishments.collection.findOne({ _id: _table.establishment_id });
                if (_establishment) {
                    if (_establishment.isActive) {
                        if (_table.status === 'BUSY') {
                            user_detail_collection_1.UserDetails.collection.update({ user_id: _userId }, {
                                $set: {
                                    current_table: _table._id,
                                    current_establishment: _table.establishment_id
                                }
                            });
                            table_collection_1.Tables.collection.update({ QR_code: _qrcode }, { $set: { amount_people: (_table.amount_people + 1) } });
                        }
                        else if (_table.status === 'FREE') {
                            table_collection_1.Tables.collection.update({ QR_code: _qrcode }, { $set: { status: 'BUSY', amount_people: 1 } });
                            user_detail_collection_1.UserDetails.collection.update({ user_id: _userId }, {
                                $set: {
                                    current_table: _table._id,
                                    current_establishment: _table.establishment_id
                                }
                            });
                        }
                        if (_lUserDetail.grant_start_points !== undefined && _lUserDetail.grant_start_points) {
                            let _lExpireDate = new Date();
                            let _lUserStartPoints = parameter_collection_1.Parameters.findOne({ name: 'user_start_points' });
                            reward_point_collection_1.RewardPoints.insert({
                                id_user: _lUserDetail.user_id,
                                establishment_id: _establishment._id,
                                points: Number.parseInt(_lUserStartPoints.value.toString()),
                                days_to_expire: Number.parseInt(_establishment.points_validity.toString()),
                                gain_date: new Date(),
                                expire_date: new Date(_lExpireDate.setDate(_lExpireDate.getDate() + Number.parseInt(_establishment.points_validity.toString()))),
                                is_active: true
                            });
                            if (_lUserDetail.reward_points === null || _lUserDetail.reward_points === undefined) {
                                let _lUserReward = { index: 1, establishment_id: _establishment._id, points: Number.parseInt(_lUserStartPoints.value.toString()) };
                                user_detail_collection_1.UserDetails.update({ _id: _lUserDetail._id }, { $set: { reward_points: [_lUserReward] } });
                            }
                            user_detail_collection_1.UserDetails.update({ _id: _lUserDetail._id }, { $set: { grant_start_points: false } });
                        }
                        return _establishment;
                    }
                    else {
                        throw new meteor_1.Meteor.Error('200');
                    }
                }
                else {
                    throw new meteor_1.Meteor.Error('300');
                }
            }
            else {
                throw new meteor_1.Meteor.Error('400');
            }
        },
        /**
         * This method return establishment if exist o null if not
         */
        getCurrentEstablishmentByUser: function (_establishmentId) {
            let establishment = establishment_collection_1.Establishments.collection.findOne({ _id: _establishmentId });
            if (typeof establishment != "undefined" || establishment != null) {
                return establishment;
            }
            else {
                return null;
            }
        },
        validateEstablishmentIsActive: function () {
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            if (userDetail) {
                let establishment = establishment_collection_1.Establishments.collection.findOne({ _id: userDetail.establishment_work });
                return establishment.isActive;
            }
            else {
                return false;
            }
        },
        establishmentExit: function (_pUserId, _pCurrentEstablishment, _pCurrentTable) {
            let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _pUserId });
            let _lTableAmountPeople = table_collection_1.Tables.findOne({ _id: _pCurrentTable }).amount_people;
            let _tablesUpdated = table_collection_1.Tables.collection.update({ _id: _pCurrentTable }, { $set: { amount_people: _lTableAmountPeople - 1 } });
            if (_tablesUpdated === 1) {
                let _lTableAux = table_collection_1.Tables.findOne({ _id: _pCurrentTable });
                if (_lTableAux.amount_people === 0 && _lTableAux.status === 'BUSY') {
                    table_collection_1.Tables.update({ _id: _pCurrentTable }, { $set: { status: 'FREE' } });
                }
            }
            let _usersUpdated = user_detail_collection_1.UserDetails.collection.update({ _id: _lUserDetail._id }, { $set: { current_establishment: '', current_table: '' } });
            if (_usersUpdated === 0) {
                throw new meteor_1.Meteor.Error('300');
            }
        },
        establishmentExitWithSelectedOrders: function (_pUserId, _pCurrentEstablishment, _pCurrentTable) {
            let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _pUserId });
            order_collection_1.Orders.find({
                creation_user: _pUserId, establishment_id: _pCurrentEstablishment, tableId: _pCurrentTable,
                status: 'ORDER_STATUS.SELECTING'
            }).fetch().forEach((order) => {
                order.items.forEach((it) => {
                    if (it.is_reward) {
                        let _lConsumerDetail = user_detail_collection_1.UserDetails.findOne({ user_id: order.creation_user });
                        let _lPoints = _lConsumerDetail.reward_points.filter(p => p.establishment_id === order.establishment_id)[0];
                        let _lNewPoints = Number.parseInt(_lPoints.points.toString()) + Number.parseInt(it.redeemed_points.toString());
                        user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id }, { $pull: { reward_points: { establishment_id: order.establishment_id } } });
                        user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id }, { $push: { reward_points: { index: _lPoints.index, establishment_id: order.establishment_id, points: _lNewPoints } } });
                        let _lRedeemedPoints = it.redeemed_points;
                        let _lValidatePoints = true;
                        reward_point_collection_1.RewardPoints.collection.find({ id_user: meteor_1.Meteor.userId(), establishment_id: order.establishment_id }, { sort: { gain_date: -1 } }).fetch().forEach((pnt) => {
                            if (_lValidatePoints) {
                                if (pnt.difference !== null && pnt.difference !== undefined && pnt.difference !== 0) {
                                    let aux = pnt.points - pnt.difference;
                                    _lRedeemedPoints = _lRedeemedPoints - aux;
                                    reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { difference: 0 } });
                                }
                                else if (!pnt.is_active) {
                                    _lRedeemedPoints = _lRedeemedPoints - pnt.points;
                                    reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { is_active: true } });
                                    if (_lRedeemedPoints === 0) {
                                        _lValidatePoints = false;
                                    }
                                }
                            }
                        });
                    }
                });
                order_collection_1.Orders.update({ _id: order._id }, { $set: { status: 'ORDER_STATUS.CANCELED', modification_date: new Date() } });
            });
            let _lTableAmountPeople = table_collection_1.Tables.findOne({ _id: _pCurrentTable }).amount_people;
            let _tablesUpdated = table_collection_1.Tables.collection.update({ _id: _pCurrentTable }, { $set: { amount_people: _lTableAmountPeople - 1 } });
            if (_tablesUpdated === 1) {
                let _lTableAux = table_collection_1.Tables.findOne({ _id: _pCurrentTable });
                if (_lTableAux.amount_people === 0 && _lTableAux.status === 'BUSY') {
                    table_collection_1.Tables.update({ _id: _pCurrentTable }, { $set: { status: 'FREE' } });
                }
            }
            let _usersUpdated = user_detail_collection_1.UserDetails.collection.update({ _id: _lUserDetail._id }, { $set: { current_establishment: '', current_table: '' } });
            if (_usersUpdated === 0) {
                throw new meteor_1.Meteor.Error('300');
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order-history.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/order-history.methods.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const order_history_collection_1 = require("/both/collections/establishment/order-history.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const table_collection_1 = require("/both/collections/establishment/table.collection");
const item_collection_1 = require("/both/collections/menu/item.collection");
const option_value_collection_1 = require("/both/collections/menu/option-value.collection");
const addition_collection_1 = require("/both/collections/menu/addition.collection");
const currency_collection_1 = require("/both/collections/general/currency.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This function allow generate order history
         * @param { Order } _pOrder
         */
        generateOrderHistory: function (_pOrder, _pWaiterId) {
            let lEstablishment = establishment_collection_1.Establishments.findOne({ _id: _pOrder.establishment_id });
            let lTable = table_collection_1.Tables.findOne({ _id: _pOrder.tableId });
            let lCurrency = currency_collection_1.Currencies.findOne({ _id: lEstablishment.currencyId });
            let lInvoiceItems = [];
            let lInvoiceAdditions = [];
            _pOrder.items.forEach((item) => {
                let lItem = item_collection_1.Items.findOne({ _id: item.itemId });
                let lOptions = [];
                let lAdditions = [];
                if (item.options.length > 0) {
                    item.options.forEach((opt) => {
                        let _itemOption = lItem.options.find(item_opt => item_opt.option_id === opt.option_id);
                        if (_itemOption) {
                            let _itemValue = _itemOption.values.find(item_val => item_val.option_value_id === opt.value_id);
                            if (_itemValue) {
                                let _option_value = option_value_collection_1.OptionValues.findOne({ _id: opt.value_id });
                                if (_itemValue.have_price) {
                                    lOptions.push({
                                        option_value_name: _option_value.name,
                                        price: _itemValue.price
                                    });
                                }
                                else {
                                    lOptions.push({
                                        option_value_name: _option_value.name,
                                    });
                                }
                            }
                        }
                    });
                }
                if (item.additions.length > 0) {
                    item.additions.forEach((ad) => {
                        let lad = addition_collection_1.Additions.findOne({ _id: ad });
                        lAdditions.push({
                            addition_name: lad.name,
                            price: lad.establishments.filter(a => a.establishment_id === _pOrder.establishment_id)[0].price
                        });
                    });
                }
                let lInvoiceItem;
                if (item.is_reward) {
                    lInvoiceItem = {
                        item_name: lItem.name,
                        quantity: item.quantity,
                        option_values: lOptions,
                        additions: lAdditions,
                        price: lItem.establishments.filter(i => i.establishment_id === _pOrder.establishment_id)[0].price,
                        is_reward: item.is_reward,
                        redeemed_points: item.redeemed_points
                    };
                }
                else {
                    lInvoiceItem = {
                        item_name: lItem.name,
                        quantity: item.quantity,
                        option_values: lOptions,
                        additions: lAdditions,
                        price: lItem.establishments.filter(i => i.establishment_id === _pOrder.establishment_id)[0].price,
                        is_reward: item.is_reward
                    };
                }
                lInvoiceItems.push(lInvoiceItem);
            });
            _pOrder.additions.forEach((addition) => {
                let lAddition = addition_collection_1.Additions.findOne({ _id: addition.additionId });
                let lAddAddition = {
                    addition_name: lAddition.name,
                    quantity: addition.quantity,
                    price: lAddition.establishments.filter(a => a.establishment_id === _pOrder.establishment_id)[0].price,
                };
                lInvoiceAdditions.push(lAddAddition);
            });
            if (_pOrder.total_reward_points) {
                order_history_collection_1.OrderHistories.insert({
                    creation_user: meteor_1.Meteor.userId(),
                    creation_date: new Date(),
                    establishment_id: _pOrder.establishment_id,
                    establishment_name: lEstablishment.name,
                    establishment_address: lEstablishment.address,
                    establishment_phone: lEstablishment.phone,
                    country_id: lEstablishment.countryId,
                    order_code: _pOrder.code,
                    table_number: lTable._number,
                    total_order: _pOrder.totalPayment,
                    customer_id: _pOrder.creation_user,
                    currency: lCurrency.code,
                    items: lInvoiceItems,
                    additions: lInvoiceAdditions,
                    total_reward_points: _pOrder.total_reward_points
                });
            }
            else {
                order_history_collection_1.OrderHistories.insert({
                    creation_user: _pWaiterId,
                    creation_date: new Date(),
                    establishment_id: _pOrder.establishment_id,
                    establishment_name: lEstablishment.name,
                    establishment_address: lEstablishment.address,
                    establishment_phone: lEstablishment.phone,
                    country_id: lEstablishment.countryId,
                    order_code: _pOrder.code,
                    table_number: lTable._number,
                    total_order: _pOrder.totalPayment,
                    customer_id: _pOrder.creation_user,
                    currency: lCurrency.code,
                    items: lInvoiceItems,
                    additions: lInvoiceAdditions
                });
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/order.methods.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const table_collection_1 = require("/both/collections/establishment/table.collection");
const order_collection_1 = require("/both/collections/establishment/order.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const reward_point_collection_1 = require("/both/collections/establishment/reward-point.collection");
const establishment_points_collection_1 = require("/both/collections/points/establishment-points.collection");
const negative_points_collection_1 = require("/both/collections/points/negative-points.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This Meteor Method add item in user order
         * @param {OrderItem} _itemToInsert
         * @param {string} _tableQRCode
         */
        AddItemToOrder: function (_itemToInsert, _establishmentId, _tableQRCode, _finalPrice, _finalPoints) {
            let _lTable = table_collection_1.Tables.collection.findOne({ QR_code: _tableQRCode });
            let _lEstablishment = establishment_collection_1.Establishments.collection.findOne({ _id: _establishmentId });
            let _finalOrderId = '';
            let _lOrder = order_collection_1.Orders.collection.findOne({
                creation_user: meteor_1.Meteor.userId(),
                establishment_id: _establishmentId,
                tableId: _lTable._id,
                status: 'ORDER_STATUS.SELECTING'
            });
            if (_lOrder) {
                _finalOrderId = _lOrder._id;
                let _lTotalPaymentAux = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_itemToInsert.paymentItem.toString());
                let _lTotalPointsAux = Number.parseInt(_lOrder.total_reward_points.toString()) + Number.parseInt(_itemToInsert.reward_points.toString());
                order_collection_1.Orders.update({
                    creation_user: meteor_1.Meteor.userId(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    status: 'ORDER_STATUS.SELECTING'
                }, { $push: { items: _itemToInsert } });
                order_collection_1.Orders.update({
                    creation_user: meteor_1.Meteor.userId(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    status: 'ORDER_STATUS.SELECTING'
                }, {
                    $set: {
                        modification_user: meteor_1.Meteor.userId(),
                        modification_date: new Date(),
                        totalPayment: _lTotalPaymentAux,
                        orderItemCount: _lOrder.orderItemCount + 1,
                        total_reward_points: _lTotalPointsAux
                    }
                });
            }
            else {
                let _orderCount = _lEstablishment.orderNumberCount + 1;
                _lEstablishment.orderNumberCount = _orderCount;
                establishment_collection_1.Establishments.update({ _id: _lEstablishment._id }, _lEstablishment);
                _finalOrderId = order_collection_1.Orders.collection.insert({
                    creation_user: meteor_1.Meteor.userId(),
                    creation_date: new Date(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    code: _orderCount,
                    status: 'ORDER_STATUS.SELECTING',
                    items: [_itemToInsert],
                    totalPayment: _finalPrice,
                    orderItemCount: 1,
                    additions: [],
                    total_reward_points: _finalPoints
                });
            }
            if (_itemToInsert.is_reward) {
                let _lConsumerDetail = user_detail_collection_1.UserDetails.findOne({ user_id: meteor_1.Meteor.userId() });
                let _lPoints = _lConsumerDetail.reward_points.filter(p => p.establishment_id === _lEstablishment._id)[0];
                user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id, 'reward_points.establishment_id': _lEstablishment._id }, { $set: { 'reward_points.$.points': (_lPoints.points - _itemToInsert.redeemed_points) } });
                let _points = _itemToInsert.redeemed_points;
                let _validate_points = true;
                reward_point_collection_1.RewardPoints.collection.find({ id_user: meteor_1.Meteor.userId(), establishment_id: _lEstablishment._id, is_active: true }, { sort: { gain_date: 1 } }).fetch().forEach((pnt) => {
                    if (_validate_points) {
                        _points = _points - pnt.points;
                        if (_points >= 0) {
                            reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { is_active: false } });
                            _validate_points = true;
                        }
                        else {
                            reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { difference: (_points * -1) } });
                            _validate_points = false;
                        }
                    }
                });
                let _establishmentPoints = establishment_points_collection_1.EstablishmentPoints.findOne({ establishment_id: _lEstablishment._id });
                let _pointsResult = Number.parseInt(_establishmentPoints.current_points.toString()) - Number.parseInt(_itemToInsert.redeemed_points.toString());
                if (_pointsResult >= 0) {
                    establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _pointsResult } });
                }
                else {
                    let _negativePoints;
                    if (_establishmentPoints.current_points > 0) {
                        _negativePoints = Number.parseInt(_itemToInsert.redeemed_points.toString()) - Number.parseInt(_establishmentPoints.current_points.toString());
                        if (_negativePoints < 0) {
                            _negativePoints = (_negativePoints * (-1));
                        }
                    }
                    else {
                        _negativePoints = Number.parseInt(_itemToInsert.redeemed_points.toString());
                    }
                    negative_points_collection_1.NegativePoints.insert({
                        establishment_id: _lEstablishment._id,
                        order_id: _finalOrderId,
                        user_id: _lConsumerDetail.user_id,
                        redeemed_points: Number.parseInt(_itemToInsert.redeemed_points.toString()),
                        points: _negativePoints,
                        was_cancelled: false,
                        paid: false
                    });
                    establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _pointsResult, negative_balance: true } });
                }
            }
        },
        AddItemToOrder2: function (_itemToInsert, _establishmentId, _idTable, _finalPrice, _finalPoints) {
            let _lTable = table_collection_1.Tables.collection.findOne({ _id: _idTable });
            let _lEstablishment = establishment_collection_1.Establishments.collection.findOne({ _id: _establishmentId });
            let _finalOrderId = '';
            let _lOrder = order_collection_1.Orders.collection.findOne({
                creation_user: meteor_1.Meteor.userId(),
                establishment_id: _establishmentId,
                tableId: _lTable._id,
                status: 'ORDER_STATUS.SELECTING'
            });
            if (_lOrder) {
                _finalOrderId = _lOrder._id;
                let _lTotalPaymentAux = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_itemToInsert.paymentItem.toString());
                let _lTotalPointsAux = Number.parseInt(_lOrder.total_reward_points.toString()) + Number.parseInt(_itemToInsert.reward_points.toString());
                order_collection_1.Orders.update({
                    creation_user: meteor_1.Meteor.userId(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    status: 'ORDER_STATUS.SELECTING'
                }, { $push: { items: _itemToInsert } });
                order_collection_1.Orders.update({
                    creation_user: meteor_1.Meteor.userId(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    status: 'ORDER_STATUS.SELECTING'
                }, {
                    $set: {
                        modification_user: meteor_1.Meteor.userId(),
                        modification_date: new Date(),
                        totalPayment: _lTotalPaymentAux,
                        orderItemCount: _lOrder.orderItemCount + 1,
                        total_reward_points: _lTotalPointsAux
                    }
                });
            }
            else {
                let _orderCount = _lEstablishment.orderNumberCount + 1;
                _lEstablishment.orderNumberCount = _orderCount;
                establishment_collection_1.Establishments.update({ _id: _lEstablishment._id }, _lEstablishment);
                _finalOrderId = order_collection_1.Orders.collection.insert({
                    creation_user: meteor_1.Meteor.userId(),
                    creation_date: new Date(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    code: _orderCount,
                    status: 'ORDER_STATUS.SELECTING',
                    items: [_itemToInsert],
                    totalPayment: _finalPrice,
                    orderItemCount: 1,
                    additions: [],
                    total_reward_points: _finalPoints
                });
            }
            if (_itemToInsert.is_reward) {
                let _lConsumerDetail = user_detail_collection_1.UserDetails.findOne({ user_id: meteor_1.Meteor.userId() });
                let _lPoints = _lConsumerDetail.reward_points.filter(p => p.establishment_id === _lEstablishment._id)[0];
                user_detail_collection_1.UserDetails.update({ _id: _lConsumerDetail._id, 'reward_points.establishment_id': _lEstablishment._id }, { $set: { 'reward_points.$.points': (_lPoints.points - _itemToInsert.redeemed_points) } });
                let _points = _itemToInsert.redeemed_points;
                let _validate_points = true;
                reward_point_collection_1.RewardPoints.collection.find({ id_user: meteor_1.Meteor.userId(), establishment_id: _lEstablishment._id, is_active: true }, { sort: { gain_date: 1 } }).fetch().forEach((pnt) => {
                    if (_validate_points) {
                        _points = _points - pnt.points;
                        if (_points >= 0) {
                            reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { is_active: false } });
                            _validate_points = true;
                        }
                        else {
                            reward_point_collection_1.RewardPoints.update({ _id: pnt._id }, { $set: { difference: (_points * -1) } });
                            _validate_points = false;
                        }
                    }
                });
                let _establishmentPoints = establishment_points_collection_1.EstablishmentPoints.findOne({ establishment_id: _lEstablishment._id });
                let _pointsResult = Number.parseInt(_establishmentPoints.current_points.toString()) - Number.parseInt(_itemToInsert.redeemed_points.toString());
                if (_pointsResult >= 0) {
                    establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _pointsResult } });
                }
                else {
                    let _negativePoints;
                    if (_establishmentPoints.current_points > 0) {
                        _negativePoints = Number.parseInt(_itemToInsert.redeemed_points.toString()) - Number.parseInt(_establishmentPoints.current_points.toString());
                        if (_negativePoints < 0) {
                            _negativePoints = (_negativePoints * (-1));
                        }
                    }
                    else {
                        _negativePoints = Number.parseInt(_itemToInsert.redeemed_points.toString());
                    }
                    negative_points_collection_1.NegativePoints.insert({
                        establishment_id: _lEstablishment._id,
                        order_id: _finalOrderId,
                        user_id: _lConsumerDetail.user_id,
                        redeemed_points: Number.parseInt(_itemToInsert.redeemed_points.toString()),
                        points: _negativePoints,
                        was_cancelled: false,
                        paid: false
                    });
                    establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _pointsResult, negative_balance: true } });
                }
            }
        },
        /**
         * This Meteor Method Add Additions to order
         * @param {OrderAddition[]} _additionsToInsert
         * @param {string} _establishmentId
         * @param {string} _tableQRCode
         * @param {number} _AdditionsPrice
         */
        AddAdditionsToOrder: function (_additionsToInsert, _establishmentId, _tableQRCode, _AdditionsPrice) {
            let _lTable = table_collection_1.Tables.collection.findOne({ QR_code: _tableQRCode });
            let _lOrder = order_collection_1.Orders.collection.findOne({
                creation_user: meteor_1.Meteor.userId(),
                establishment_id: _establishmentId,
                tableId: _lTable._id,
                status: 'ORDER_STATUS.SELECTING'
            });
            if (_lOrder) {
                let _lTotalPaymentAux = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_AdditionsPrice.toString());
                let _lAdditions = meteor_1.Meteor.call('compareAdditionsToInsert', _additionsToInsert, _lOrder);
                order_collection_1.Orders.update({
                    creation_user: meteor_1.Meteor.userId(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    status: 'ORDER_STATUS.SELECTING'
                }, {
                    $set: {
                        modification_user: meteor_1.Meteor.userId(),
                        modification_date: new Date(),
                        totalPayment: _lTotalPaymentAux,
                        additions: _lAdditions
                    }
                });
            }
            else {
                let _lEstablishment = establishment_collection_1.Establishments.collection.findOne({ _id: _establishmentId });
                let _orderCount = _lEstablishment.orderNumberCount + 1;
                _lEstablishment.orderNumberCount = _orderCount;
                establishment_collection_1.Establishments.update({ _id: _lEstablishment._id }, _lEstablishment);
                order_collection_1.Orders.insert({
                    creation_user: meteor_1.Meteor.userId(),
                    creation_date: new Date(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    code: _orderCount,
                    status: 'ORDER_STATUS.SELECTING',
                    items: [],
                    totalPayment: _AdditionsPrice,
                    orderItemCount: 0,
                    additions: _additionsToInsert
                });
            }
        },
        AddAdditionsToOrder2: function (_additionsToInsert, _establishmentId, _tableId, _AdditionsPrice) {
            let _lTable = table_collection_1.Tables.collection.findOne({ _id: _tableId });
            let _lOrder = order_collection_1.Orders.collection.findOne({
                creation_user: meteor_1.Meteor.userId(),
                establishment_id: _establishmentId,
                tableId: _lTable._id,
                status: 'ORDER_STATUS.SELECTING'
            });
            if (_lOrder) {
                let _lTotalPaymentAux = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_AdditionsPrice.toString());
                let _lAdditions = meteor_1.Meteor.call('compareAdditionsToInsert', _additionsToInsert, _lOrder);
                order_collection_1.Orders.update({
                    creation_user: meteor_1.Meteor.userId(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    status: 'ORDER_STATUS.SELECTING'
                }, {
                    $set: {
                        modification_user: meteor_1.Meteor.userId(),
                        modification_date: new Date(),
                        totalPayment: _lTotalPaymentAux,
                        additions: _lAdditions
                    }
                });
            }
            else {
                let _lEstablishment = establishment_collection_1.Establishments.collection.findOne({ _id: _establishmentId });
                let _orderCount = _lEstablishment.orderNumberCount + 1;
                _lEstablishment.orderNumberCount = _orderCount;
                establishment_collection_1.Establishments.update({ _id: _lEstablishment._id }, _lEstablishment);
                order_collection_1.Orders.insert({
                    creation_user: meteor_1.Meteor.userId(),
                    creation_date: new Date(),
                    establishment_id: _establishmentId,
                    tableId: _lTable._id,
                    code: _orderCount,
                    status: 'ORDER_STATUS.SELECTING',
                    items: [],
                    totalPayment: _AdditionsPrice,
                    orderItemCount: 0,
                    additions: _additionsToInsert
                });
            }
        },
        /**
         * This function compare additions to insert and create new array
         * @param {OrderAddition[]} _pAdditionsToInsert
         */
        compareAdditionsToInsert: function (_pAdditionsToInsert, _pOrder) {
            let _lAdditionsToReturn = _pOrder.additions;
            _pAdditionsToInsert.forEach((addToInsert) => {
                _lAdditionsToReturn.forEach((addToReturn) => {
                    if (addToInsert.additionId === addToReturn.additionId) {
                        addToReturn.quantity = addToReturn.quantity + addToInsert.quantity;
                        addToReturn.paymentAddition = addToReturn.paymentAddition + addToInsert.paymentAddition;
                    }
                });
            });
            _pAdditionsToInsert.forEach((addToInsert) => {
                if (_lAdditionsToReturn.filter(ad => ad.additionId === addToInsert.additionId).length === 0) {
                    _lAdditionsToReturn.push(addToInsert);
                }
            });
            return _lAdditionsToReturn;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"schedule.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/schedule.methods.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (Meteor.isServer) {
    /**
    * Init the cron according to the countries registered
    */
    /*
    Meteor.startup(function () {
        let activeCountries = Countries.collection.find({is_active: true}).fetch();
        activeCountries.forEach(country => {
            console.log(country._id);
        });
    });
    */
    Meteor.methods({});
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"table.method.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/establishment/table.method.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const table_collection_1 = require("/both/collections/establishment/table.collection");
const order_collection_1 = require("/both/collections/establishment/order.collection");
const waiter_call_detail_collection_1 = require("/both/collections/establishment/waiter-call-detail.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        getCurrentTableByUser: function (_idTable) {
            let table = table_collection_1.Tables.collection.findOne({ _id: _idTable });
            if (typeof table != "undefined" || table != null) {
                return table;
            }
            else {
                return null;
            }
        },
        getIdTableByQr: function (_qrCode) {
            let table = table_collection_1.Tables.collection.findOne({ QR_code: _qrCode, is_active: true });
            if (typeof table != "undefined" || table != null) {
                return table;
            }
            else {
                return null;
            }
        },
        changeCurrentTable: function (_pUserId, _pEstablishmentId, _pQRCodeCurrentTable, _pQRCodeDestinationTable) {
            if (_pQRCodeCurrentTable === _pQRCodeDestinationTable) {
                throw new meteor_1.Meteor.Error('207');
            }
            let _lCurrentTable = table_collection_1.Tables.findOne({ QR_code: _pQRCodeCurrentTable });
            let _lDestinationTable = table_collection_1.Tables.findOne({ QR_code: _pQRCodeDestinationTable });
            if (_lDestinationTable) {
                if (_lDestinationTable.is_active) {
                    if (_lDestinationTable.establishment_id === _pEstablishmentId) {
                        let _lWaiterCalls = waiter_call_detail_collection_1.WaiterCallDetails.find({
                            establishment_id: _pEstablishmentId, table_id: _lCurrentTable._id, type: 'CALL_OF_CUSTOMER',
                            user_id: _pUserId, status: 'completed'
                        }).fetch().length;
                        if (_lWaiterCalls <= 0) {
                            let _lNewAmountPeople = _lCurrentTable.amount_people - 1;
                            table_collection_1.Tables.update({ _id: _lCurrentTable._id }, { $set: { amount_people: _lNewAmountPeople } });
                            order_collection_1.Orders.find({
                                creation_user: _pUserId, establishment_id: _pEstablishmentId, tableId: _lCurrentTable._id,
                                status: 'ORDER_STATUS.CONFIRMED'
                            }).fetch().forEach((order) => {
                                waiter_call_detail_collection_1.WaiterCallDetails.update({ establishment_id: _pEstablishmentId, table_id: _lCurrentTable._id, status: 'completed', order_id: order._id }, { $set: { table_id: _lDestinationTable._id } });
                            });
                            if (_lDestinationTable.status === 'BUSY') {
                                table_collection_1.Tables.update({ _id: _lDestinationTable._id }, { $set: { amount_people: _lDestinationTable.amount_people + 1 } });
                                order_collection_1.Orders.find({
                                    creation_user: _pUserId, establishment_id: _pEstablishmentId, tableId: _lCurrentTable._id,
                                    status: { $in: ['ORDER_STATUS.SELECTING', 'ORDER_STATUS.CONFIRMED'] }
                                }).fetch().forEach((order) => {
                                    order_collection_1.Orders.update({ _id: order._id }, { $set: { tableId: _lDestinationTable._id, modification_user: _pUserId, modification_date: new Date() } });
                                });
                            }
                            else if (_lDestinationTable.status === 'FREE') {
                                table_collection_1.Tables.update({ _id: _lDestinationTable._id }, { $set: { status: 'BUSY', amount_people: 1 } });
                                order_collection_1.Orders.find({
                                    creation_user: _pUserId, establishment_id: _pEstablishmentId, tableId: _lCurrentTable._id,
                                    status: { $in: ['ORDER_STATUS.SELECTING', 'ORDER_STATUS.CONFIRMED'] }
                                }).fetch().forEach((order) => {
                                    order_collection_1.Orders.update({ _id: order._id }, { $set: { tableId: _lDestinationTable._id, modification_user: _pUserId, modification_date: new Date() } });
                                });
                            }
                            else {
                                throw new meteor_1.Meteor.Error('206');
                            }
                            let _lCurTableAux = table_collection_1.Tables.findOne({ QR_code: _pQRCodeCurrentTable });
                            if (_lCurTableAux.amount_people === 0 && _lCurTableAux.status === 'BUSY') {
                                table_collection_1.Tables.update({ _id: _lCurTableAux._id }, { $set: { status: 'FREE' } });
                            }
                            user_detail_collection_1.UserDetails.update({ user_id: _pUserId }, { $set: { current_table: _lDestinationTable._id } });
                        }
                        else {
                            throw new meteor_1.Meteor.Error('205');
                        }
                    }
                    else {
                        throw new meteor_1.Meteor.Error('202');
                    }
                }
                else {
                    throw new meteor_1.Meteor.Error('201');
                }
            }
            else {
                throw new meteor_1.Meteor.Error('200');
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"auth":{"collaborators.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/auth/collaborators.methods.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        createCollaboratorUser: function (_info) {
            var result = Accounts.createUser({
                email: _info.email,
                password: _info.password,
                username: _info.username,
                profile: _info.profile,
            });
            return result;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"menu.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/auth/menu.methods.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const role_collection_1 = require("/both/collections/auth/role.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const menu_collection_1 = require("/both/collections/auth/menu.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        getMenus: function () {
            let menuList = [];
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            let role = role_collection_1.Roles.collection.findOne({ _id: userDetail.role_id });
            menu_collection_1.Menus.collection.find({ _id: { $in: role.menus }, is_active: true }, { sort: { order: 1 } }).forEach(function (menu, index, ar) {
                menuList.push(menu);
            });
            return menuList;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-detail.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/auth/user-detail.methods.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        getRole: function () {
            let role = "";
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            if (userDetail) {
                role = userDetail.role_id;
            }
            return role;
        },
        validateAdmin: function () {
            let role;
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            role = userDetail.role_id;
            if (role === '100') {
                return true;
            }
            else {
                return false;
            }
        },
        validateWaiter: function () {
            let role;
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            role = userDetail.role_id;
            if (role === '200') {
                return true;
            }
            else {
                return false;
            }
        },
        validateCashier: function () {
            let role;
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            role = userDetail.role_id;
            if (role === '300') {
                return true;
            }
            else {
                return false;
            }
        },
        validateCustomer: function () {
            let role;
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            role = userDetail.role_id;
            if (role === '400') {
                return true;
            }
            else {
                return false;
            }
        },
        validateChef: function () {
            let role;
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            role = userDetail.role_id;
            if (role === '500') {
                return true;
            }
            else {
                return false;
            }
        },
        validateAdminOrSupervisor: function () {
            let role;
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            role = userDetail.role_id;
            if (role === '100' || role === '600') {
                return true;
            }
            else {
                return false;
            }
        },
        getDetailsCount: function () {
            let count;
            count = user_detail_collection_1.UserDetails.collection.find({ user_id: this.userId }).count();
            return count;
        },
        /**
         * Validate user is active
         */
        validateUserIsActive: function () {
            let userDetail = user_detail_collection_1.UserDetails.collection.findOne({ user_id: this.userId });
            if (userDetail) {
                return userDetail.is_active;
            }
            else {
                return false;
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-devices.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/auth/user-devices.methods.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
//import { UserDetails } from '../../collections/auth/user-detail.collection';
//import { UserDetail } from '../../models/auth/user-detail.model';
const device_collection_1 = require("/both/collections/auth/device.collection");
const device_model_1 = require("../../models/auth/device.model");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        userDevicesValidation: function (_data) {
            var _device = new device_model_1.Device();
            var _userDevice = device_collection_1.UserDevices.collection.find({ user_id: this.userId });
            _device.player_id = _data.userId;
            _device.is_active = true;
            if (_userDevice.count() === 0) {
                device_collection_1.UserDevices.insert({
                    user_id: meteor_1.Meteor.userId(),
                    devices: [_device],
                });
            }
            else if (_userDevice.count() > 0) {
                _userDevice.fetch().forEach((usr_dev) => {
                    let _dev_val = device_collection_1.UserDevices.collection.find({ "devices.player_id": _data.userId });
                    if (!_dev_val) {
                        device_collection_1.UserDevices.update({ _id: usr_dev._id }, { $addToSet: {
                                devices: _device
                            }
                        });
                    }
                    else {
                        device_collection_1.UserDevices.update({ "devices.player_id": _data.userId }, { $set: { "devices.$.is_active": true }
                        });
                    }
                });
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-login.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/auth/user-login.methods.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const user_login_collection_1 = require("/both/collections/auth/user-login.collection");
const accounts_base_1 = require("meteor/accounts-base");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        insertUserLoginInfo: function (_pUserLogin) {
            user_login_collection_1.UsersLogin.insert(_pUserLogin);
        },
        changeUserPassword: function (_userId, _newPassword) {
            accounts_base_1.Accounts.setPassword(_userId, _newPassword);
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/auth/user.methods.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const waiter_call_detail_collection_1 = require("/both/collections/establishment/waiter-call-detail.collection");
const table_collection_1 = require("/both/collections/establishment/table.collection");
const user_penalty_collection_1 = require("/both/collections/auth/user-penalty.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        penalizeCustomer: function (_pCustomerUser) {
            let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _pCustomerUser._id });
            let _lCustomerEstablishment = _lUserDetail.current_establishment;
            let _lCustomerTable = _lUserDetail.current_table;
            waiter_call_detail_collection_1.WaiterCallDetails.find({
                establishment_id: _lCustomerEstablishment, table_id: _lCustomerTable, user_id: _pCustomerUser._id, type: { $in: ['CUSTOMER_ORDER', 'CALL_OF_CUSTOMER'] },
                status: { $in: ['waiting', 'completed'] }
            }).fetch().forEach((call) => {
                waiter_call_detail_collection_1.WaiterCallDetails.update({ _id: call._id }, { $set: { status: 'cancel', modification_date: new Date() } });
            });
            let _lTableAmountPeople = table_collection_1.Tables.findOne({ _id: _lCustomerTable }).amount_people;
            let _tablesUpdated = table_collection_1.Tables.collection.update({ _id: _lCustomerTable }, { $set: { amount_people: _lTableAmountPeople - 1 } });
            if (_tablesUpdated === 1) {
                let _lTableAux = table_collection_1.Tables.findOne({ _id: _lCustomerTable });
                if (_lTableAux.amount_people === 0 && _lTableAux.status === 'BUSY') {
                    table_collection_1.Tables.update({ _id: _lCustomerTable }, { $set: { status: 'FREE' } });
                }
            }
            let _lUserDetailPenalty = { establishment_id: _lCustomerEstablishment, date: new Date() };
            user_detail_collection_1.UserDetails.update({ _id: _lUserDetail._id }, { $push: { penalties: _lUserDetailPenalty } });
            let _lUsersUpdated = user_detail_collection_1.UserDetails.collection.update({ _id: _lUserDetail._id }, { $set: { current_establishment: '', current_table: '' } });
            if (_lUsersUpdated === 1) {
                let _lUserDetailAux = user_detail_collection_1.UserDetails.findOne({ _id: _lUserDetail._id });
                let _lMaxUserPenalties = parameter_collection_1.Parameters.findOne({ name: 'max_user_penalties' });
                if (_lUserDetailAux.penalties.length >= Number(_lMaxUserPenalties.value)) {
                    let _lLast_date = new Date(Math.max.apply(null, _lUserDetailAux.penalties.map(function (p) { return new Date(p.date); })));
                    user_penalty_collection_1.UserPenalties.insert({
                        user_id: _pCustomerUser._id,
                        is_active: true,
                        last_date: _lLast_date,
                        penalties: _lUserDetailAux.penalties
                    });
                    user_detail_collection_1.UserDetails.update({ _id: _lUserDetail._id }, { $set: { penalties: [] } });
                }
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"general":{"change-email.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/change-email.methods.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const accounts_base_1 = require("meteor/accounts-base");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        addEmail: function (newEmail) {
            accounts_base_1.Accounts.addEmail(meteor_1.Meteor.userId(), newEmail, true);
        }
    });
    meteor_1.Meteor.methods({
        removeEmail: function (oldEmail) {
            accounts_base_1.Accounts.removeEmail(meteor_1.Meteor.userId(), oldEmail);
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"country.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/country.methods.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const country_collection_1 = require("/both/collections/general/country.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        getCountryByEstablishmentId: function (_establishmentId) {
            let tables_length;
            let country;
            let establishment;
            establishment = establishment_collection_1.Establishments.collection.findOne({ _id: _establishmentId });
            country = country_collection_1.Countries.findOne({ _id: establishment.countryId });
            return country.name;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cron.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/cron.methods.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const email_1 = require("meteor/email");
const email_content_collection_1 = require("/both/collections/general/email-content.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const table_collection_1 = require("/both/collections/establishment/table.collection");
const payment_history_collection_1 = require("/both/collections/payment/payment-history.collection");
const user_collection_1 = require("/both/collections/auth/user.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
const meteorhacks_ssr_1 = require("meteor/meteorhacks:ssr");
const reward_point_collection_1 = require("/both/collections/establishment/reward-point.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This function change the freeDays flag to false
         * * @param {string} _countryId
         */
        changeFreeDaysToFalse: function (_countryId) {
            establishment_collection_1.Establishments.collection.update({ countryId: _countryId, freeDays: true, is_beta_tester: false }, { $set: { freeDays: false } });
        },
        /**
         * This function send the email to warn for iurest charge soon
         * * @param {string} _countryId
         */
        sendEmailChargeSoon: function (_countryId) {
            let parameter = parameter_collection_1.Parameters.collection.findOne({ name: 'from_email' });
            let iurest_url = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_url' });
            let facebook = parameter_collection_1.Parameters.collection.findOne({ name: 'facebook_link' });
            let twitter = parameter_collection_1.Parameters.collection.findOne({ name: 'twitter_link' });
            let instagram = parameter_collection_1.Parameters.collection.findOne({ name: 'instagram_link' });
            let iurestImgVar = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_img_url' });
            let currentDate = new Date();
            let lastMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            let auxArray = [];
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId, isActive: true, is_beta_tester: false }).forEach(function (establishment, index, ar) {
                let user = user_collection_1.Users.collection.findOne({ _id: establishment.creation_user });
                let indexofvar = auxArray.indexOf(user._id);
                if (indexofvar < 0) {
                    auxArray.push(user._id);
                }
            });
            user_collection_1.Users.collection.find({ _id: { $in: auxArray } }).forEach((user) => {
                let auxEstablishments = [];
                establishment_collection_1.Establishments.collection.find({ creation_user: user._id, is_beta_tester: false }, { fields: { _id: 0, name: 1 } }).forEach(function (name, index, ar) {
                    auxEstablishments.push(name.name);
                });
                let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
                let greetVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                let greeting = (user.profile && user.profile.first_name) ? (greetVar + ' ' + user.profile.first_name + ",") : greetVar;
                meteorhacks_ssr_1.SSR.compileTemplate('chargeSoonEmailHtml', Assets.getText('charge-soon-email.html'));
                var emailData = {
                    greeting: greeting,
                    reminderMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderChargeSoonMsgVar'),
                    establishmentListVar: auxEstablishments.toString(),
                    reminderMsgVar2: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderChargeSoonMsgVar2'),
                    dateVar: meteor_1.Meteor.call('convertDateToSimple', lastMonthDay),
                    regardVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar'),
                    followMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar'),
                    iurestUrl: iurest_url.value,
                    facebookLink: facebook.value,
                    twitterLink: twitter.value,
                    instagramLink: instagram.value,
                    iurestImgVar: iurestImgVar.value
                };
                email_1.Email.send({
                    to: user.emails[0].address,
                    from: parameter.value,
                    subject: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'chargeSoonEmailSubjectVar'),
                    html: meteorhacks_ssr_1.SSR.render('chargeSoonEmailHtml', emailData),
                });
            });
        },
        /**
         * This function send the email to warn for iurest expire soon
         * * @param {string} _countryId
         */
        sendEmailExpireSoon: function (_countryId) {
            let parameter = parameter_collection_1.Parameters.collection.findOne({ name: 'from_email' });
            let iurest_url = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_url' });
            let facebook = parameter_collection_1.Parameters.collection.findOne({ name: 'facebook_link' });
            let twitter = parameter_collection_1.Parameters.collection.findOne({ name: 'twitter_link' });
            let instagram = parameter_collection_1.Parameters.collection.findOne({ name: 'instagram_link' });
            let iurestImgVar = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_img_url' });
            let currentDate = new Date();
            let firstMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            let maxPaymentDay = new Date(firstMonthDay);
            let endDay = parameter_collection_1.Parameters.collection.findOne({ name: 'end_payment_day' });
            maxPaymentDay.setDate(maxPaymentDay.getDate() + (Number(endDay.value) - 1));
            let auxArray = [];
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId, isActive: true, freeDays: false, is_beta_tester: false }).forEach(function (establishment, index, ar) {
                let user = user_collection_1.Users.collection.findOne({ _id: establishment.creation_user });
                let indexofvar = auxArray.indexOf(user._id);
                if (indexofvar < 0) {
                    auxArray.push(user._id);
                }
            });
            user_collection_1.Users.collection.find({ _id: { $in: auxArray } }).forEach((user) => {
                let auxEstablishments = [];
                establishment_collection_1.Establishments.collection.find({ creation_user: user._id, isActive: true, freeDays: false, is_beta_tester: false }, { fields: { _id: 0, name: 1 } }).forEach(function (name, index, ar) {
                    auxEstablishments.push(name.name);
                });
                let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
                let greetVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                let greeting = (user.profile && user.profile.first_name) ? (greetVar + ' ' + user.profile.first_name + ",") : greetVar;
                meteorhacks_ssr_1.SSR.compileTemplate('expireSoonEmailHtml', Assets.getText('expire-soon-email.html'));
                var emailData = {
                    greeting: greeting,
                    reminderMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderExpireSoonMsgVar'),
                    establishmentListVar: auxEstablishments.toString(),
                    reminderMsgVar2: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderExpireSoonMsgVar2'),
                    dateVar: meteor_1.Meteor.call('convertDateToSimple', maxPaymentDay),
                    reminderMsgVar3: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderExpireSoonMsgVar3'),
                    regardVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar'),
                    followMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar'),
                    iurestUrl: iurest_url.value,
                    facebookLink: facebook.value,
                    twitterLink: twitter.value,
                    instagramLink: instagram.value,
                    iurestImgVar: iurestImgVar.value
                };
                email_1.Email.send({
                    to: user.emails[0].address,
                    from: parameter.value,
                    subject: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'expireSoonEmailSubjectVar'),
                    html: meteorhacks_ssr_1.SSR.render('expireSoonEmailHtml', emailData),
                });
            });
        },
        /**
         * This function validate the establishment registered in history_payment and change isActive to false if is not
         * @param {string} _countryId
         */
        validateActiveEstablishments: function (_countryId) {
            let currentDate = new Date();
            let currentMonth = (currentDate.getMonth() + 1).toString();
            let currentYear = currentDate.getFullYear().toString();
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId, isActive: true, freeDays: false, is_beta_tester: false }).forEach(function (establishment, index, ar) {
                let historyPayment;
                let auxArray = [];
                auxArray.push(establishment._id);
                //historyPayment = HistoryPayments.collection.findOne({ establishment_ids: establishment._id, month: currentMonth, year: currentYear, status: 'APPROVED' });
                historyPayment = payment_history_collection_1.PaymentsHistory.collection.findOne({ establishment_ids: { $in: auxArray }, month: currentMonth, year: currentYear, status: 'TRANSACTION_STATUS.APPROVED' });
                if (!historyPayment) {
                    establishment_collection_1.Establishments.collection.update({ _id: establishment._id, is_beta_tester: false }, { $set: { isActive: false, firstPay: false } });
                    table_collection_1.Tables.collection.find({ establishment_id: establishment._id }).forEach(function (table, index, ar) {
                        table_collection_1.Tables.collection.update({ _id: table._id }, { $set: { is_active: false } });
                    });
                }
            });
        },
        /**
         * This function send email to warn that the service has expired
         * @param {string} _countryId
         */
        sendEmailRestExpired: function (_countryId) {
            let parameter = parameter_collection_1.Parameters.collection.findOne({ name: 'from_email' });
            let iurest_url = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_url' });
            let facebook = parameter_collection_1.Parameters.collection.findOne({ name: 'facebook_link' });
            let twitter = parameter_collection_1.Parameters.collection.findOne({ name: 'twitter_link' });
            let instagram = parameter_collection_1.Parameters.collection.findOne({ name: 'instagram_link' });
            let iurestImgVar = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_img_url' });
            let auxArray = [];
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId, isActive: false, freeDays: false, firstPay: false, is_beta_tester: false }).forEach(function (establishment, index, ar) {
                let user = user_collection_1.Users.collection.findOne({ _id: establishment.creation_user });
                let indexofvar = auxArray.indexOf(user._id);
                if (indexofvar < 0) {
                    auxArray.push(user._id);
                }
            });
            user_collection_1.Users.collection.find({ _id: { $in: auxArray } }).forEach((user) => {
                let auxEstablishments = [];
                establishment_collection_1.Establishments.collection.find({ creation_user: user._id, isActive: false, freeDays: false, firstPay: false, is_beta_tester: false }, { fields: { _id: 0, name: 1 } }).forEach(function (name, index, ar) {
                    auxEstablishments.push(name.name);
                });
                let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
                let greetVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                let greeting = (user.profile && user.profile.first_name) ? (greetVar + ' ' + user.profile.first_name + ",") : greetVar;
                meteorhacks_ssr_1.SSR.compileTemplate('restExpiredEmailHtml', Assets.getText('rest-expired-email.html'));
                var emailData = {
                    greeting: greeting,
                    reminderMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderRestExpiredVar'),
                    establishmentListVar: auxEstablishments.toString(),
                    reminderMsgVar2: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderRestExpiredVar2'),
                    reminderMsgVar3: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderRestExpiredVar3'),
                    regardVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar'),
                    followMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar'),
                    iurestUrl: iurest_url.value,
                    facebookLink: facebook.value,
                    twitterLink: twitter.value,
                    instagramLink: instagram.value,
                    iurestImgVar: iurestImgVar.value
                };
                email_1.Email.send({
                    to: user.emails[0].address,
                    from: parameter.value,
                    subject: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'restExpiredEmailSubjectVar'),
                    html: meteorhacks_ssr_1.SSR.render('restExpiredEmailHtml', emailData),
                });
            });
        },
        /**
         * This function gets the value from EmailContent collection
         * @param {string} _countryId
         * @return {string}
         */
        getEmailContent(_langDictionary, _label) {
            let value = _langDictionary.filter(function (wordTraduced) {
                return wordTraduced.label == _label;
            });
            return value[0].traduction;
        },
        /**
         * This function convert the day and returning in format yyyy-m-d
         * @param {Date} _date
         * @return {string}
         */
        convertDateToSimple: function (_date) {
            let year = _date.getFullYear();
            let month = _date.getMonth() + 1;
            let day = _date.getDate();
            return day.toString() + '/' + month.toString() + '/' + year.toString();
        },
        /**
         * This function validate the date of points to expire
         */
        checkPointsToExpire(_countryId) {
            let currentDate = new Date();
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId }).forEach(function (establishment, index, ar) {
                reward_point_collection_1.RewardPoints.collection.find({ establishment_id: establishment._id, is_active: true }).forEach(function (rewardPoint, index, ar) {
                    let rewardPointDayMore = rewardPoint.expire_date.getDate() + 1;
                    let rewardPointDate = new Date(rewardPoint.expire_date.getFullYear(), rewardPoint.expire_date.getMonth(), rewardPointDayMore);
                    if ((rewardPointDate.getFullYear() === currentDate.getFullYear()) &&
                        (rewardPointDate.getMonth() === currentDate.getMonth()) &&
                        (rewardPointDate.getDate() === currentDate.getDate())) {
                        let valueToSubtract;
                        if (rewardPoint.difference === 0 || rewardPoint.difference === null || rewardPoint.difference === undefined) {
                            valueToSubtract = rewardPoint.points;
                        }
                        else {
                            valueToSubtract = rewardPoint.difference;
                        }
                        reward_point_collection_1.RewardPoints.collection.update({ _id: rewardPoint._id }, { $set: { is_active: false } });
                        let userDetail = user_detail_collection_1.UserDetails.findOne({ user_id: rewardPoint.id_user });
                        let userRewardPoints = userDetail.reward_points.find(usrPoints => usrPoints.establishment_id === rewardPoint.establishment_id);
                        user_detail_collection_1.UserDetails.update({ user_id: rewardPoint.id_user, 'reward_points.establishment_id': rewardPoint.establishment_id }, { $set: { 'reward_points.$.points': (userRewardPoints.points - valueToSubtract) } });
                    }
                });
            });
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/email.methods.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const email_1 = require("meteor/email");
const email_content_collection_1 = require("/both/collections/general/email-content.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const user_collection_1 = require("/both/collections/auth/user.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
const meteorhacks_ssr_1 = require("meteor/meteorhacks:ssr");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This function validate if establishment trial period has ended
         */
        validateTrialPeriod: function (_countryId) {
            var currentDate = new Date();
            var currentString = meteor_1.Meteor.call('convertDate', currentDate);
            var trialDays = Number.parseInt(parameter_collection_1.Parameters.collection.findOne({ name: 'trial_days' }).value);
            var firstAdviceDays = Number.parseInt(parameter_collection_1.Parameters.collection.findOne({ name: 'first_advice_days' }).value);
            var secondAdviceDays = Number.parseInt(parameter_collection_1.Parameters.collection.findOne({ name: 'second_advice_days' }).value);
            var thirdAdviceDays = Number.parseInt(parameter_collection_1.Parameters.collection.findOne({ name: 'third_advice_days' }).value);
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId, isActive: true, tstPeriod: true }).forEach(function (establishment, index, ar) {
                let diff = Math.round((currentDate.valueOf() - establishment.creation_date.valueOf()) / (1000 * 60 * 60 * 24));
                let forwardDate = meteor_1.Meteor.call('addDays', establishment.creation_date, trialDays);
                let forwardString = meteor_1.Meteor.call('convertDate', forwardDate);
                let firstAdviceDate = meteor_1.Meteor.call('substractDays', forwardDate, firstAdviceDays);
                let firstAdviceString = meteor_1.Meteor.call('convertDate', firstAdviceDate);
                let secondAdviceDate = meteor_1.Meteor.call('substractDays', forwardDate, secondAdviceDays);
                let secondAdviceString = meteor_1.Meteor.call('convertDate', secondAdviceDate);
                let thirdAdviceDate = meteor_1.Meteor.call('substractDays', forwardDate, thirdAdviceDays);
                let thirdAdviceString = meteor_1.Meteor.call('convertDate', thirdAdviceDate);
                if (diff > trialDays) {
                    establishment_collection_1.Establishments.collection.update({ _id: establishment._id }, { $set: { isActive: false, tstPeriod: false } });
                }
                else {
                    if (currentString == firstAdviceString || currentString == secondAdviceString || currentString == thirdAdviceString) {
                        meteor_1.Meteor.call('sendTrialEmail', establishment.creation_user, forwardString);
                    }
                }
            });
            return "emailSend";
        },
        /**
         * This function convert the day and returning in format yyyy-m-d
         */
        convertDate: function (_date) {
            let year = _date.getFullYear();
            let month = _date.getMonth() + 1;
            let day = _date.getDate();
            return year.toString() + '-' + month.toString() + '-' + day.toString();
        },
        /**
         * This function add days to the passed date
         */
        addDays: function (_date, _days) {
            var result = new Date(_date);
            result.setDate(result.getDate() + _days);
            return result;
        },
        /**
         * This function substract days to the passed date
         */
        substractDays: function (_date, _days) {
            var result = new Date(_date);
            result.setDate(result.getDate() - _days);
            return result;
        },
        /**
         * This function send de email to the account admin registered if trial period is going to end
         */
        sendTrialEmail: function (_userId, _forwardDate) {
            let user = user_collection_1.Users.collection.findOne({ _id: _userId });
            let parameter = parameter_collection_1.Parameters.collection.findOne({ name: 'from_email' });
            let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
            var trial_email_subject = emailContent.lang_dictionary[0].traduction;
            var greeting = (user.profile && user.profile.first_name) ? (emailContent.lang_dictionary[1].traduction + ' ' + user.profile.first_name + ",") : emailContent.lang_dictionary[1].traduction;
            meteorhacks_ssr_1.SSR.compileTemplate('htmlEmail', Assets.getText('html-email.html'));
            var emailData = {
                greeting: greeting,
                reminderMsgVar: emailContent.lang_dictionary[7].traduction,
                dateVar: _forwardDate,
                instructionMsgVar: emailContent.lang_dictionary[8].traduction,
                regardVar: emailContent.lang_dictionary[5].traduction,
                followMsgVar: emailContent.lang_dictionary[6].traduction
            };
            email_1.Email.send({
                to: user.emails[0].address,
                from: parameter.value,
                subject: trial_email_subject,
                html: meteorhacks_ssr_1.SSR.render('htmlEmail', emailData),
            });
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"iurest-invoice.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/iurest-invoice.methods.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const payment_history_collection_1 = require("/both/collections/payment/payment-history.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const country_collection_1 = require("/both/collections/general/country.collection");
const city_collection_1 = require("/both/collections/general/city.collection");
const invoices_info_collection_1 = require("/both/collections/payment/invoices-info.collection");
const iurest_invoices_collection_1 = require("/both/collections/payment/iurest-invoices.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This function allow generate iurest invoice for admin establishment
         * @param { string } _paymentHistoryId
         * @param { string } _userId
         */
        generateInvoiceInfo: function (_paymentHistoryId, _userId) {
            let _currentDate = new Date();
            let _firstMonthDay = new Date(_currentDate.getFullYear(), _currentDate.getMonth(), 1);
            let _lastMonthDay = new Date(_currentDate.getFullYear(), _currentDate.getMonth() + 1, 0);
            let lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
            let lCountry = country_collection_1.Countries.findOne({ _id: lUserDetail.country_id });
            let lCity = city_collection_1.Cities.findOne({ _id: lUserDetail.city_id });
            let lPaymentHistory = payment_history_collection_1.PaymentsHistory.findOne({ _id: _paymentHistoryId });
            let invoiceInfo = invoices_info_collection_1.InvoicesInfo.findOne({ country_id: lCountry._id });
            let var_resolution;
            let var_prefix;
            let var_start_value;
            let var_current_value;
            let var_end_value;
            let var_start_date;
            let var_end_date;
            let var_enable_two;
            let var_start_new;
            let company_name = parameter_collection_1.Parameters.findOne({ name: 'company_name' }).value;
            let company_address = parameter_collection_1.Parameters.findOne({ name: 'company_address' }).value;
            let company_phone = parameter_collection_1.Parameters.findOne({ name: 'company_phone' }).value;
            let company_country = parameter_collection_1.Parameters.findOne({ name: 'company_country' }).value;
            let company_city = parameter_collection_1.Parameters.findOne({ name: 'company_city' }).value;
            let company_nit = parameter_collection_1.Parameters.findOne({ name: 'company_nit' }).value;
            let company_regime = parameter_collection_1.Parameters.findOne({ name: 'company_regime' }).value;
            let company_contribution = parameter_collection_1.Parameters.findOne({ name: 'company_contribution' }).value;
            let company_retainer = parameter_collection_1.Parameters.findOne({ name: 'company_retainer' }).value;
            let company_agent_retainer = parameter_collection_1.Parameters.findOne({ name: 'company_agent_retainer' }).value;
            let invoice_generated_msg = parameter_collection_1.Parameters.findOne({ name: 'invoice_generated_msg' }).value;
            //Generate consecutive
            if (invoiceInfo.enable_two == false) {
                if (invoiceInfo.start_new_value == true) {
                    var_current_value = invoiceInfo.start_value_one;
                    var_enable_two = false;
                    var_start_new = false;
                }
                else {
                    var_current_value = invoiceInfo.current_value + 1;
                    if (var_current_value == invoiceInfo.end_value_one) {
                        var_enable_two = true;
                        var_start_new = true;
                    }
                    else {
                        var_enable_two = false;
                        var_start_new = false;
                    }
                }
                var_resolution = invoiceInfo.resolution_one;
                var_prefix = invoiceInfo.prefix_one;
                var_start_value = invoiceInfo.start_value_one;
                var_end_value = invoiceInfo.end_value_one;
                var_start_date = invoiceInfo.start_date_one;
                var_end_date = invoiceInfo.end_date_one;
            }
            else {
                if (invoiceInfo.start_new_value == true) {
                    var_current_value = invoiceInfo.start_value_two;
                    var_enable_two = true;
                    var_start_new = false;
                }
                else {
                    var_current_value = invoiceInfo.current_value + 1;
                    if (var_current_value == invoiceInfo.end_value_two) {
                        var_enable_two = false;
                        var_start_new = true;
                    }
                    else {
                        var_enable_two = true;
                        var_start_new = false;
                    }
                }
                var_resolution = invoiceInfo.resolution_two;
                var_prefix = invoiceInfo.prefix_two;
                var_start_value = invoiceInfo.start_value_two;
                var_end_value = invoiceInfo.end_value_two;
                var_start_date = invoiceInfo.start_date_two;
                var_end_date = invoiceInfo.end_date_two;
            }
            invoices_info_collection_1.InvoicesInfo.collection.update({ _id: invoiceInfo._id }, {
                $set: {
                    current_value: var_current_value,
                    enable_two: var_enable_two,
                    start_new_value: var_start_new
                }
            });
            let company_info = {
                name: company_name,
                address: company_address,
                phone: company_phone,
                country: company_country,
                city: company_city,
                nit: company_nit,
                regime: company_regime,
                contribution: company_contribution,
                retainer: company_retainer,
                agent_retainter: company_agent_retainer,
                resolution_number: var_resolution,
                resolution_prefix: var_prefix,
                resolution_start_date: var_start_date,
                resolution_end_date: var_end_date,
                resolution_start_value: var_start_value.toString(),
                resolution_end_value: var_end_value.toString()
            };
            let auxCity = lUserDetail.city_id === '' || lUserDetail.city_id === null || lUserDetail.city_id === undefined ? lUserDetail.other_city : lCity.name;
            let client_info = {
                name: meteor_1.Meteor.user().profile.first_name + ' ' + meteor_1.Meteor.user().profile.last_name,
                address: lUserDetail.address,
                city: auxCity,
                country: lCountry.name,
                identification: lUserDetail.dni_number,
                phone: lUserDetail.contact_phone,
                email: meteor_1.Meteor.user().emails[0].address
            };
            iurest_invoices_collection_1.IurestInvoices.collection.insert({
                creation_user: meteor_1.Meteor.userId(),
                creation_date: new Date(),
                payment_history_id: lPaymentHistory._id,
                country_id: lCountry._id,
                number: var_current_value.toString(),
                generation_date: new Date(),
                payment_method: 'RES_PAYMENT_HISTORY.CC_PAYMENT_METHOD',
                description: 'RES_PAYMENT_HISTORY.DESCRIPTION',
                period: _firstMonthDay.getDate() + '/' + (_firstMonthDay.getMonth() + 1) + '/' + _firstMonthDay.getFullYear() +
                    ' - ' + _lastMonthDay.getDate() + '/' + (_lastMonthDay.getMonth() + 1) + '/' + _lastMonthDay.getFullYear(),
                amount_no_iva: meteor_1.Meteor.call('getReturnBase', lPaymentHistory.paymentValue).toString(),
                subtotal: "0",
                iva: "0",
                total: lPaymentHistory.paymentValue.toString(),
                currency: lPaymentHistory.currency,
                company_info: company_info,
                client_info: client_info,
                generated_computer_msg: invoice_generated_msg
            });
        },
        /**
        * This function gets the tax value according to the value
        * @param {number} _paymentValue
        */
        getValueTax: function (_paymentValue) {
            let parameterTax = parameter_collection_1.Parameters.findOne({ name: 'colombia_tax_iva' });
            let percentValue = Number(parameterTax.value);
            return (_paymentValue * percentValue) / 100;
        },
        /**
        * This function gets the tax value according to the value
        * @param {number} _paymentValue
        */
        getReturnBase: function (_paymentValue) {
            let amountPercent = meteor_1.Meteor.call('getValueTax', _paymentValue);
            return _paymentValue - amountPercent;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parameter.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/parameter.methods.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({});
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"push-notifications.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/push-notifications.methods.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const astrocoders_one_signal_1 = require("meteor/astrocoders:one-signal");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        sendPush: function (_userDeviceId, content) {
            const data = {
                contents: {
                    en: content,
                }
            };
            astrocoders_one_signal_1.OneSignal.Notifications.create(_userDeviceId, data);
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"menu":{"item.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/menu/item.methods.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const item_collection_1 = require("/both/collections/menu/item.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * Function to update item available for supervisor
         * @param {UserDetail} _userDetail
         * @param {Item} _item
         */
        updateItemAvailable: function (_establishmentId, _itemId) {
            let _itemEstablishment = item_collection_1.Items.collection.findOne({ _id: _itemId }, { fields: { _id: 0, establishments: 1 } });
            let aux = _itemEstablishment.establishments.find(element => element.establishment_id === _establishmentId);
            item_collection_1.Items.update({ _id: _itemId, "establishments.establishment_id": _establishmentId }, { $set: { 'establishments.$.isAvailable': !aux.isAvailable, modification_date: new Date(), modification_user: meteor_1.Meteor.userId() } });
        },
        /**
         * Function to update item recommended
         * @param {UserDetail} _userDetail
         * @param {Item} _item
         */
        updateRecommended: function (_establishmentId, _itemId) {
            let _itemEstablishment = item_collection_1.Items.collection.findOne({ _id: _itemId }, { fields: { _id: 0, establishments: 1 } });
            let aux = _itemEstablishment.establishments.find(element => element.establishment_id === _establishmentId);
            item_collection_1.Items.update({ _id: _itemId, "establishments.establishment_id": _establishmentId }, { $set: { 'establishments.$.recommended': !aux.recommended, modification_date: new Date(), modification_user: meteor_1.Meteor.userId() } });
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"collections":{"auth":{"device.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/auth/device.collection.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
exports.UserDevices = new meteor_rxjs_1.MongoObservable.Collection('user_devices');
function loggedIn() {
    return !!Meteor.user();
}
exports.UserDevices.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn,
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"menu.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/auth/menu.collection.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
exports.Menus = new meteor_rxjs_1.MongoObservable.Collection('menus');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"role.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/auth/role.collection.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
exports.Roles = new meteor_rxjs_1.MongoObservable.Collection('roles');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-detail.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/auth/user-detail.collection.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
exports.UserDetails = new meteor_rxjs_1.MongoObservable.Collection('user_details');
function loggedIn() {
    return !!Meteor.user();
}
exports.UserDetails.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn,
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-login.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/auth/user-login.collection.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * User Login Collection
 */
exports.UsersLogin = new meteor_rxjs_1.MongoObservable.Collection('users_login');
exports.UsersLogin.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-penalty.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/auth/user-penalty.collection.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * User Penalties Collection
 */
exports.UserPenalties = new meteor_rxjs_1.MongoObservable.Collection('user_penalties');
/**
 * Allow User Penalties collection insert and update functions
 */
exports.UserPenalties.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/auth/user.collection.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Users Collection
 */
exports.Users = meteor_rxjs_1.MongoObservable.fromExisting(meteor_1.Meteor.users);
/**
 * Allow Users collection update functions
 */
exports.Users.allow({
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"establishment":{"establishment.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/establishment.collection.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Establishments Collection
 */
exports.Establishments = new meteor_rxjs_1.MongoObservable.Collection('establishments');
/**
 * Allow Establishment collecion insert and update functions
 */
exports.Establishments.allow({
    insert: loggedIn,
    update: loggedIn
});
/**
 * Establishment Turns Collection
 */
exports.EstablishmentTurns = new meteor_rxjs_1.MongoObservable.Collection('establishment_turns');
/**
 * Allow Establishment Turns collection insert and update functions
 */
exports.EstablishmentTurns.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});
/**
 * Establishment Profile Collection
 */
exports.EstablishmentsProfile = new meteor_rxjs_1.MongoObservable.Collection('establishment_profile');
/**
 * Allow Establishment Profile collection insert and update functions
 */
exports.EstablishmentsProfile.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order-history.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/order-history.collection.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * OrderHistories Collection
 */
exports.OrderHistories = new meteor_rxjs_1.MongoObservable.Collection('order_histories');
/**
 * Allow OrderHistories collection insert and update functions
 */
exports.OrderHistories.allow({
    insert: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/order.collection.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Orders Collection
 */
exports.Orders = new meteor_rxjs_1.MongoObservable.Collection('orders');
/**
 * Allow Orders collection insert and update functions
 */
exports.Orders.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward-point.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/reward-point.collection.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * RewardPoints Collection
 */
exports.RewardPoints = new meteor_rxjs_1.MongoObservable.Collection('reward_points');
/**
 * Allow RewardPoints collection insert and update functions
 */
exports.RewardPoints.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/reward.collection.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Reward Collection
 */
exports.Rewards = new meteor_rxjs_1.MongoObservable.Collection('rewards');
/**
 * Allow Reward collection insert, update and remove functions
 */
exports.Rewards.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"table.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/table.collection.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Tables Collection
 */
exports.Tables = new meteor_rxjs_1.MongoObservable.Collection('tables');
/**
 * Allow Tables collection insert and update functions
 */
exports.Tables.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"waiter-call-detail.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/waiter-call-detail.collection.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * WaiterCallDetails Collection
 */
exports.WaiterCallDetails = new meteor_rxjs_1.MongoObservable.Collection('waiter_call_details');
/**
 * Allow WaiterCallDetails collection insert and update functions
 */
exports.WaiterCallDetails.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"general":{"city.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/city.collection.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Cities Collection
 */
exports.Cities = new meteor_rxjs_1.MongoObservable.Collection('cities');
/**
 * Allow Cities collection insert and update functions
 */
exports.Cities.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cooking-time.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/cooking-time.collection.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Cookingtimes Collection
 */
exports.CookingTimes = new meteor_rxjs_1.MongoObservable.Collection('cooking_times');
/**
 * Allow cookingtimes collection insert and update functions
 */
exports.CookingTimes.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"country.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/country.collection.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Countries Collection
 */
exports.Countries = new meteor_rxjs_1.MongoObservable.Collection('countries');
/**
 * Allow Countries collection insert and update functions
 */
exports.Countries.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"currency.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/currency.collection.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.Currencies = new meteor_rxjs_1.MongoObservable.Collection('currencies');
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
exports.Currencies.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email-content.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/email-content.collection.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.EmailContents = new meteor_rxjs_1.MongoObservable.Collection('email_contents');
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Allow EmailContents collecion insert and update functions
 */
exports.EmailContents.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"hours.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/hours.collection.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.Hours = new meteor_rxjs_1.MongoObservable.Collection('hours');
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
exports.Hours.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"language.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/language.collection.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Languages Collection
 */
exports.Languages = new meteor_rxjs_1.MongoObservable.Collection('languages');
/**
 * Allow Languages collection insert and update functions
 */
exports.Languages.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parameter.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/parameter.collection.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.Parameters = new meteor_rxjs_1.MongoObservable.Collection('parameters');
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
exports.Parameters.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"paymentMethod.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/paymentMethod.collection.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.PaymentMethods = new meteor_rxjs_1.MongoObservable.Collection('paymentMethods');
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
exports.PaymentMethods.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point-validity.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/point-validity.collection.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Points Validity Collection
 */
exports.PointsValidity = new meteor_rxjs_1.MongoObservable.Collection('points_validity');
/**
 * Allow points validity collection insert and update functions
 */
exports.PointsValidity.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/point.collection.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Points Collection
 */
exports.Points = new meteor_rxjs_1.MongoObservable.Collection('points');
/**
 * Allow points collection insert and update functions
 */
exports.Points.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"queue.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/queue.collection.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Queues Collection
 */
exports.Queues = new meteor_rxjs_1.MongoObservable.Collection('queues');
/**
 * Allow Queues collection insert and update functions
 */
exports.Queues.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"type-of-food.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/general/type-of-food.collection.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * TypesOfFood Collection
 */
exports.TypesOfFood = new meteor_rxjs_1.MongoObservable.Collection('types_of_food');
/**
 * Allow TypesOfFood collection insert and update functions
 */
exports.TypesOfFood.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"menu":{"addition.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/addition.collection.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Addition Collection
 */
exports.Additions = new meteor_rxjs_1.MongoObservable.Collection('additions');
/**
 * Allow Addition collection insert and update functions
 */
exports.Additions.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"category.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/category.collection.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Categories Collection
 */
exports.Categories = new meteor_rxjs_1.MongoObservable.Collection('categories');
/**
 * Allow Category collection insert and update functions
 */
exports.Categories.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"garnish-food.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/garnish-food.collection.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Garnish Food Collecion
 */
exports.GarnishFoodCol = new meteor_rxjs_1.MongoObservable.Collection('garnishFood');
/**
 * Allow Garnish Food collection insert and update functions
 */
exports.GarnishFoodCol.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"item.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/item.collection.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Items Collection
 */
exports.Items = new meteor_rxjs_1.MongoObservable.Collection('items');
/**
 * Allow Items collection insert and update functions
 */
exports.Items.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"option-value.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/option-value.collection.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Option Value Collection
 */
exports.OptionValues = new meteor_rxjs_1.MongoObservable.Collection('option_values');
/**
 * Allow OptionValues collection insert and update functions
 */
exports.OptionValues.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"option.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/option.collection.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Options Collection
 */
exports.Options = new meteor_rxjs_1.MongoObservable.Collection('options');
/**
 * Allow Options collection insert and update functions
 */
exports.Options.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"section.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/section.collection.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Section Collection
 */
exports.Sections = new meteor_rxjs_1.MongoObservable.Collection('sections');
/**
 * Allow Section collection insert and update functions
 */
exports.Sections.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"subcategory.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/menu/subcategory.collection.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * Subcategory Collection
 */
exports.Subcategories = new meteor_rxjs_1.MongoObservable.Collection('subcategories');
/**
 * Allow Subcategory collection insert and update functions
 */
exports.Subcategories.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"payment":{"cc-payment-methods.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/payment/cc-payment-methods.collection.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.CcPaymentMethods = new meteor_rxjs_1.MongoObservable.Collection('cc_payment_methods');
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Allow HistoryPaymentCollection collecion insert and update functions
 */
exports.CcPaymentMethods.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"invoices-info.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/payment/invoices-info.collection.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.InvoicesInfo = new meteor_rxjs_1.MongoObservable.Collection('invoices_info');
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Allow HistoryPaymentCollection collecion insert and update functions
 */
exports.InvoicesInfo.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"iurest-invoices.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/payment/iurest-invoices.collection.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.IurestInvoices = new meteor_rxjs_1.MongoObservable.Collection('iurest_invoice');
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Allow HistoryPaymentCollection collecion insert and update functions
 */
exports.IurestInvoices.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"payment-history.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/payment/payment-history.collection.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.PaymentsHistory = new meteor_rxjs_1.MongoObservable.Collection('payments_history');
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Allow HistoryPaymentCollection collecion insert and update functions
 */
exports.PaymentsHistory.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"payment-transaction.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/payment/payment-transaction.collection.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.PaymentTransactions = new meteor_rxjs_1.MongoObservable.Collection('payment_transaction');
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Allow HistoryPaymentCollection collecion insert and update functions
 */
exports.PaymentTransactions.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"points":{"bag-plans-history.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/points/bag-plans-history.collection.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * BagPlanHistories Collection
 */
exports.BagPlanHistories = new meteor_rxjs_1.MongoObservable.Collection('bag_plan_histories');
exports.BagPlanHistories.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn,
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"bag-plans.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/points/bag-plans.collection.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * BagPlans Collection
 */
exports.BagPlans = new meteor_rxjs_1.MongoObservable.Collection('bag_plans');
exports.BagPlans.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn,
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"establishment-points.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/points/establishment-points.collection.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * EstablishmentPoints Collection
 */
exports.EstablishmentPoints = new meteor_rxjs_1.MongoObservable.Collection('establishment_points');
exports.EstablishmentPoints.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn,
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"negative-points.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/points/negative-points.collection.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}
/**
 * NegativePoints Collection
 */
exports.NegativePoints = new meteor_rxjs_1.MongoObservable.Collection('negative_points');
exports.NegativePoints.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn,
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"models":{"auth":{"device.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/device.model.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Device {
}
exports.Device = Device;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"menu.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/menu.model.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"role.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/role.model.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-detail.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/user-detail.model.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * User Detail Image Model
 */
class UserDetailImage {
}
exports.UserDetailImage = UserDetailImage;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-login.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/user-login.model.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * User Login Model
 */
class UserLogin {
}
exports.UserLogin = UserLogin;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-penalty.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/user-penalty.model.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-profile.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/user-profile.model.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * User Profile Model
 */
class UserProfile {
}
exports.UserProfile = UserProfile;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/auth/user.model.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"establishment":{"establishment.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/establishment.model.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/node.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Node {
    createNode(_pChars) {
        this.frecuency = 1;
        this.chars = _pChars;
    }
    createNodeExtend(_pFrecuency, _pChars, _pLeft, _pRight) {
        this.frecuency = _pFrecuency;
        this.chars = _pChars;
        this.nodeLeft = _pLeft;
        this.nodeRight = _pRight;
    }
    getChar() {
        return this.chars;
    }
    setChar(_pChar) {
        this.chars = _pChar;
    }
    getFrecuency() {
        return this.frecuency;
    }
    setFrecuency(_pFrecuency) {
        this.frecuency = _pFrecuency;
    }
    getNodeLeft() {
        return this.nodeLeft;
    }
    setNodeLeft(_pLeft) {
        this.nodeLeft = _pLeft;
    }
    getNodeRight() {
        return this.nodeRight;
    }
    setNodeRight(_pNodeRight) {
        this.nodeRight = _pNodeRight;
    }
}
exports.Node = Node;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order-history.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/order-history.model.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/order.model.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward-point.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/reward-point.model.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/reward.model.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"table.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/table.model.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"waiter-call-detail.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/waiter-call-detail.model.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"general":{"city.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/city.model.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cooking-time.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/cooking-time.model.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"country.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/country.model.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"currency.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/currency.model.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email-content.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/email-content.model.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"hour.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/hour.model.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"language.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/language.model.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"menu.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/menu.model.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parameter.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/parameter.model.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"paymentMethod.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/paymentMethod.model.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pick-options.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/pick-options.model.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point-validity.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/point-validity.model.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/point.model.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"queue.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/queue.model.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"type-of-food.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/general/type-of-food.model.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"menu":{"addition.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/addition.model.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"category.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/category.model.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"garnish-food.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/garnish-food.model.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"item.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/item.model.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"option-value.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/option-value.model.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"option.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/option.model.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"section.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/section.model.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"subcategory.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/menu/subcategory.model.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"payment":{"cc-payment-method.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/cc-payment-method.model.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cc-request-colombia.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/cc-request-colombia.model.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CcRequestColombia model
 */
class CcRequestColombia {
}
exports.CcRequestColombia = CcRequestColombia;
/**
 * Merchant model
 */
class Merchant {
}
exports.Merchant = Merchant;
/**
 * Transaction model
 */
class Transaction {
}
exports.Transaction = Transaction;
/**
 * Order model
 */
class Order {
}
exports.Order = Order;
/**
 * Payer model
 */
class Payer {
}
exports.Payer = Payer;
/**
 * CreditCard model
 */
class CreditCard {
}
exports.CreditCard = CreditCard;
/**
 * ExtraParameters model
 */
class ExtraParameters {
}
exports.ExtraParameters = ExtraParameters;
/**
 * AdditionalValues model
 */
class AdditionalValues {
}
exports.AdditionalValues = AdditionalValues;
/**
 * TX_VALUE model
 */
class TX_VALUE {
}
exports.TX_VALUE = TX_VALUE;
/**
 * TX_TAX model
 */
class TX_TAX {
}
exports.TX_TAX = TX_TAX;
/**
 * TX_TAX_RETURN_BASE model
 */
class TX_TAX_RETURN_BASE {
}
exports.TX_TAX_RETURN_BASE = TX_TAX_RETURN_BASE;
/**
 * Buyer model
 */
class Buyer {
}
exports.Buyer = Buyer;
/**
 * ShippingBillingAddress
 */
class ShippingBillingAddress {
}
exports.ShippingBillingAddress = ShippingBillingAddress;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"invoice-info.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/invoice-info.model.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"iurest-invoice.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/iurest-invoice.model.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"payment-history.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/payment-history.model.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"payment-transaction.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/payment-transaction.model.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"response-query.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/response-query.model.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ResponseQuery model
 */
class ResponseQuery {
}
exports.ResponseQuery = ResponseQuery;
/**
 * Merchant model
 */
class Merchant {
}
exports.Merchant = Merchant;
/**
 * Details model
 */
class Details {
}
exports.Details = Details;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"points":{"bag-plan-history.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/points/bag-plan-history.model.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"bag-plan.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/points/bag-plan.model.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"establishment-point.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/points/establishment-point.model.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"negative-point.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/points/negative-point.model.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"collection-object.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/collection-object.model.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"shared-components":{"validators":{"custom-validator.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/shared-components/validators/custom-validator.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomValidators {
    static emailValidator(control) {
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])+?/)) {
            return null;
        }
        else {
            return { 'invalidEmailAddress': true };
        }
    }
    /*
    public static numericValidator(control: AbstractControl) {
      if (control.value.match(/^(0|[1-9][0-9]*)$/)) {
        return null;
      } else {
        return { 'invalidNumericField': true };
      }
    }
    */
    static numericValidator(control) {
        if (control.value.match(/^\d+$/)) {
            return null;
        }
        else {
            return { 'invalidNumericField': true };
        }
    }
    static letterValidator(control) {
        if (control.value.match(/^[A-z]+$/)) {
            return null;
        }
        else {
            return { 'invalidLetterField': true };
        }
    }
    static letterSpaceValidator(control) {
        if (control.value.match(/^[a-zA-Z\s]*$/)) {
            return null;
        }
        else {
            return { 'invalidLetterSpaceField': true };
        }
    }
    static dayOfDateValidator(control) {
        if (control.value >= 1 && control.value <= 31) {
            return null;
        }
        else {
            return { 'invalidDayField': true };
        }
    }
    static monthOfDateValidator(control) {
        if (control.value >= 1 && control.value <= 12) {
            return null;
        }
        else {
            return { 'invalidMonthField': true };
        }
    }
    static yearOfDateValidator(control) {
        if (control.value >= 1970) {
            return null;
        }
        else {
            return { 'invalidYearField': true };
        }
    }
    static noSpacesValidator(control) {
        if (control.value !== null && control.value !== undefined) {
            if (control.value.match(/^\S*$/)) {
                return null;
            }
            else {
                return { 'invalidNoSpacesValidator': true };
            }
        }
    }
}
exports.CustomValidators = CustomValidators;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"server":{"imports":{"fixtures":{"auth":{"account-creation.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/auth/account-creation.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accounts_base_1 = require("meteor/accounts-base");
accounts_base_1.Accounts.onCreateUser(function (options, user) {
    user.profile = options.profile || {};
    user.profile.full_name = options.profile.full_name;
    user.profile.language_code = options.profile.language_code;
    user.profile.gender = options.profile.gender;
    // Returns the user object
    return user;
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email-config.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/auth/email-config.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accounts_base_1 = require("meteor/accounts-base");
const meteor_1 = require("meteor/meteor");
const parameter_collection_1 = require("../../../../both/collections/general/parameter.collection");
const email_content_collection_1 = require("../../../../both/collections/general/email-content.collection");
accounts_base_1.Accounts.urls.resetPassword = function (token) {
    return meteor_1.Meteor.absoluteUrl('reset-password/' + token);
};
function greet() {
    return function (user, url) {
        let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
        let greetVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
        let welcomeMsgVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'welcomeMsgVar');
        let btnTextVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'btnTextVar');
        let beforeMsgVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'beforeMsgVar');
        let regardVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar');
        let followMsgVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar');
        let facebookVar = parameter_collection_1.Parameters.collection.findOne({ name: 'facebook_link' }).value;
        let twitterVar = parameter_collection_1.Parameters.collection.findOne({ name: 'twitter_link' }).value;
        let instagramVar = parameter_collection_1.Parameters.collection.findOne({ name: 'instagram_link' }).value;
        let iurestVar = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_url' }).value;
        let iurestImgVar = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_img_url' }).value;
        var greeting = (user.profile && user.profile.first_name) ? (greetVar + ' ' + user.profile.first_name + ",") : greetVar;
        return `
        <table border="0" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5">
        <tbody>
            <tr>
                <td style="padding: 20px 0 30px 0;">
                    <table style="border-collapse: collapse; box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);"
                        border="0" width="60%" cellspacing="0" cellpadding="0" align="center">
                        <tbody>
                            <tr>
                                <td style="padding: 10px 0 10px 0;" align="center" bgcolor="#3c4146"><img style="display: block;" src=${iurestImgVar}logo_iurest_white.png alt="Reset passwd" /></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 30px 10px 30px;" bgcolor="#ffffff">
                                    <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td style="padding: 15px 0 0 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;">${greeting}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 15px 0 10px 0; font-family: Arial, sans-serif;">${welcomeMsgVar}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 20px 0 20px 0; font-family: Arial, sans-serif;">
                                                    <div align="center"><a style="background-color: white; border-style: solid; border-width: 2px; color: #EF5350; text-align: center; padding: 10px 30px; text-decoration: none; font-weight: bold "
                                                            href="${url}">${btnTextVar}</a></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 0 0 0 0; font-family: Arial, sans-serif;">
                                                    <p>${beforeMsgVar} <br /> ${regardVar}</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0px 30px 10px 30px;" bgcolor="#ffffff">
                                    <hr />
                                    <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td style="font-family: Arial, sans-serif;">${followMsgVar}</td>
                                                <td align="right">
                                                    <table border="0" cellspacing="0" cellpadding="0">
                                                        <tbody>
                                                            <tr>
                                                                <td><a href=${facebookVar}> <img style="display: block;" src=${iurestImgVar}facebook_red.png alt="Facebook" /> </a></td>
                                                                <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                                <td><a href=${twitterVar}> <img style="display: block;" src=${iurestImgVar}twitter_red.png alt="Twitter" /> </a></td>
                                                                <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                                <td><a href=${instagramVar}> <img style="display: block;" src=${iurestImgVar}instagram_red.png alt="Instagram" /> </a></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-family: Arial, sans-serif; padding: 10px 0 10px 0;"><a style="font-family: Arial, sans-serif; text-decoration: none; float: left;"
                                                        href=${iurestVar}>iurest.com</a></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
               `;
    };
}
function greetText() {
    return function (user, url) {
        let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
        let greetVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
        let welcomeMsgVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'welcomeMsgVar');
        let btnTextVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'btnTextVar');
        let beforeMsgVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'beforeMsgVar');
        let regardVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar');
        let followMsgVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar');
        var greeting = (user.profile && user.profile.first_name) ? (greetVar + user.profile.first_name + ",") : greetVar;
        return `    ${greeting}
                    ${welcomeMsgVar}
                    ${url}
                    ${beforeMsgVar}
                    ${regardVar}
               `;
    };
}
accounts_base_1.Accounts.emailTemplates = {
    from: '',
    siteName: meteor_1.Meteor.absoluteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),
    resetPassword: {
        subject: function (user) {
            let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
            let subjectVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'resetPasswordSubjectVar');
            return subjectVar + ' ' + accounts_base_1.Accounts.emailTemplates.siteName;
        },
        html: greet(),
        text: greetText(),
    },
    verifyEmail: {
        subject: function (user) {
            return "How to verify email address on " + accounts_base_1.Accounts.emailTemplates.siteName;
        },
        text: greet()
    },
    enrollAccount: {
        subject: function (user) {
            return "An account has been created for you on " + accounts_base_1.Accounts.emailTemplates.siteName;
        },
        text: greet()
    }
};
accounts_base_1.Accounts.emailTemplates.resetPassword.from = () => {
    let fromVar = parameter_collection_1.Parameters.collection.findOne({ name: 'from_email' }).value;
    return fromVar;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"menus.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/auth/menus.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const menu_collection_1 = require("../../../../both/collections/auth/menu.collection");
function loadMenus() {
    if (menu_collection_1.Menus.find().cursor.count() === 0) {
        const menus = [
            {
                _id: "900",
                is_active: true,
                name: "MENUS.DASHBOARD.DASHBOARD",
                url: "/app/dashboard",
                icon_name: "trending up",
                order: 900
            },
            {
                _id: "910",
                is_active: true,
                name: "MENUS.DASHBOARD.DASHBOARD",
                url: "/app/dashboards",
                icon_name: "trending up",
                order: 910
            },
            {
                _id: "10000",
                is_active: true,
                name: "MENUS.REWARDS",
                url: "/app/rewards",
                icon_name: "grade",
                order: 10000
            },
            {
                _id: "1000",
                is_active: true,
                name: "MENUS.ADMINISTRATION.MANAGEMENT",
                url: "",
                icon_name: "supervisor account",
                order: 1000,
                children: [
                    {
                        _id: "1001",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.RESTAURANTS",
                        url: "",
                        icon_name: "",
                        order: 1001,
                        children: [
                            {
                                _id: "10011",
                                is_active: true,
                                name: "MENUS.ADMINISTRATION.MY_RESTAURANTS",
                                url: "/app/establishment",
                                icon_name: "",
                                order: 10011
                            }, {
                                _id: "10012",
                                is_active: true,
                                name: "MENUS.ADMINISTRATION.PROFILE",
                                url: "/app/establishment-profile",
                                icon_name: "",
                                order: 10012
                            }, {
                                _id: "10013",
                                is_active: true,
                                name: "MENUS.ADMINISTRATION.MONTHLY_CONFIG",
                                url: "/app/establishment-list",
                                icon_name: "",
                                order: 10013
                            }
                        ]
                    }, {
                        _id: "1002",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.TABLES",
                        url: "",
                        icon_name: "",
                        order: 1002,
                        children: [
                            {
                                _id: "10021",
                                is_active: true,
                                name: "MENUS.ADMINISTRATION.TABLES_SEARCH",
                                url: "/app/tables",
                                icon_name: "",
                                order: 10021
                            }, {
                                _id: "10022",
                                is_active: true,
                                name: "MENUS.ADMINISTRATION.TABLE_CONTROL",
                                url: "/app/establishment-table-control",
                                icon_name: "",
                                order: 10022
                            }
                        ]
                    }, {
                        _id: "1003",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.COLLABORATORS",
                        url: "/app/collaborators",
                        icon_name: "",
                        order: 1003
                    }
                ]
            },
            {
                _id: "1100",
                is_active: true,
                name: "MENUS.ADMINISTRATION.COLLABORATORS",
                url: "/app/supervisor-collaborators",
                icon_name: "supervisor account",
                order: 1100
            },
            {
                _id: "1200",
                is_active: true,
                name: "MENUS.ADMINISTRATION.TABLES",
                url: "/app/supervisor-tables",
                icon_name: "restaurant",
                order: 1200
            },
            {
                _id: "1300",
                is_active: true,
                name: "MENUS.ADMINISTRATION.TABLE_CONTROL",
                url: "/app/supervisor-establishment-table-control",
                icon_name: "list",
                order: 1300
            },
            {
                _id: "2000",
                is_active: false,
                name: "MENUS.PAYMENTS.PAYMENTS",
                url: "",
                icon_name: "payment",
                order: 2000,
                children: [
                    {
                        _id: "2001",
                        is_active: true,
                        name: "MENUS.PAYMENTS.MONTHLY_PAYMENT",
                        url: "/app/monthly-payment",
                        icon_name: "",
                        order: 2001
                    },
                    {
                        _id: "2002",
                        is_active: true,
                        name: "MENUS.PAYMENTS.PAYMENT_HISTORY",
                        url: "/app/payment-history",
                        icon_name: "",
                        order: 2002
                    },
                    {
                        _id: "2003",
                        is_active: true,
                        name: "MENUS.PAYMENTS.REACTIVATE_RESTAURANT",
                        url: "/app/reactivate-establishment",
                        icon_name: "",
                        order: 2003
                    }
                ]
            },
            {
                _id: "1400",
                is_active: true,
                name: "MENUS.ADMINISTRATION.ORDERS_TODAY",
                url: "/app/orders-today",
                icon_name: "assignment",
                order: 1300
            },
            {
                _id: "3000",
                is_active: true,
                name: "MENUS.MENU_DEFINITION.MENU_DEFINITION",
                url: "",
                icon_name: "list",
                order: 3000,
                children: [
                    {
                        _id: "3001",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.SECTIONS",
                        url: "/app/sections",
                        icon_name: "",
                        order: 3001
                    }, {
                        _id: "3002",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.CATEGORIES",
                        url: "/app/categories",
                        icon_name: "",
                        order: 3002
                    }, {
                        _id: "3003",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.SUBCATEGORIES",
                        url: "/app/subcategories",
                        icon_name: "",
                        order: 3003
                    }, {
                        _id: "3004",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.ADDITIONS",
                        url: "/app/additions",
                        icon_name: "",
                        order: 3004
                    }, {
                        _id: "3005",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.OPTIONS_VALUES",
                        url: "",
                        icon_name: "",
                        order: 3005,
                        children: [
                            {
                                _id: "30051",
                                is_active: true,
                                name: "MENUS.MENU_DEFINITION.OPTIONS",
                                url: "/app/options",
                                icon_name: "",
                                order: 30051
                            },
                            {
                                _id: "30052",
                                is_active: true,
                                name: "MENUS.MENU_DEFINITION.VALUES",
                                url: "/app/option-values",
                                icon_name: "",
                                order: 30052
                            }
                        ]
                    }, {
                        _id: "3006",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.ITEMS",
                        url: "/app/items",
                        icon_name: "",
                        order: 3006
                    }, {
                        _id: "3007",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.ITEMS_ENABLE",
                        url: "/app/items-enable",
                        icon_name: "",
                        order: 3007
                    }
                ]
            },
            {
                _id: "3100",
                is_active: true,
                name: "MENUS.MENU_DEFINITION.ITEMS_ENABLE",
                url: "/app/items-enable-sup",
                icon_name: "done all",
                order: 3100
            },
            {
                _id: "4000",
                is_active: true,
                name: "MENUS.ORDERS",
                url: "/app/orders",
                icon_name: "dns",
                order: 4000
            },
            {
                _id: "6000",
                is_active: true,
                name: "MENUS.WAITER_CALL",
                url: "/app/waiter-call",
                icon_name: "record_voice_over",
                order: 6000
            },
            {
                _id: "7000",
                is_active: true,
                name: "MENUS.MENU_DEFINITION.ORDERS_CHEF",
                url: "/app/chef-orders",
                icon_name: "list",
                order: 7000
            },
            {
                _id: "8000",
                is_active: true,
                name: "MENUS.CALLS",
                url: "/app/calls",
                icon_name: "pan_tool",
                order: 8000
            },
            {
                _id: "9000",
                is_active: true,
                name: "MENUS.MENU_DEFINITION.MENU_DEFINITION",
                url: "/app/menu-list",
                icon_name: "restaurant_menu",
                order: 9000
            },
            {
                _id: "20000",
                is_active: true,
                name: "MENUS.SETTINGS",
                url: "/app/settings",
                icon_name: "settings",
                order: 20000
            },
            {
                _id: "11000",
                is_active: true,
                name: "MENUS.TABLES",
                url: "/app/table-change",
                icon_name: "compare_arrows",
                order: 11000
            },
            {
                _id: "12000",
                is_active: true,
                name: "MENUS.RESTAURANT_EXIT",
                url: "/app/establishment-exit",
                icon_name: "exit_to_app",
                order: 12000
            },
            {
                _id: "19000",
                is_active: true,
                name: "MENUS.POINTS",
                url: "/app/points",
                icon_name: "payment",
                order: 19000
            },
            {
                _id: "13000",
                is_active: true,
                name: "MENUS.ADMINISTRATION.ORDERS_TODAY",
                url: "/app/cashier-orders-today",
                icon_name: "assignment",
                order: 13000
            }
        ];
        menus.forEach((menu) => menu_collection_1.Menus.insert(menu));
    }
}
exports.loadMenus = loadMenus;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"roles.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/auth/roles.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_collection_1 = require("../../../../both/collections/auth/role.collection");
function loadRoles() {
    if (role_collection_1.Roles.find().cursor.count() === 0) {
        const roles = [{
                _id: "100",
                is_active: true,
                name: "ROLE.ADMINISTRATOR",
                description: "establishment administrator",
                menus: ["900", "1000", "1400", "2000", "3000", "10000", "20000"]
            }, {
                _id: "200",
                is_active: true,
                name: "ROLE.WAITER",
                description: "establishment waiter",
                menus: ["8000", "9000", "20000"],
                user_prefix: 'wa'
            }, {
                _id: "300",
                is_active: true,
                name: "ROLE.CASHIER",
                description: "establishment cashier",
                menus: ["13000", "20000"],
                user_prefix: 'ca'
            }, {
                _id: "400",
                is_active: true,
                name: "ROLE.CUSTOMER",
                description: "establishment customer",
                menus: ["4000", "6000", "11000", "12000", "20000", "19000"]
            }, {
                _id: "600",
                is_active: true,
                name: "ROLE.SUPERVISOR",
                description: "establishment supervisor",
                menus: ["910", "1100", "3100", "1200", "1300", "20000"],
                user_prefix: 'sp'
            }];
        roles.forEach((role) => role_collection_1.Roles.insert(role));
    }
}
exports.loadRoles = loadRoles;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"general":{"cities.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/cities.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const city_collection_1 = require("../../../../both/collections/general/city.collection");
function loadCities() {
    if (city_collection_1.Cities.find().cursor.count() === 0) {
        const cities = [
            { _id: '1901', is_active: true, name: 'Aguadas', country: '1900' },
            { _id: '1902', is_active: true, name: 'Amazonas', country: '1900' },
            { _id: '1903', is_active: true, name: 'Arauca', country: '1900' },
            { _id: '1904', is_active: true, name: 'Armenia', country: '1900' },
            { _id: '1905', is_active: true, name: 'Barichara', country: '1900' },
            { _id: '1906', is_active: true, name: 'Barranquilla', country: '1900' },
            { _id: '1907', is_active: true, name: 'Bogotá D.C', country: '1900' },
            { _id: '1908', is_active: true, name: 'Bucaramanga', country: '1900' },
            { _id: '1909', is_active: true, name: 'Buenaventura', country: '1900' },
            { _id: '1910', is_active: true, name: 'Buga', country: '1900' },
            { _id: '1911', is_active: true, name: 'Cali', country: '1900' },
            { _id: '1912', is_active: true, name: 'Cartagena de Indias', country: '1900' },
            { _id: '1913', is_active: true, name: 'Cartago', country: '1900' },
            { _id: '1914', is_active: true, name: 'Chiquinquirá', country: '1900' },
            { _id: '1915', is_active: true, name: 'Chocó', country: '1900' },
            { _id: '1916', is_active: true, name: 'Ciénaga', country: '1900' },
            { _id: '1917', is_active: true, name: 'Cúcuta', country: '1900' },
            { _id: '1918', is_active: true, name: 'El Cocuy', country: '1900' },
            { _id: '1919', is_active: true, name: 'El Espinal', country: '1900' },
            { _id: '1920', is_active: true, name: 'El Hobo', country: '1900' },
            { _id: '1921', is_active: true, name: 'El Jardín', country: '1900' },
            { _id: '1922', is_active: true, name: 'Florencia', country: '1900' },
            { _id: '1923', is_active: true, name: 'Girardot', country: '1900' },
            { _id: '1924', is_active: true, name: 'Girón', country: '1900' },
            { _id: '1925', is_active: true, name: 'Guaduas', country: '1900' },
            { _id: '1926', is_active: true, name: 'Guainía', country: '1900' },
            { _id: '1927', is_active: true, name: 'Guapi', country: '1900' },
            { _id: '1928', is_active: true, name: 'Honda', country: '1900' },
            { _id: '1929', is_active: true, name: 'Ibagué', country: '1900' },
            { _id: '1930', is_active: true, name: 'Inzá', country: '1900' },
            { _id: '1931', is_active: true, name: 'Jericó', country: '1900' },
            { _id: '1932', is_active: true, name: 'La Calera', country: '1900' },
            { _id: '1933', is_active: true, name: 'La Macarena', country: '1900' },
            { _id: '1934', is_active: true, name: 'La Playa de Belén', country: '1900' },
            { _id: '1935', is_active: true, name: 'Lorica', country: '1900' },
            { _id: '1936', is_active: true, name: 'Manizales', country: '1900' },
            { _id: '1937', is_active: true, name: 'Medellín', country: '1900' },
            { _id: '1938', is_active: true, name: 'Melgar', country: '1900' },
            { _id: '1939', is_active: true, name: 'Mitú', country: '1900' },
            { _id: '1940', is_active: true, name: 'Mocoa', country: '1900' },
            { _id: '1941', is_active: true, name: 'Mompox', country: '1900' },
            { _id: '1942', is_active: true, name: 'Monguí', country: '1900' },
            { _id: '1943', is_active: true, name: 'Montería', country: '1900' },
            { _id: '1944', is_active: true, name: 'Neiva', country: '1900' },
            { _id: '1945', is_active: true, name: 'Paipa', country: '1900' },
            { _id: '1946', is_active: true, name: 'Pamplona', country: '1900' },
            { _id: '1947', is_active: true, name: 'Pasto', country: '1900' },
            { _id: '1948', is_active: true, name: 'Pereira', country: '1900' },
            { _id: '1949', is_active: true, name: 'Pitalito', country: '1900' },
            { _id: '1950', is_active: true, name: 'Popayán', country: '1900' },
            { _id: '1951', is_active: true, name: 'Prado', country: '1900' },
            { _id: '1952', is_active: true, name: 'Puerto Carreño', country: '1900' },
            { _id: '1953', is_active: true, name: 'Riohacha', country: '1900' },
            { _id: '1954', is_active: true, name: 'Salamina', country: '1900' },
            { _id: '1955', is_active: true, name: 'San Agustín', country: '1900' },
            { _id: '1956', is_active: true, name: 'San Andrés', country: '1900' },
            { _id: '1957', is_active: true, name: 'San Gil', country: '1900' },
            { _id: '1958', is_active: true, name: 'San José del Guaviare', country: '1900' },
            { _id: '1959', is_active: true, name: 'Santa Fe de Antioquia', country: '1900' },
            { _id: '1960', is_active: true, name: 'Santa Marta', country: '1900' },
            { _id: '1961', is_active: true, name: 'Santa Rosa de Cabal', country: '1900' },
            { _id: '1962', is_active: true, name: 'Sibundoy', country: '1900' },
            { _id: '1963', is_active: true, name: 'Sincelejo', country: '1900' },
            { _id: '1964', is_active: true, name: 'Socorro', country: '1900' },
            { _id: '1965', is_active: true, name: 'Sogamoso', country: '1900' },
            { _id: '1966', is_active: true, name: 'Tunja', country: '1900' },
            { _id: '1967', is_active: true, name: 'Valledupar', country: '1900' },
            { _id: '1968', is_active: true, name: 'Villa de Leyva', country: '1900' },
            { _id: '1969', is_active: true, name: 'Villavicencio', country: '1900' },
            { _id: '1970', is_active: true, name: 'Villeta', country: '1900' },
            { _id: '1971', is_active: true, name: 'Yopal', country: '1900' },
            { _id: '1972', is_active: true, name: 'Zipaquirá', country: '1900' },
            { _id: '1701', is_active: true, name: 'Aisén', country: '1700' },
            { _id: '1702', is_active: true, name: 'Algarrobo', country: '1700' },
            { _id: '1703', is_active: true, name: 'Alhué', country: '1700' },
            { _id: '1704', is_active: true, name: 'Alto Biobío', country: '1700' },
            { _id: '1705', is_active: true, name: 'Alto del Carmen', country: '1700' },
            { _id: '1706', is_active: true, name: 'Alto Hospicio', country: '1700' },
            { _id: '1707', is_active: true, name: 'Ancud', country: '1700' },
            { _id: '1708', is_active: true, name: 'Andacollo', country: '1700' },
            { _id: '1709', is_active: true, name: 'Angol', country: '1700' },
            { _id: '1710', is_active: true, name: 'Antártica', country: '1700' },
            { _id: '1711', is_active: true, name: 'Antofagasta', country: '1700' },
            { _id: '1712', is_active: true, name: 'Antuco', country: '1700' },
            { _id: '1713', is_active: true, name: 'Arauco', country: '1700' },
            { _id: '1714', is_active: true, name: 'Arica', country: '1700' },
            { _id: '1715', is_active: true, name: 'Buin', country: '1700' },
            { _id: '1716', is_active: true, name: 'Bulnes', country: '1700' },
            { _id: '1717', is_active: true, name: 'Cabildo', country: '1700' },
            { _id: '1718', is_active: true, name: 'Cabo de Hornos', country: '1700' },
            { _id: '1719', is_active: true, name: 'Cabrero', country: '1700' },
            { _id: '1720', is_active: true, name: 'Calama', country: '1700' },
            { _id: '1721', is_active: true, name: 'Calbuco', country: '1700' },
            { _id: '1722', is_active: true, name: 'Caldera', country: '1700' },
            { _id: '1723', is_active: true, name: 'Calera', country: '1700' },
            { _id: '1724', is_active: true, name: 'Calera de Tango', country: '1700' },
            { _id: '1725', is_active: true, name: 'Calle Larga', country: '1700' },
            { _id: '1726', is_active: true, name: 'Camarones', country: '1700' },
            { _id: '1727', is_active: true, name: 'Camiña', country: '1700' },
            { _id: '1728', is_active: true, name: 'Canela', country: '1700' },
            { _id: '1729', is_active: true, name: 'Cañete', country: '1700' },
            { _id: '1730', is_active: true, name: 'Carahue', country: '1700' },
            { _id: '1731', is_active: true, name: 'Cartagena', country: '1700' },
            { _id: '1732', is_active: true, name: 'Casablanca', country: '1700' },
            { _id: '1733', is_active: true, name: 'Castro', country: '1700' },
            { _id: '1734', is_active: true, name: 'Catemu', country: '1700' },
            { _id: '1735', is_active: true, name: 'Cauquenes', country: '1700' },
            { _id: '1736', is_active: true, name: 'Cerrillos', country: '1700' },
            { _id: '1737', is_active: true, name: 'Cerro Navia', country: '1700' },
            { _id: '1738', is_active: true, name: 'Chaitén', country: '1700' },
            { _id: '1739', is_active: true, name: 'Chanco', country: '1700' },
            { _id: '1740', is_active: true, name: 'Chañaral', country: '1700' },
            { _id: '1741', is_active: true, name: 'Chépica', country: '1700' },
            { _id: '1742', is_active: true, name: 'Chiguayante', country: '1700' },
            { _id: '1743', is_active: true, name: 'Chile Chico', country: '1700' },
            { _id: '1744', is_active: true, name: 'Chillán', country: '1700' },
            { _id: '1745', is_active: true, name: 'Chillán Viejo', country: '1700' },
            { _id: '1746', is_active: true, name: 'Chimbarongo', country: '1700' },
            { _id: '1747', is_active: true, name: 'Cholchol', country: '1700' },
            { _id: '1748', is_active: true, name: 'Chonchi', country: '1700' },
            { _id: '1749', is_active: true, name: 'Cisnes', country: '1700' },
            { _id: '1750', is_active: true, name: 'Cobquecura', country: '1700' },
            { _id: '1751', is_active: true, name: 'Cochamó', country: '1700' },
            { _id: '1752', is_active: true, name: 'Cochrane', country: '1700' },
            { _id: '1753', is_active: true, name: 'Codegua', country: '1700' },
            { _id: '1754', is_active: true, name: 'Coelemu', country: '1700' },
            { _id: '1755', is_active: true, name: 'Coihaique', country: '1700' },
            { _id: '1756', is_active: true, name: 'Coihueco', country: '1700' },
            { _id: '1757', is_active: true, name: 'Coinco', country: '1700' },
            { _id: '1758', is_active: true, name: 'Colbún', country: '1700' },
            { _id: '1759', is_active: true, name: 'Colchane', country: '1700' },
            { _id: '1760', is_active: true, name: 'Colina', country: '1700' },
            { _id: '1761', is_active: true, name: 'Collipulli', country: '1700' },
            { _id: '1762', is_active: true, name: 'Coltauco', country: '1700' },
            { _id: '1763', is_active: true, name: 'Combarbalá', country: '1700' },
            { _id: '1764', is_active: true, name: 'Concepción', country: '1700' },
            { _id: '1765', is_active: true, name: 'Conchalí', country: '1700' },
            { _id: '1766', is_active: true, name: 'Concón', country: '1700' },
            { _id: '1767', is_active: true, name: 'Constitución', country: '1700' },
            { _id: '1768', is_active: true, name: 'Contulmo', country: '1700' },
            { _id: '1769', is_active: true, name: 'Copiapó', country: '1700' },
            { _id: '1770', is_active: true, name: 'Coquimbo', country: '1700' },
            { _id: '1771', is_active: true, name: 'Coronel', country: '1700' },
            { _id: '1772', is_active: true, name: 'Corral', country: '1700' },
            { _id: '1773', is_active: true, name: 'Cunco', country: '1700' },
            { _id: '1774', is_active: true, name: 'Curacautín', country: '1700' },
            { _id: '1775', is_active: true, name: 'Curacaví', country: '1700' },
            { _id: '1776', is_active: true, name: 'Curaco de Vélez', country: '1700' },
            { _id: '1777', is_active: true, name: 'Curanilahue', country: '1700' },
            { _id: '1778', is_active: true, name: 'Curarrehue', country: '1700' },
            { _id: '1779', is_active: true, name: 'Curepto', country: '1700' },
            { _id: '1780', is_active: true, name: 'Curicó', country: '1700' },
            { _id: '1781', is_active: true, name: 'Dalcahue', country: '1700' },
            { _id: '1782', is_active: true, name: 'Diego de Almagro', country: '1700' },
            { _id: '1783', is_active: true, name: 'Doñihue', country: '1700' },
            { _id: '1784', is_active: true, name: 'El Bosque', country: '1700' },
            { _id: '1785', is_active: true, name: 'El Carmen', country: '1700' },
            { _id: '1786', is_active: true, name: 'El Monte', country: '1700' },
            { _id: '1787', is_active: true, name: 'El Quisco', country: '1700' },
            { _id: '1788', is_active: true, name: 'El Tabo', country: '1700' },
            { _id: '1789', is_active: true, name: 'Empedrado', country: '1700' },
            { _id: '1790', is_active: true, name: 'Ercilla', country: '1700' },
            { _id: '1791', is_active: true, name: 'Estación Central', country: '1700' },
            { _id: '1792', is_active: true, name: 'Florida', country: '1700' },
            { _id: '1793', is_active: true, name: 'Freire', country: '1700' },
            { _id: '1794', is_active: true, name: 'Freirina', country: '1700' },
            { _id: '1795', is_active: true, name: 'Fresia', country: '1700' },
            { _id: '1796', is_active: true, name: 'Frutillar', country: '1700' },
            { _id: '1797', is_active: true, name: 'Futaleufú', country: '1700' },
            { _id: '1798', is_active: true, name: 'Futrono', country: '1700' },
            { _id: '1799', is_active: true, name: 'Galvarino', country: '1700' },
            { _id: '17100', is_active: true, name: 'General Lagos', country: '1700' },
            { _id: '17101', is_active: true, name: 'Gorbea', country: '1700' },
            { _id: '17102', is_active: true, name: 'Graneros', country: '1700' },
            { _id: '17103', is_active: true, name: 'Guaitecas', country: '1700' },
            { _id: '17104', is_active: true, name: 'Hijuelas', country: '1700' },
            { _id: '17105', is_active: true, name: 'Hualaihué', country: '1700' },
            { _id: '17106', is_active: true, name: 'Hualañé', country: '1700' },
            { _id: '17107', is_active: true, name: 'Hualpén', country: '1700' },
            { _id: '17108', is_active: true, name: 'Hualqui', country: '1700' },
            { _id: '17109', is_active: true, name: 'Huara', country: '1700' },
            { _id: '17110', is_active: true, name: 'Huasco', country: '1700' },
            { _id: '17111', is_active: true, name: 'Huechuraba', country: '1700' },
            { _id: '17112', is_active: true, name: 'Ignorada', country: '1700' },
            { _id: '17113', is_active: true, name: 'Illapel', country: '1700' },
            { _id: '17114', is_active: true, name: 'Independencia', country: '1700' },
            { _id: '17115', is_active: true, name: 'Iquique', country: '1700' },
            { _id: '17116', is_active: true, name: 'Isla de Maipo', country: '1700' },
            { _id: '17117', is_active: true, name: 'Isla de Pascua', country: '1700' },
            { _id: '17118', is_active: true, name: 'Juan Fernández', country: '1700' },
            { _id: '17119', is_active: true, name: 'La Cisterna', country: '1700' },
            { _id: '17120', is_active: true, name: 'La Cruz', country: '1700' },
            { _id: '17121', is_active: true, name: 'La Estrella', country: '1700' },
            { _id: '17122', is_active: true, name: 'La Florida', country: '1700' },
            { _id: '17123', is_active: true, name: 'La Granja', country: '1700' },
            { _id: '17124', is_active: true, name: 'La Higuera', country: '1700' },
            { _id: '17125', is_active: true, name: 'La Ligua', country: '1700' },
            { _id: '17126', is_active: true, name: 'La Pintana', country: '1700' },
            { _id: '17127', is_active: true, name: 'La Reina', country: '1700' },
            { _id: '17128', is_active: true, name: 'La Serena', country: '1700' },
            { _id: '17129', is_active: true, name: 'La Unión', country: '1700' },
            { _id: '17130', is_active: true, name: 'Lago Ranco', country: '1700' },
            { _id: '17131', is_active: true, name: 'Lago Verde', country: '1700' },
            { _id: '17132', is_active: true, name: 'Laguna Blanca', country: '1700' },
            { _id: '17133', is_active: true, name: 'Laja', country: '1700' },
            { _id: '17134', is_active: true, name: 'Lampa', country: '1700' },
            { _id: '17135', is_active: true, name: 'Lanco', country: '1700' },
            { _id: '17136', is_active: true, name: 'Las Cabras', country: '1700' },
            { _id: '17137', is_active: true, name: 'Las Condes', country: '1700' },
            { _id: '17138', is_active: true, name: 'Lautaro', country: '1700' },
            { _id: '17139', is_active: true, name: 'Lebu', country: '1700' },
            { _id: '17140', is_active: true, name: 'Licantén', country: '1700' },
            { _id: '17141', is_active: true, name: 'Limache', country: '1700' },
            { _id: '17142', is_active: true, name: 'Linares', country: '1700' },
            { _id: '17143', is_active: true, name: 'Litueche', country: '1700' },
            { _id: '17144', is_active: true, name: 'Llaillay', country: '1700' },
            { _id: '17145', is_active: true, name: 'Llanquihue', country: '1700' },
            { _id: '17146', is_active: true, name: 'Lo Barnechea', country: '1700' },
            { _id: '17147', is_active: true, name: 'Lo Espejo', country: '1700' },
            { _id: '17148', is_active: true, name: 'Lo Prado', country: '1700' },
            { _id: '17149', is_active: true, name: 'Lolol', country: '1700' },
            { _id: '17150', is_active: true, name: 'Loncoche', country: '1700' },
            { _id: '17151', is_active: true, name: 'Longaví', country: '1700' },
            { _id: '17152', is_active: true, name: 'Lonquimay', country: '1700' },
            { _id: '17153', is_active: true, name: 'Los Álamos', country: '1700' },
            { _id: '17154', is_active: true, name: 'Los Andes', country: '1700' },
            { _id: '17155', is_active: true, name: 'Los Ángeles', country: '1700' },
            { _id: '17156', is_active: true, name: 'Los Lagos', country: '1700' },
            { _id: '17157', is_active: true, name: 'Los Muermos', country: '1700' },
            { _id: '17158', is_active: true, name: 'Los Sauces', country: '1700' },
            { _id: '17159', is_active: true, name: 'Los Vilos', country: '1700' },
            { _id: '17160', is_active: true, name: 'Lota', country: '1700' },
            { _id: '17161', is_active: true, name: 'Lumaco', country: '1700' },
            { _id: '17162', is_active: true, name: 'Machalí', country: '1700' },
            { _id: '17163', is_active: true, name: 'Macul', country: '1700' },
            { _id: '17164', is_active: true, name: 'Máfil', country: '1700' },
            { _id: '17165', is_active: true, name: 'Maipú', country: '1700' },
            { _id: '17166', is_active: true, name: 'Malloa', country: '1700' },
            { _id: '17167', is_active: true, name: 'Marchihue', country: '1700' },
            { _id: '17168', is_active: true, name: 'María Elena', country: '1700' },
            { _id: '17169', is_active: true, name: 'María Pinto', country: '1700' },
            { _id: '17170', is_active: true, name: 'Mariquina', country: '1700' },
            { _id: '17171', is_active: true, name: 'Maule', country: '1700' },
            { _id: '17172', is_active: true, name: 'Maullín', country: '1700' },
            { _id: '17173', is_active: true, name: 'Mejillones', country: '1700' },
            { _id: '17174', is_active: true, name: 'Melipeuco', country: '1700' },
            { _id: '17175', is_active: true, name: 'Melipilla', country: '1700' },
            { _id: '17176', is_active: true, name: 'Molina', country: '1700' },
            { _id: '17177', is_active: true, name: 'Monte Patria', country: '1700' },
            { _id: '17178', is_active: true, name: 'Mostazal', country: '1700' },
            { _id: '17179', is_active: true, name: 'Mulchén', country: '1700' },
            { _id: '17180', is_active: true, name: 'Nacimiento', country: '1700' },
            { _id: '17181', is_active: true, name: 'Nancagua', country: '1700' },
            { _id: '17182', is_active: true, name: 'Natales', country: '1700' },
            { _id: '17183', is_active: true, name: 'Navidad', country: '1700' },
            { _id: '17184', is_active: true, name: 'Negrete', country: '1700' },
            { _id: '17185', is_active: true, name: 'Ninhue', country: '1700' },
            { _id: '17186', is_active: true, name: 'Nogales', country: '1700' },
            { _id: '17187', is_active: true, name: 'Nueva Imperial', country: '1700' },
            { _id: '17188', is_active: true, name: 'Ñiquén', country: '1700' },
            { _id: '17189', is_active: true, name: 'Ñuñoa', country: '1700' },
            { _id: '17190', is_active: true, name: 'OHiggins', country: '1700' },
            { _id: '17191', is_active: true, name: 'Olivar', country: '1700' },
            { _id: '17192', is_active: true, name: 'Ollagüe', country: '1700' },
            { _id: '17193', is_active: true, name: 'Olmué', country: '1700' },
            { _id: '17194', is_active: true, name: 'Osorno', country: '1700' },
            { _id: '17195', is_active: true, name: 'Ovalle', country: '1700' },
            { _id: '17196', is_active: true, name: 'Padre Hurtado', country: '1700' },
            { _id: '17197', is_active: true, name: 'Padre Las Casas', country: '1700' },
            { _id: '17198', is_active: true, name: 'Paiguano', country: '1700' },
            { _id: '17199', is_active: true, name: 'Paillaco', country: '1700' },
            { _id: '17200', is_active: true, name: 'Paine', country: '1700' },
            { _id: '17201', is_active: true, name: 'Palena', country: '1700' },
            { _id: '17202', is_active: true, name: 'Palmilla', country: '1700' },
            { _id: '17203', is_active: true, name: 'Panguipulli', country: '1700' },
            { _id: '17204', is_active: true, name: 'Panquehue', country: '1700' },
            { _id: '17205', is_active: true, name: 'Papudo', country: '1700' },
            { _id: '17206', is_active: true, name: 'Paredones', country: '1700' },
            { _id: '17207', is_active: true, name: 'Parral', country: '1700' },
            { _id: '17208', is_active: true, name: 'Pedro Aguirre Cerda', country: '1700' },
            { _id: '17209', is_active: true, name: 'Pelarco', country: '1700' },
            { _id: '17210', is_active: true, name: 'Pelluhue', country: '1700' },
            { _id: '17211', is_active: true, name: 'Pemuco', country: '1700' },
            { _id: '17212', is_active: true, name: 'Pencahue', country: '1700' },
            { _id: '17213', is_active: true, name: 'Penco', country: '1700' },
            { _id: '17214', is_active: true, name: 'Peñaflor', country: '1700' },
            { _id: '17215', is_active: true, name: 'Peñalolén', country: '1700' },
            { _id: '17216', is_active: true, name: 'Peralillo', country: '1700' },
            { _id: '17217', is_active: true, name: 'Perquenco', country: '1700' },
            { _id: '17218', is_active: true, name: 'Petorca', country: '1700' },
            { _id: '17219', is_active: true, name: 'Peumo', country: '1700' },
            { _id: '17220', is_active: true, name: 'Pica', country: '1700' },
            { _id: '17221', is_active: true, name: 'Pichidegua', country: '1700' },
            { _id: '17222', is_active: true, name: 'Pichilemu', country: '1700' },
            { _id: '17223', is_active: true, name: 'Pinto', country: '1700' },
            { _id: '17224', is_active: true, name: 'Pirque', country: '1700' },
            { _id: '17225', is_active: true, name: 'Pitrufquén', country: '1700' },
            { _id: '17226', is_active: true, name: 'Placilla', country: '1700' },
            { _id: '17227', is_active: true, name: 'Portezuelo', country: '1700' },
            { _id: '17228', is_active: true, name: 'Porvenir', country: '1700' },
            { _id: '17229', is_active: true, name: 'Pozo Almonte', country: '1700' },
            { _id: '17230', is_active: true, name: 'Primavera', country: '1700' },
            { _id: '17231', is_active: true, name: 'Providencia', country: '1700' },
            { _id: '17232', is_active: true, name: 'Puchuncaví', country: '1700' },
            { _id: '17233', is_active: true, name: 'Pucón', country: '1700' },
            { _id: '17234', is_active: true, name: 'Pudahuel', country: '1700' },
            { _id: '17235', is_active: true, name: 'Puente Alto', country: '1700' },
            { _id: '17236', is_active: true, name: 'Puerto Montt', country: '1700' },
            { _id: '17237', is_active: true, name: 'Puerto Octay', country: '1700' },
            { _id: '17238', is_active: true, name: 'Puerto Varas', country: '1700' },
            { _id: '17239', is_active: true, name: 'Pumanque', country: '1700' },
            { _id: '17240', is_active: true, name: 'Punitaqui', country: '1700' },
            { _id: '17241', is_active: true, name: 'Punta Arenas', country: '1700' },
            { _id: '17242', is_active: true, name: 'Puqueldón', country: '1700' },
            { _id: '17243', is_active: true, name: 'Purén', country: '1700' },
            { _id: '17244', is_active: true, name: 'Purranque', country: '1700' },
            { _id: '17245', is_active: true, name: 'Putaendo', country: '1700' },
            { _id: '17246', is_active: true, name: 'Putre', country: '1700' },
            { _id: '17247', is_active: true, name: 'Puyehue', country: '1700' },
            { _id: '17248', is_active: true, name: 'Queilén', country: '1700' },
            { _id: '17249', is_active: true, name: 'Quellón', country: '1700' },
            { _id: '17250', is_active: true, name: 'Quemchi', country: '1700' },
            { _id: '17251', is_active: true, name: 'Quilaco', country: '1700' },
            { _id: '17252', is_active: true, name: 'Quilicura', country: '1700' },
            { _id: '17253', is_active: true, name: 'Quilleco', country: '1700' },
            { _id: '17254', is_active: true, name: 'Quillón', country: '1700' },
            { _id: '17255', is_active: true, name: 'Quillota', country: '1700' },
            { _id: '17256', is_active: true, name: 'Quilpué', country: '1700' },
            { _id: '17257', is_active: true, name: 'Quinchao', country: '1700' },
            { _id: '17258', is_active: true, name: 'Quinta de Tilcoco', country: '1700' },
            { _id: '17259', is_active: true, name: 'Quinta Normal', country: '1700' },
            { _id: '17260', is_active: true, name: 'Quintero', country: '1700' },
            { _id: '17261', is_active: true, name: 'Quirihue', country: '1700' },
            { _id: '17262', is_active: true, name: 'Rancagua', country: '1700' },
            { _id: '17263', is_active: true, name: 'Ránquil', country: '1700' },
            { _id: '17264', is_active: true, name: 'Rauco', country: '1700' },
            { _id: '17265', is_active: true, name: 'Recoleta', country: '1700' },
            { _id: '17266', is_active: true, name: 'Renaico', country: '1700' },
            { _id: '17267', is_active: true, name: 'Renca', country: '1700' },
            { _id: '17268', is_active: true, name: 'Rengo', country: '1700' },
            { _id: '17269', is_active: true, name: 'Requínoa', country: '1700' },
            { _id: '17270', is_active: true, name: 'Retiro', country: '1700' },
            { _id: '17271', is_active: true, name: 'Rinconada', country: '1700' },
            { _id: '17272', is_active: true, name: 'Río Bueno', country: '1700' },
            { _id: '17273', is_active: true, name: 'Río Claro', country: '1700' },
            { _id: '17274', is_active: true, name: 'Río Hurtado', country: '1700' },
            { _id: '17275', is_active: true, name: 'Río Ibáñez', country: '1700' },
            { _id: '17276', is_active: true, name: 'Río Negro', country: '1700' },
            { _id: '17277', is_active: true, name: 'Río Verde', country: '1700' },
            { _id: '17278', is_active: true, name: 'Romeral', country: '1700' },
            { _id: '17279', is_active: true, name: 'Saavedra', country: '1700' },
            { _id: '17280', is_active: true, name: 'Sagrada Familia', country: '1700' },
            { _id: '17281', is_active: true, name: 'Salamanca', country: '1700' },
            { _id: '17282', is_active: true, name: 'San Antonio', country: '1700' },
            { _id: '17283', is_active: true, name: 'San Bernardo', country: '1700' },
            { _id: '17284', is_active: true, name: 'San Carlos', country: '1700' },
            { _id: '17285', is_active: true, name: 'San Clemente', country: '1700' },
            { _id: '17286', is_active: true, name: 'San Esteban', country: '1700' },
            { _id: '17287', is_active: true, name: 'San Fabián', country: '1700' },
            { _id: '17288', is_active: true, name: 'San Felipe', country: '1700' },
            { _id: '17289', is_active: true, name: 'San Fernando', country: '1700' },
            { _id: '17290', is_active: true, name: 'San Gregorio', country: '1700' },
            { _id: '17291', is_active: true, name: 'San Ignacio', country: '1700' },
            { _id: '17292', is_active: true, name: 'San Javier', country: '1700' },
            { _id: '17293', is_active: true, name: 'San Joaquín', country: '1700' },
            { _id: '17294', is_active: true, name: 'San José de Maipo', country: '1700' },
            { _id: '17295', is_active: true, name: 'San Juan de la Costa', country: '1700' },
            { _id: '17296', is_active: true, name: 'San Miguel', country: '1700' },
            { _id: '17297', is_active: true, name: 'San Nicolás', country: '1700' },
            { _id: '17298', is_active: true, name: 'San Pablo', country: '1700' },
            { _id: '17299', is_active: true, name: 'San Pedro', country: '1700' },
            { _id: '17300', is_active: true, name: 'San Pedro de Atacama', country: '1700' },
            { _id: '17301', is_active: true, name: 'San Pedro de la Paz', country: '1700' },
            { _id: '17302', is_active: true, name: 'San Rafael', country: '1700' },
            { _id: '17303', is_active: true, name: 'San Ramón', country: '1700' },
            { _id: '17304', is_active: true, name: 'San Rosendo', country: '1700' },
            { _id: '17305', is_active: true, name: 'San Vicente', country: '1700' },
            { _id: '17306', is_active: true, name: 'Santa Bárbara', country: '1700' },
            { _id: '17307', is_active: true, name: 'Santa Cruz', country: '1700' },
            { _id: '17308', is_active: true, name: 'Santa Juana', country: '1700' },
            { _id: '17309', is_active: true, name: 'Santa María', country: '1700' },
            { _id: '17310', is_active: true, name: 'Santiago', country: '1700' },
            { _id: '17311', is_active: true, name: 'Santo Domingo', country: '1700' },
            { _id: '17312', is_active: true, name: 'Sierra Gorda', country: '1700' },
            { _id: '17313', is_active: true, name: 'Talagante', country: '1700' },
            { _id: '17314', is_active: true, name: 'Talca', country: '1700' },
            { _id: '17315', is_active: true, name: 'Talcahuano', country: '1700' },
            { _id: '17316', is_active: true, name: 'Taltal', country: '1700' },
            { _id: '17317', is_active: true, name: 'Temuco', country: '1700' },
            { _id: '17318', is_active: true, name: 'Teno', country: '1700' },
            { _id: '17319', is_active: true, name: 'Teodoro Schmidt', country: '1700' },
            { _id: '17320', is_active: true, name: 'Tierra Amarilla', country: '1700' },
            { _id: '17321', is_active: true, name: 'Tiltil', country: '1700' },
            { _id: '17322', is_active: true, name: 'Timaukel', country: '1700' },
            { _id: '17323', is_active: true, name: 'Tirúa', country: '1700' },
            { _id: '17324', is_active: true, name: 'Tocopilla', country: '1700' },
            { _id: '17325', is_active: true, name: 'Toltén', country: '1700' },
            { _id: '17326', is_active: true, name: 'Tomé', country: '1700' },
            { _id: '17327', is_active: true, name: 'Torres del Paine', country: '1700' },
            { _id: '17328', is_active: true, name: 'Tortel', country: '1700' },
            { _id: '17329', is_active: true, name: 'Traiguén', country: '1700' },
            { _id: '17330', is_active: true, name: 'Treguaco', country: '1700' },
            { _id: '17331', is_active: true, name: 'Tucapel', country: '1700' },
            { _id: '17332', is_active: true, name: 'Valdivia', country: '1700' },
            { _id: '17333', is_active: true, name: 'Vallenar', country: '1700' },
            { _id: '17334', is_active: true, name: 'Valparaíso', country: '1700' },
            { _id: '17335', is_active: true, name: 'Vichuquén', country: '1700' },
            { _id: '17336', is_active: true, name: 'Victoria', country: '1700' },
            { _id: '17337', is_active: true, name: 'Vicuña', country: '1700' },
            { _id: '17338', is_active: true, name: 'Vilcún', country: '1700' },
            { _id: '17339', is_active: true, name: 'Villa Alegre', country: '1700' },
            { _id: '17340', is_active: true, name: 'Villa Alemana', country: '1700' },
            { _id: '17341', is_active: true, name: 'Villarrica', country: '1700' },
            { _id: '17342', is_active: true, name: 'Viña del Mar', country: '1700' },
            { _id: '17343', is_active: true, name: 'Vitacura', country: '1700' },
            { _id: '17344', is_active: true, name: 'Yerbas Buenas', country: '1700' },
            { _id: '17345', is_active: true, name: 'Yumbel', country: '1700' },
            { _id: '17346', is_active: true, name: 'Yungay', country: '1700' },
            { _id: '17347', is_active: true, name: 'Zapallar', country: '1700' },
            { _id: '401', is_active: true, name: 'Azul', country: '400' },
            { _id: '402', is_active: true, name: 'Bahía Blanca', country: '400' },
            { _id: '403', is_active: true, name: 'Banda del Río Salí', country: '400' },
            { _id: '404', is_active: true, name: 'Banfield', country: '400' },
            { _id: '405', is_active: true, name: 'Barranqueras', country: '400' },
            { _id: '406', is_active: true, name: 'Béccar', country: '400' },
            { _id: '407', is_active: true, name: 'Belén de Escobar', country: '400' },
            { _id: '408', is_active: true, name: 'Bella Vista', country: '400' },
            { _id: '409', is_active: true, name: 'Berazategui', country: '400' },
            { _id: '410', is_active: true, name: 'Berisso', country: '400' },
            { _id: '411', is_active: true, name: 'Bernal', country: '400' },
            { _id: '412', is_active: true, name: 'Bosques', country: '400' },
            { _id: '413', is_active: true, name: 'Boulogne Sur Mer', country: '400' },
            { _id: '414', is_active: true, name: 'Buenos Aires', country: '400' },
            { _id: '415', is_active: true, name: 'Burzaco', country: '400' },
            { _id: '416', is_active: true, name: 'Campana', country: '400' },
            { _id: '417', is_active: true, name: 'Caseros', country: '400' },
            { _id: '418', is_active: true, name: 'Castelar', country: '400' },
            { _id: '419', is_active: true, name: 'Chimbas', country: '400' },
            { _id: '420', is_active: true, name: 'Chivilcoy', country: '400' },
            { _id: '421', is_active: true, name: 'Cipolletti', country: '400' },
            { _id: '422', is_active: true, name: 'Ciudad de Corrientes', country: '400' },
            { _id: '423', is_active: true, name: 'Ciudad de Formosa', country: '400' },
            { _id: '424', is_active: true, name: 'Ciudad de La Rioja', country: '400' },
            { _id: '425', is_active: true, name: 'Ciudad de Mendoza', country: '400' },
            { _id: '426', is_active: true, name: 'Ciudad de Neuquén', country: '400' },
            { _id: '427', is_active: true, name: 'Ciudad de Río Cuarto', country: '400' },
            { _id: '428', is_active: true, name: 'Ciudad de Salta', country: '400' },
            { _id: '429', is_active: true, name: 'Ciudad de San Juan', country: '400' },
            { _id: '430', is_active: true, name: 'Ciudad de San Luis', country: '400' },
            { _id: '431', is_active: true, name: 'Ciudad de Santa Fe', country: '400' },
            { _id: '432', is_active: true, name: 'Ciudad de Santiago del Estero', country: '400' },
            { _id: '433', is_active: true, name: 'Ciudad Evita', country: '400' },
            { _id: '434', is_active: true, name: 'Ciudad Jardín El Libertador', country: '400' },
            { _id: '435', is_active: true, name: 'Ciudadela', country: '400' },
            { _id: '436', is_active: true, name: 'Clorinda', country: '400' },
            { _id: '437', is_active: true, name: 'Comodoro Rivadavia', country: '400' },
            { _id: '438', is_active: true, name: 'Concepción', country: '400' },
            { _id: '439', is_active: true, name: 'Concepción del Uruguay', country: '400' },
            { _id: '440', is_active: true, name: 'Concordia', country: '400' },
            { _id: '441', is_active: true, name: 'Córdoba', country: '400' },
            { _id: '442', is_active: true, name: 'Don Torcuato', country: '400' },
            { _id: '443', is_active: true, name: 'El Jagüel', country: '400' },
            { _id: '444', is_active: true, name: 'El Palomar', country: '400' },
            { _id: '445', is_active: true, name: 'Eldorado', country: '400' },
            { _id: '446', is_active: true, name: 'Esperanza', country: '400' },
            { _id: '447', is_active: true, name: 'Ezeiza', country: '400' },
            { _id: '448', is_active: true, name: 'Ezpeleta', country: '400' },
            { _id: '449', is_active: true, name: 'Florencio Varela', country: '400' },
            { _id: '450', is_active: true, name: 'Florida (no es ciudad sino barrio)', country: '400' },
            { _id: '451', is_active: true, name: 'General Pico', country: '400' },
            { _id: '452', is_active: true, name: 'General Roca', country: '400' },
            { _id: '453', is_active: true, name: 'General Rodríguez', country: '400' },
            { _id: '454', is_active: true, name: 'Glew', country: '400' },
            { _id: '455', is_active: true, name: 'Gobernador Julio A Costa', country: '400' },
            { _id: '456', is_active: true, name: 'Godoy Cruz', country: '400' },
            { _id: '457', is_active: true, name: 'González Catán', country: '400' },
            { _id: '458', is_active: true, name: 'Goya', country: '400' },
            { _id: '459', is_active: true, name: 'Grand Bourg', country: '400' },
            { _id: '460', is_active: true, name: 'Gregorio de Laferrere', country: '400' },
            { _id: '461', is_active: true, name: 'Gualeguaychú', country: '400' },
            { _id: '462', is_active: true, name: 'Guaymallén', country: '400' },
            { _id: '463', is_active: true, name: 'Isidro Casanova', country: '400' },
            { _id: '464', is_active: true, name: 'Ituzaingó', country: '400' },
            { _id: '465', is_active: true, name: 'José C. Paz', country: '400' },
            { _id: '466', is_active: true, name: 'Junín', country: '400' },
            { _id: '467', is_active: true, name: 'La Banda', country: '400' },
            { _id: '468', is_active: true, name: 'La Plata', country: '400' },
            { _id: '469', is_active: true, name: 'La Tablada', country: '400' },
            { _id: '470', is_active: true, name: 'Lanús', country: '400' },
            { _id: '471', is_active: true, name: 'Las Heras', country: '400' },
            { _id: '472', is_active: true, name: 'Libertad', country: '400' },
            { _id: '473', is_active: true, name: 'Lomas de Zamora', country: '400' },
            { _id: '474', is_active: true, name: 'Lomas del Mirador', country: '400' },
            { _id: '475', is_active: true, name: 'Longchamps', country: '400' },
            { _id: '476', is_active: true, name: 'Los Polvorines', country: '400' },
            { _id: '477', is_active: true, name: 'Luján', country: '400' },
            { _id: '478', is_active: true, name: 'Luján de Cuyo', country: '400' },
            { _id: '479', is_active: true, name: 'Maipú', country: '400' },
            { _id: '480', is_active: true, name: 'Mar del Plata', country: '400' },
            { _id: '481', is_active: true, name: 'Mariano Acosta', country: '400' },
            { _id: '482', is_active: true, name: 'Martínez', country: '400' },
            { _id: '483', is_active: true, name: 'Mercedes', country: '400' },
            { _id: '484', is_active: true, name: 'Merlo', country: '400' },
            { _id: '485', is_active: true, name: 'Monte Chingolo', country: '400' },
            { _id: '486', is_active: true, name: 'Monte Grande', country: '400' },
            { _id: '487', is_active: true, name: 'Moreno', country: '400' },
            { _id: '488', is_active: true, name: 'Morón', country: '400' },
            { _id: '489', is_active: true, name: 'Necochea', country: '400' },
            { _id: '490', is_active: true, name: 'Oberá', country: '400' },
            { _id: '491', is_active: true, name: 'Olavarría', country: '400' },
            { _id: '492', is_active: true, name: 'Olivos (no es ciudad sino barrio)', country: '400' },
            { _id: '493', is_active: true, name: 'Palpalá', country: '400' },
            { _id: '494', is_active: true, name: 'Paraná', country: '400' },
            { _id: '495', is_active: true, name: 'Pergamino', country: '400' },
            { _id: '496', is_active: true, name: 'Pilar', country: '400' },
            { _id: '497', is_active: true, name: 'Posadas', country: '400' },
            { _id: '498', is_active: true, name: 'Presidencia Roque Sáenz Peña', country: '400' },
            { _id: '499', is_active: true, name: 'Presidente Perón', country: '400' },
            { _id: '4100', is_active: true, name: 'Puerto Madryn', country: '400' },
            { _id: '4101', is_active: true, name: 'Punta Alta', country: '400' },
            { _id: '4102', is_active: true, name: 'Quilmes', country: '400' },
            { _id: '4103', is_active: true, name: 'Rafael Calzada', country: '400' },
            { _id: '4104', is_active: true, name: 'Rafael Castillo', country: '400' },
            { _id: '4105', is_active: true, name: 'Rafaela', country: '400' },
            { _id: '4106', is_active: true, name: 'Ramos Mejía', country: '400' },
            { _id: '4107', is_active: true, name: 'Rawson', country: '400' },
            { _id: '4108', is_active: true, name: 'Reconquista', country: '400' },
            { _id: '4109', is_active: true, name: 'Remedios de Escalada (Partido de Lanús)', country: '400' },
            { _id: '4110', is_active: true, name: 'Resistencia', country: '400' },
            { _id: '4111', is_active: true, name: 'Río Gallegos', country: '400' },
            { _id: '4112', is_active: true, name: 'Río Grande', country: '400' },
            { _id: '4113', is_active: true, name: 'Rivadavia', country: '400' },
            { _id: '4114', is_active: true, name: 'Rosario', country: '400' },
            { _id: '4115', is_active: true, name: 'San Carlos de Bariloche', country: '400' },
            { _id: '4116', is_active: true, name: 'San Fernando', country: '400' },
            { _id: '4117', is_active: true, name: 'San Fernando del Valle de Catamarca', country: '400' },
            { _id: '4118', is_active: true, name: 'San Francisco', country: '400' },
            { _id: '4119', is_active: true, name: 'San Francisco Solano', country: '400' },
            { _id: '4120', is_active: true, name: 'San Isidro', country: '400' },
            { _id: '4121', is_active: true, name: 'San Justo', country: '400' },
            { _id: '4122', is_active: true, name: 'San Martín', country: '400' },
            { _id: '4123', is_active: true, name: 'San Miguel', country: '400' },
            { _id: '4124', is_active: true, name: 'San Miguel de Tucumán', country: '400' },
            { _id: '4125', is_active: true, name: 'San Nicolás de los Arroyos', country: '400' },
            { _id: '4126', is_active: true, name: 'San Pedro de Jujuy', country: '400' },
            { _id: '4127', is_active: true, name: 'San Rafael', country: '400' },
            { _id: '4128', is_active: true, name: 'San Ramón de la Nueva Orán', country: '400' },
            { _id: '4129', is_active: true, name: 'San Salvador de Jujuy', country: '400' },
            { _id: '4130', is_active: true, name: 'Santa Rosa', country: '400' },
            { _id: '4131', is_active: true, name: 'Sarandí', country: '400' },
            { _id: '4132', is_active: true, name: 'Tandil', country: '400' },
            { _id: '4133', is_active: true, name: 'Tartagal', country: '400' },
            { _id: '4134', is_active: true, name: 'Temperley', country: '400' },
            { _id: '4135', is_active: true, name: 'Trelew', country: '400' },
            { _id: '4136', is_active: true, name: 'Tres Arroyos', country: '400' },
            { _id: '4137', is_active: true, name: 'Trujui', country: '400' },
            { _id: '4138', is_active: true, name: 'Ushuaia', country: '400' },
            { _id: '4139', is_active: true, name: 'Venado Tuerto', country: '400' },
            { _id: '4140', is_active: true, name: 'Vicente López', country: '400' },
            { _id: '4141', is_active: true, name: 'Viedma', country: '400' },
            { _id: '4142', is_active: true, name: 'Villa Carlos Paz', country: '400' },
            { _id: '4143', is_active: true, name: 'Villa Centenario', country: '400' },
            { _id: '4144', is_active: true, name: 'Villa Dolores', country: '400' },
            { _id: '4145', is_active: true, name: 'Villa Domínico', country: '400' },
            { _id: '4146', is_active: true, name: 'Villa Gobernador Gálvez', country: '400' },
            { _id: '4147', is_active: true, name: 'Villa Luzuriaga', country: '400' },
            { _id: '4148', is_active: true, name: 'Villa Madero', country: '400' },
            { _id: '4149', is_active: true, name: 'Villa María', country: '400' },
            { _id: '4150', is_active: true, name: 'Villa Mariano Moreno-El Colmenar', country: '400' },
            { _id: '4151', is_active: true, name: 'Villa Mercedes', country: '400' },
            { _id: '4152', is_active: true, name: 'Villa Tesei', country: '400' },
            { _id: '4153', is_active: true, name: 'Virrey del Pino', country: '400' },
            { _id: '4154', is_active: true, name: 'Wilde', country: '400' },
            { _id: '4155', is_active: true, name: 'William Morris', country: '400' },
            { _id: '4156', is_active: true, name: 'Yerba Buena/Marcos Paz', country: '400' },
            { _id: '4157', is_active: true, name: 'Zárate', country: '400' },
            { _id: '6001', is_active: true, name: 'Abancay', country: '6000' },
            { _id: '6002', is_active: true, name: 'Andahuaylas', country: '6000' },
            { _id: '6003', is_active: true, name: 'Arequipa', country: '6000' },
            { _id: '6004', is_active: true, name: 'Ayacucho', country: '6000' },
            { _id: '6005', is_active: true, name: 'Bagua', country: '6000' },
            { _id: '6006', is_active: true, name: 'Bagua Grande', country: '6000' },
            { _id: '6007', is_active: true, name: 'Barranca', country: '6000' },
            { _id: '6008', is_active: true, name: 'Cajamarca', country: '6000' },
            { _id: '6009', is_active: true, name: 'Cañete', country: '6000' },
            { _id: '6010', is_active: true, name: 'Casa Grande', country: '6000' },
            { _id: '6011', is_active: true, name: 'Casma', country: '6000' },
            { _id: '6012', is_active: true, name: 'Cerro de Pasco', country: '6000' },
            { _id: '6013', is_active: true, name: 'Chachapoyas', country: '6000' },
            { _id: '6014', is_active: true, name: 'Chancay', country: '6000' },
            { _id: '6015', is_active: true, name: 'Chanchamayo', country: '6000' },
            { _id: '6016', is_active: true, name: 'Chepén', country: '6000' },
            { _id: '6017', is_active: true, name: 'Chiclayo', country: '6000' },
            { _id: '6018', is_active: true, name: 'Chimbote', country: '6000' },
            { _id: '6019', is_active: true, name: 'Chincha Alta', country: '6000' },
            { _id: '6020', is_active: true, name: 'Chulucanas', country: '6000' },
            { _id: '6021', is_active: true, name: 'Cusco', country: '6000' },
            { _id: '6022', is_active: true, name: 'Espinar', country: '6000' },
            { _id: '6023', is_active: true, name: 'Ferreñafe', country: '6000' },
            { _id: '6024', is_active: true, name: 'Guadalupe', country: '6000' },
            { _id: '6025', is_active: true, name: 'Huacho', country: '6000' },
            { _id: '6026', is_active: true, name: 'Huamachuco', country: '6000' },
            { _id: '6027', is_active: true, name: 'Huancavelica', country: '6000' },
            { _id: '6028', is_active: true, name: 'Huancayo', country: '6000' },
            { _id: '6029', is_active: true, name: 'Huanta', country: '6000' },
            { _id: '6030', is_active: true, name: 'Huánuco', country: '6000' },
            { _id: '6031', is_active: true, name: 'Huaral', country: '6000' },
            { _id: '6032', is_active: true, name: 'Huaraz', country: '6000' },
            { _id: '6033', is_active: true, name: 'Huaura', country: '6000' },
            { _id: '6034', is_active: true, name: 'Ica', country: '6000' },
            { _id: '6035', is_active: true, name: 'Ilave', country: '6000' },
            { _id: '6036', is_active: true, name: 'Ilo', country: '6000' },
            { _id: '6037', is_active: true, name: 'imperial', country: '6000' },
            { _id: '6038', is_active: true, name: 'Iquitos', country: '6000' },
            { _id: '6039', is_active: true, name: 'Jaén', country: '6000' },
            { _id: '6040', is_active: true, name: 'Juanjuí', country: '6000' },
            { _id: '6041', is_active: true, name: 'Juliaca', country: '6000' },
            { _id: '6042', is_active: true, name: 'La Arena', country: '6000' },
            { _id: '6043', is_active: true, name: 'La Unión', country: '6000' },
            { _id: '6044', is_active: true, name: 'Lambayeque', country: '6000' },
            { _id: '6045', is_active: true, name: 'Lima', country: '6000' },
            { _id: '6046', is_active: true, name: 'Majes', country: '6000' },
            { _id: '6047', is_active: true, name: 'Mala', country: '6000' },
            { _id: '6048', is_active: true, name: 'Marcavelica', country: '6000' },
            { _id: '6049', is_active: true, name: 'Mollendo', country: '6000' },
            { _id: '6050', is_active: true, name: 'Monsefú', country: '6000' },
            { _id: '6051', is_active: true, name: 'Moquegua', country: '6000' },
            { _id: '6052', is_active: true, name: 'Moyobamba', country: '6000' },
            { _id: '6053', is_active: true, name: 'Nazca', country: '6000' },
            { _id: '6054', is_active: true, name: 'Nueva Cajamarca', country: '6000' },
            { _id: '6055', is_active: true, name: 'Pacasmayo', country: '6000' },
            { _id: '6056', is_active: true, name: 'Paita', country: '6000' },
            { _id: '6057', is_active: true, name: 'Perené', country: '6000' },
            { _id: '6058', is_active: true, name: 'Pichanaqui', country: '6000' },
            { _id: '6059', is_active: true, name: 'Pisco', country: '6000' },
            { _id: '6060', is_active: true, name: 'Piura', country: '6000' },
            { _id: '6061', is_active: true, name: 'Pucallpa', country: '6000' },
            { _id: '6062', is_active: true, name: 'Puerto Maldonado', country: '6000' },
            { _id: '6063', is_active: true, name: 'Puno', country: '6000' },
            { _id: '6064', is_active: true, name: 'Querecotillo', country: '6000' },
            { _id: '6065', is_active: true, name: 'Quillabamba', country: '6000' },
            { _id: '6066', is_active: true, name: 'Requena', country: '6000' },
            { _id: '6067', is_active: true, name: 'Satipo', country: '6000' },
            { _id: '6068', is_active: true, name: 'Sechura', country: '6000' },
            { _id: '6069', is_active: true, name: 'Sicuani', country: '6000' },
            { _id: '6070', is_active: true, name: 'Sullana', country: '6000' },
            { _id: '6071', is_active: true, name: 'Tacna', country: '6000' },
            { _id: '6072', is_active: true, name: 'Talara', country: '6000' },
            { _id: '6073', is_active: true, name: 'Tarapoto', country: '6000' },
            { _id: '6074', is_active: true, name: 'Tarma', country: '6000' },
            { _id: '6075', is_active: true, name: 'Tingo María', country: '6000' },
            { _id: '6076', is_active: true, name: 'Trujillo', country: '6000' },
            { _id: '6077', is_active: true, name: 'Tumán', country: '6000' },
            { _id: '6078', is_active: true, name: 'Tumbes', country: '6000' },
            { _id: '6079', is_active: true, name: 'Virú', country: '6000' },
            { _id: '6080', is_active: true, name: 'Yurimaguas', country: '6000' },
        ];
        cities.forEach((city) => city_collection_1.Cities.insert(city));
    }
}
exports.loadCities = loadCities;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cooking-time.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/cooking-time.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cooking_time_collection_1 = require("../../../../both/collections/general/cooking-time.collection");
function loadCookingTimes() {
    if (cooking_time_collection_1.CookingTimes.find().cursor.count() === 0) {
        const cooking_times = [
            { _id: "10", cooking_time: "5 min aprox" },
            { _id: "20", cooking_time: "15 min aprox" },
            { _id: "30", cooking_time: "30 min aprox" },
            { _id: "40", cooking_time: "45 min aprox" },
            { _id: "50", cooking_time: "1 h aprox" },
            { _id: "60", cooking_time: "1 h 15 min aprox" },
            { _id: "70", cooking_time: "1 h 30 min aprox" },
            { _id: "80", cooking_time: "1 h 45 min aprox" },
            { _id: "90", cooking_time: "2 h aprox" },
            { _id: "100", cooking_time: "+ 2 h aprox" }
        ];
        cooking_times.forEach((cooking) => cooking_time_collection_1.CookingTimes.insert(cooking));
    }
}
exports.loadCookingTimes = loadCookingTimes;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"countries.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/countries.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const country_collection_1 = require("../../../../both/collections/general/country.collection");
function loadCountries() {
    if (country_collection_1.Countries.find().cursor.count() === 0) {
        const countries = [
            { _id: '100', is_active: false, name: 'COUNTRIES.ALBANIA', alfaCode2: 'AL', alfaCode3: 'ALB', numericCode: '008', indicative: '(+ 355)', currencyId: '270', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '200', is_active: false, name: 'COUNTRIES.GERMANY', alfaCode2: 'DE', alfaCode3: 'DEU', numericCode: '276', indicative: '(+ 49)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '300', is_active: false, name: 'COUNTRIES.ANDORRA', alfaCode2: 'AD', alfaCode3: 'AND', numericCode: '020', indicative: '(+ 376)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '400', is_active: false, name: 'COUNTRIES.ARGENTINA', alfaCode2: 'AR', alfaCode3: 'ARG', numericCode: '032', indicative: '(+ 54)', currencyId: '370', itemsWithDifferentTax: false, queue: ["4", "5"], establishment_price: 117, tablePrice: 3, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '' },
            { _id: '500', is_active: false, name: 'COUNTRIES.ARMENIA', alfaCode2: 'AM', alfaCode3: 'ARM', numericCode: '051', indicative: '(+ 374)', currencyId: '190', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '600', is_active: false, name: 'COUNTRIES.AUSTRIA', alfaCode2: 'AT', alfaCode3: 'AUT', numericCode: '040', indicative: '(+ 43)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '700', is_active: false, name: 'COUNTRIES.AZERBAIJAN', alfaCode2: 'AZ', alfaCode3: 'AZE', numericCode: '031', indicative: '(+ 994)', currencyId: '350', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '800', is_active: false, name: 'COUNTRIES.BELGIUM', alfaCode2: 'BE', alfaCode3: 'BEL', numericCode: '056', indicative: '(+ 32)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '900', is_active: false, name: 'COUNTRIES.BELIZE', alfaCode2: 'BZ', alfaCode3: 'BLZ', numericCode: '084', indicative: '(+ 501)', currencyId: '130', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1000', is_active: false, name: 'COUNTRIES.BERMUDAS', alfaCode2: 'BM', alfaCode3: 'BMU', numericCode: '060', indicative: '(+ 1004)', currencyId: '140', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1100', is_active: false, name: 'COUNTRIES.BELARUS', alfaCode2: 'BY', alfaCode3: 'BLR', numericCode: '112', indicative: '(+ 375)', currencyId: '440', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1200', is_active: false, name: 'COUNTRIES.BOLIVIA', alfaCode2: 'BO', alfaCode3: 'BOL', numericCode: '068', indicative: '(+ 591)', currencyId: '30', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1300', is_active: false, name: 'COUNTRIES.BOSNIA_HERZEGOVINA', alfaCode2: 'BA', alfaCode3: 'BIH', numericCode: '070', indicative: '(+ 387)', currencyId: '360', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1400', is_active: false, name: 'COUNTRIES.BRAZIL', alfaCode2: 'BR', alfaCode3: 'BRA', numericCode: '076', indicative: '(+ 55)', currencyId: '430', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1500', is_active: false, name: 'COUNTRIES.BULGARIA', alfaCode2: 'BG', alfaCode3: 'BGR', numericCode: '100', indicative: '(+ 359)', currencyId: '310', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1600', is_active: false, name: 'COUNTRIES.CANADA', alfaCode2: 'CA', alfaCode3: 'CAN', numericCode: '124', indicative: '(+ 001)', currencyId: '150', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1700', is_active: false, name: 'COUNTRIES.CHILE', alfaCode2: 'CL', alfaCode3: 'CHL', numericCode: '152', indicative: '(+ 56)', currencyId: '380', itemsWithDifferentTax: false, queue: ["2", "3"], establishment_price: 4300, tablePrice: 106, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '' },
            { _id: '1800', is_active: false, name: 'COUNTRIES.CYPRUS', alfaCode2: 'CY', alfaCode3: 'CYP', numericCode: '196', indicative: '(+357)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1900', is_active: true, name: 'COUNTRIES.COLOMBIA', alfaCode2: 'CO', alfaCode3: 'COL', numericCode: '170', indicative: '(+ 57)', currencyId: '390', itemsWithDifferentTax: false, queue: ["0", "1"], establishment_price: 22000, tablePrice: 200, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '15 0 * * *' },
            { _id: '2000', is_active: false, name: 'COUNTRIES.COSTA_RICA', alfaCode2: 'CR', alfaCode3: 'CRI', numericCode: '188', indicative: '(+ 506)', currencyId: '40', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2100', is_active: false, name: 'COUNTRIES.CROATIA', alfaCode2: 'HR', alfaCode3: 'HRV', numericCode: '191', indicative: '(+ 385)', currencyId: '250', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2200', is_active: false, name: 'COUNTRIES.DENMARK', alfaCode2: 'DK', alfaCode3: 'DNK', numericCode: '208', indicative: '(+ 45)', currencyId: '70', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2300', is_active: false, name: 'COUNTRIES.ECUADOR', alfaCode2: 'EC', alfaCode3: 'ECU', numericCode: '218', indicative: '(+ 593)', currencyId: '160', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2400', is_active: false, name: 'COUNTRIES.EL_SALVADOR', alfaCode2: 'SV', alfaCode3: 'SLV', numericCode: '222', indicative: '(+ 503)', currencyId: '160', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2500', is_active: false, name: 'COUNTRIES.SLOVAKIA', alfaCode2: 'SK', alfaCode3: 'SVK', numericCode: '703', indicative: '(+ 421)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2600', is_active: false, name: 'COUNTRIES.SLOVENIA', alfaCode2: 'SI', alfaCode3: 'SVN', numericCode: '705', indicative: '(+ 386)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2700', is_active: false, name: 'COUNTRIES.SPAIN', alfaCode2: 'ES', alfaCode3: 'ESP', numericCode: '724', indicative: '(+ 34)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2800', is_active: false, name: 'COUNTRIES.UNITED_STATES', alfaCode2: 'US', alfaCode3: 'USA', numericCode: '840', indicative: '(+ 1)', currencyId: '160', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2900', is_active: false, name: 'COUNTRIES.ESTONIA', alfaCode2: 'EE', alfaCode3: 'EST', numericCode: '233', indicative: '(+ 372)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3000', is_active: false, name: 'COUNTRIES.FINLAND', alfaCode2: 'FI', alfaCode3: 'FIN', numericCode: '246', indicative: '(+ 358)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3100', is_active: false, name: 'COUNTRIES.FRANCE', alfaCode2: 'FR', alfaCode3: 'FRA', numericCode: '250', indicative: '(+ 33)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3200', is_active: false, name: 'COUNTRIES.GEORGIA', alfaCode2: 'GE', alfaCode3: 'GEO', numericCode: '268', indicative: '(+ 995)', currencyId: '260', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3300', is_active: false, name: 'COUNTRIES.GREECE', alfaCode2: 'GR', alfaCode3: 'GRC', numericCode: '300', indicative: '(+ 30)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3400', is_active: false, name: 'COUNTRIES.GREENLAND', alfaCode2: 'GL', alfaCode3: 'GRL', numericCode: '304', indicative: '(+ 299)', currencyId: '70', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3500', is_active: false, name: 'COUNTRIES.GUATEMALA', alfaCode2: 'GT', alfaCode3: 'GTM', numericCode: '320', indicative: '(+ 502)', currencyId: '420', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3600', is_active: false, name: 'COUNTRIES.FRENCH_GUIANA', alfaCode2: 'GF', alfaCode3: 'GUF', numericCode: '254', indicative: '(+ 594)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3700', is_active: false, name: 'COUNTRIES.GUYANA', alfaCode2: 'GY', alfaCode3: 'GUY', numericCode: '328', indicative: '(+ 592)', currencyId: '170', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3800', is_active: false, name: 'COUNTRIES.HONDURAS', alfaCode2: 'HN', alfaCode3: 'HND', numericCode: '340', indicative: '(+ 504)', currencyId: '280', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3900', is_active: false, name: 'COUNTRIES.HUNGARY', alfaCode2: 'HU', alfaCode3: 'HUN', numericCode: '348', indicative: '(+ 36)', currencyId: '210', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4000', is_active: false, name: 'COUNTRIES.IRELAND', alfaCode2: 'IE', alfaCode3: 'IRL', numericCode: '372', indicative: '(+ 353)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4100', is_active: false, name: 'COUNTRIES.ICELAND', alfaCode2: 'IS', alfaCode3: 'ISL', numericCode: '352', indicative: '(+ 354)', currencyId: '80', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4200', is_active: false, name: 'COUNTRIES.FALKLAND_ISLANDS', alfaCode2: 'FK', alfaCode3: 'FLK', numericCode: '238', indicative: '(+ 500)', currencyId: '330', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4300', is_active: false, name: 'COUNTRIES.ITALY', alfaCode2: 'IT', alfaCode3: 'ITA', numericCode: '380', indicative: '(+ 39)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4400', is_active: false, name: 'COUNTRIES.KAZAKHSTAN', alfaCode2: 'KZ', alfaCode3: 'KAZ', numericCode: '398', indicative: '(+ 731)', currencyId: '470', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4500', is_active: false, name: 'COUNTRIES.LATVIA', alfaCode2: 'LV', alfaCode3: 'LVA', numericCode: '428', indicative: '(+ 371)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4600', is_active: false, name: 'COUNTRIES.LIECHTENSTEIN', alfaCode2: 'LI', alfaCode3: 'LIE', numericCode: '438', indicative: '(+ 417)', currencyId: '220', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4700', is_active: false, name: 'COUNTRIES.LITHUANIA', alfaCode2: 'LT', alfaCode3: 'LTU', numericCode: '440', indicative: '(+ 370)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4800', is_active: false, name: 'COUNTRIES.LUXEMBOURG', alfaCode2: 'LU', alfaCode3: 'LUX', numericCode: '442', indicative: '(+ 352)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4900', is_active: false, name: 'COUNTRIES.MACEDONIA', alfaCode2: 'MK', alfaCode3: 'MKD', numericCode: '807', indicative: '(+ 389)', currencyId: '110', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5000', is_active: false, name: 'COUNTRIES.MALTA', alfaCode2: 'MT', alfaCode3: 'MLT', numericCode: '470', indicative: '(+ 356)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5100', is_active: false, name: 'COUNTRIES.MEXICO', alfaCode2: 'MX', alfaCode3: 'MEX', numericCode: '484', indicative: '(+ 52)', currencyId: '400', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5200', is_active: false, name: 'COUNTRIES.MOLDAVIA', alfaCode2: 'MD', alfaCode3: 'MDA', numericCode: '498', indicative: '(+ 373)', currencyId: '290', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5300', is_active: false, name: 'COUNTRIES.MONACO', alfaCode2: 'MC', alfaCode3: 'MCO', numericCode: '492', indicative: '(+ 377)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5400', is_active: false, name: 'COUNTRIES.MONTENEGRO', alfaCode2: 'ME', alfaCode3: 'MNE', numericCode: '499', indicative: '(+ 382)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5500', is_active: false, name: 'COUNTRIES.NICARAGUA', alfaCode2: 'NI', alfaCode3: 'NIC', numericCode: '558', indicative: '(+ 505)', currencyId: '50', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5600', is_active: false, name: 'COUNTRIES.NORWAY', alfaCode2: 'NO', alfaCode3: 'NOR', numericCode: '578', indicative: '(+ 47)', currencyId: '90', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5700', is_active: false, name: 'COUNTRIES.NETHERLANDS', alfaCode2: 'NL', alfaCode3: 'NLD', numericCode: '528', indicative: '(+ 31)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5800', is_active: false, name: 'COUNTRIES.PANAMA', alfaCode2: 'PA', alfaCode3: 'PAN', numericCode: '591', indicative: '(+ 507)', currencyId: '10', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5900', is_active: false, name: 'COUNTRIES.PARAGUAY', alfaCode2: 'PY', alfaCode3: 'PRY', numericCode: '600', indicative: '(+ 595)', currencyId: '240', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6000', is_active: false, name: 'COUNTRIES.PERU', alfaCode2: 'PE', alfaCode3: 'PER', numericCode: '604', indicative: '(+ 51)', currencyId: '460', itemsWithDifferentTax: false, queue: ["6", "7"], establishment_price: 22, tablePrice: 0.6, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '' },
            { _id: '6100', is_active: false, name: 'COUNTRIES.POLAND', alfaCode2: 'PL', alfaCode3: 'POL', numericCode: '616', indicative: '(+ 48)', currencyId: '480', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6200', is_active: false, name: 'COUNTRIES.PORTUGAL', alfaCode2: 'PT', alfaCode3: 'PRT', numericCode: '620', indicative: '(+ 351)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6300', is_active: false, name: 'COUNTRIES.UNITED_KINGDOM', alfaCode2: 'GB', alfaCode3: 'GBR', numericCode: '826', indicative: '(+ 44)', currencyId: '320', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6400', is_active: false, name: 'COUNTRIES.CZECH_REPUBLIC', alfaCode2: 'CZ', alfaCode3: 'CZE', numericCode: '203', indicative: '(+ 42)', currencyId: '60', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6500', is_active: false, name: 'COUNTRIES.ROMANIA', alfaCode2: 'RO', alfaCode3: 'ROU', numericCode: '642', indicative: '(+ 40)', currencyId: '300', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6600', is_active: false, name: 'COUNTRIES.RUSSIA', alfaCode2: 'RU', alfaCode3: 'RUS', numericCode: '643', indicative: '(+ 7)', currencyId: '450', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6700', is_active: false, name: 'COUNTRIES.SAN_MARINO', alfaCode2: 'SM', alfaCode3: 'SMR', numericCode: '674', indicative: '(+ 378)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6800', is_active: false, name: 'COUNTRIES.SAINT_PIERRE_MIQUELON', alfaCode2: 'PM', alfaCode3: 'SPM', numericCode: '666', indicative: '(+ 508)', currencyId: '200', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6900', is_active: false, name: 'COUNTRIES.SERBIA', alfaCode2: 'RS', alfaCode3: 'SRB', numericCode: '688', indicative: '(+ 381)', currencyId: '120', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7000', is_active: false, name: 'COUNTRIES.SWEDEN', alfaCode2: 'SE', alfaCode3: 'SWE', numericCode: '752', indicative: '(+ 46)', currencyId: '100', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7100', is_active: false, name: 'COUNTRIES.SWITZERLAND', alfaCode2: 'CH', alfaCode3: 'CHE', numericCode: '756', indicative: '(+ 41)', currencyId: '220', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7200', is_active: false, name: 'COUNTRIES.SURINAM', alfaCode2: 'SR', alfaCode3: 'SUR', numericCode: '740', indicative: '(+ 597)', currencyId: '180', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7300', is_active: false, name: 'COUNTRIES.TURKEY', alfaCode2: 'TR', alfaCode3: 'TUR', numericCode: '792', indicative: '(+ 90)', currencyId: '340', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7400', is_active: false, name: 'COUNTRIES.UKRAINE', alfaCode2: 'UA', alfaCode3: 'UKR', numericCode: '804', indicative: '(+ 380)', currencyId: '230', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7500', is_active: false, name: 'COUNTRIES.URUGUAY', alfaCode2: 'UY', alfaCode3: 'URY', numericCode: '858', indicative: '(+ 598)', currencyId: '410', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7600', is_active: false, name: 'COUNTRIES.VENEZUELA', alfaCode2: 'VE', alfaCode3: 'VEN', numericCode: '862', indicative: '(+ 58)', currencyId: '20', itemsWithDifferentTax: false, queue: [], establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' }
        ];
        countries.forEach((country) => country_collection_1.Countries.insert(country));
    }
}
exports.loadCountries = loadCountries;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"currencies.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/currencies.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const currency_collection_1 = require("../../../../both/collections/general/currency.collection");
function loadCurrencies() {
    if (currency_collection_1.Currencies.find().cursor.count() === 0) {
        const currencies = [
            { _id: '10', isActive: true, name: 'CURRENCIES.BALBOA', code: 'PAB', numericCode: '590', decimal: 0.01 },
            { _id: '20', isActive: true, name: 'CURRENCIES.BOLIVAR', code: 'VEF', numericCode: '937', decimal: 0.01 },
            { _id: '30', isActive: true, name: 'CURRENCIES.BOLIVIANO', code: 'BOB', numericCode: '068', decimal: 0.01 },
            { _id: '40', isActive: true, name: 'CURRENCIES.COSTA_RICA_COLON', code: 'CRC', numericCode: '188', decimal: 0.01 },
            { _id: '50', isActive: true, name: 'CURRENCIES.CORDOBA', code: 'NIO', numericCode: '558', decimal: 0.01 },
            { _id: '60', isActive: true, name: 'CURRENCIES.CZECH_REPUBLIC_KORUNA', code: 'CZK', numericCode: '203', decimal: 0.01 },
            { _id: '70', isActive: true, name: 'CURRENCIES.DENMARK_KRONE', code: 'DKK', numericCode: '208', decimal: 0.01 },
            { _id: '80', isActive: true, name: 'CURRENCIES.ICELAND_KRONA', code: 'ISK', numericCode: '352', decimal: 0 },
            { _id: '90', isActive: true, name: 'CURRENCIES.NORWAY_KRONE', code: 'NOK', numericCode: '578', decimal: 0.01 },
            { _id: '100', isActive: true, name: 'CURRENCIES.SWEDEN_KRONA', code: 'SEK', numericCode: '752', decimal: 0.01 },
            { _id: '110', isActive: true, name: 'CURRENCIES.DENAR', code: 'MKD', numericCode: '807', decimal: 0.01 },
            { _id: '120', isActive: true, name: 'CURRENCIES.SERBIA_DINAR', code: 'RSD', numericCode: '941', decimal: 0.01 },
            { _id: '130', isActive: true, name: 'CURRENCIES.BELIZE_DOLLAR', code: 'BZD', numericCode: '084', decimal: 0.01 },
            { _id: '140', isActive: true, name: 'CURRENCIES.BERMUDIAN_DOLLAR', code: 'BMD', numericCode: '060', decimal: 0.01 },
            { _id: '150', isActive: true, name: 'CURRENCIES.CANADIAN_DOLLAR', code: 'CAD', numericCode: '124', decimal: 0.01 },
            { _id: '160', isActive: true, name: 'CURRENCIES.UNITED_STATES_DOLLAR', code: 'USD', numericCode: '840', decimal: 0.01 },
            { _id: '170', isActive: true, name: 'CURRENCIES.GUYANA_DOLLAR', code: 'GYD', numericCode: '328', decimal: 0.01 },
            { _id: '180', isActive: true, name: 'CURRENCIES.SURINAME_DOLLAR', code: 'SRD', numericCode: '968', decimal: 0.01 },
            { _id: '190', isActive: true, name: 'CURRENCIES.ARMENIAM_DRAM', code: 'AMD', numericCode: '051', decimal: 0.01 },
            { _id: '200', isActive: true, name: 'CURRENCIES.EURO', code: 'EUR', numericCode: '978', decimal: 0.01 },
            { _id: '210', isActive: true, name: 'CURRENCIES.HUNGARY_FORINT', code: 'HUF', numericCode: '348', decimal: 0.01 },
            { _id: '220', isActive: true, name: 'CURRENCIES.FRANC', code: 'CHF', numericCode: '756', decimal: 0.01 },
            { _id: '230', isActive: true, name: 'CURRENCIES.UKRAINE_HRYVNIA', code: 'UAH', numericCode: '980', decimal: 0.01 },
            { _id: '240', isActive: true, name: 'CURRENCIES.GUARANI', code: 'PYG', numericCode: '600', decimal: 0 },
            { _id: '250', isActive: true, name: 'CURRENCIES.KUNA', code: 'HRK', numericCode: '191', decimal: 0.01 },
            { _id: '260', isActive: true, name: 'CURRENCIES.LARI', code: 'GEL', numericCode: '981', decimal: 0.01 },
            { _id: '270', isActive: true, name: 'CURRENCIES.LEK', code: 'ALL', numericCode: '008', decimal: 0.01 },
            { _id: '280', isActive: true, name: 'CURRENCIES.LEMPIRA', code: 'HNL', numericCode: '340', decimal: 0.01 },
            { _id: '290', isActive: true, name: 'CURRENCIES.MOLDOVA_LEU', code: 'MDL', numericCode: '498', decimal: 0.01 },
            { _id: '300', isActive: true, name: 'CURRENCIES.ROMANIAN_LEU', code: 'RON', numericCode: '946', decimal: 0.01 },
            { _id: '310', isActive: true, name: 'CURRENCIES.BULGARIA_LEV', code: 'BGN', numericCode: '975', decimal: 0.01 },
            { _id: '320', isActive: true, name: 'CURRENCIES.POUND_STERLING', code: 'GBP', numericCode: '826', decimal: 0.01 },
            { _id: '330', isActive: true, name: 'CURRENCIES.FALKLAND_ISLANDS_POUND', code: 'FKP', numericCode: '238', decimal: 0.01 },
            { _id: '340', isActive: true, name: 'CURRENCIES.TURKISH_LIRA', code: 'TRY', numericCode: '949', decimal: 0.01 },
            { _id: '350', isActive: true, name: 'CURRENCIES.AZERBAIJANI_MANAT', code: 'AZN', numericCode: '944', decimal: 0.01 },
            { _id: '360', isActive: true, name: 'CURRENCIES.CONVERTIBLE_MARK', code: 'BAM', numericCode: '977', decimal: 0.01 },
            { _id: '370', isActive: true, name: 'CURRENCIES.ARGENTINA_PESO', code: 'ARS', numericCode: '032', decimal: 0.01 },
            { _id: '380', isActive: true, name: 'CURRENCIES.CHILE_PESO', code: 'CLP', numericCode: '152', decimal: 0 },
            { _id: '390', isActive: true, name: 'CURRENCIES.COLOMBIA_PESO', code: 'COP', numericCode: '170', decimal: 0.01 },
            { _id: '400', isActive: true, name: 'CURRENCIES.MEXICO_PESO', code: 'MXN', numericCode: '484', decimal: 0.01 },
            { _id: '410', isActive: true, name: 'CURRENCIES.URUGUAY_PESO', code: 'UYU', numericCode: '858', decimal: 0.01 },
            { _id: '420', isActive: true, name: 'CURRENCIES.QUETZAL', code: 'GTQ', numericCode: '320', decimal: 0.01 },
            { _id: '430', isActive: true, name: 'CURRENCIES.BRAZILIAN_REAL', code: 'BRL', numericCode: '986', decimal: 0.01 },
            { _id: '440', isActive: true, name: 'CURRENCIES.BELARUSIAN_RUBLE', code: 'BYR', numericCode: '974', decimal: 0 },
            { _id: '450', isActive: true, name: 'CURRENCIES.RUSSIAN_RUBLE', code: 'RUB', numericCode: '643', decimal: 0.01 },
            { _id: '460', isActive: true, name: 'CURRENCIES.SOL', code: 'PEN', numericCode: '604', decimal: 0.01 },
            { _id: '470', isActive: true, name: 'CURRENCIES.TENGE', code: 'KZT', numericCode: '398', decimal: 0.01 },
            { _id: '480', isActive: true, name: 'CURRENCIES.ZLOTY', code: 'PLN', numericCode: '985', decimal: 0.01 }
        ];
        currencies.forEach((cur) => currency_collection_1.Currencies.insert(cur));
    }
}
exports.loadCurrencies = loadCurrencies;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email-contents.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/email-contents.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_content_collection_1 = require("../../../../both/collections/general/email-content.collection");
function loadEmailContents() {
    if (email_content_collection_1.EmailContents.find().cursor.count() === 0) {
        const emailContents = [
            {
                _id: '100',
                language: 'en',
                lang_dictionary: [
                    { label: 'chargeSoonEmailSubjectVar', traduction: 'Your monthly comeygana service will ends soon' },
                    { label: 'greetVar', traduction: 'Hello' },
                    { label: 'welcomeMsgVar', traduction: 'We got a request to reset you password, if it was you click the button above.' },
                    { label: 'btnTextVar', traduction: 'Reset' },
                    { label: 'beforeMsgVar', traduction: 'If you do not want to change the password, ignore this message.' },
                    { label: 'regardVar', traduction: 'Thanks, comeygana team.' },
                    { label: 'followMsgVar', traduction: 'Follow us on social networks' },
                    { label: 'reminderChargeSoonMsgVar', traduction: 'Remember that your monthly comeygana service for: ' },
                    { label: 'reminderChargeSoonMsgVar2', traduction: 'Ends on: ' },
                    { label: 'instructionchargeSoonMsgVar', traduction: 'If you want to continue using all the system features, entering with your email or username and select the menu Establishments > Administration > Edit establishment > # Tables' },
                    { label: 'reminderExpireSoonMsgVar', traduction: 'Remember that your monthly comeygana service for: ' },
                    { label: 'reminderExpireSoonMsgVar2', traduction: 'Expires on: ' },
                    { label: 'reminderExpireSoonMsgVar3', traduction: 'If you want to continue using all the system features, entering with your email or username and select the menu Payments > Monthly payment' },
                    { label: 'expireSoonEmailSubjectVar', traduction: 'Your comeygana service will expire soon' },
                    { label: 'reminderRestExpiredVar', traduction: 'Your monthly comeygana service for: ' },
                    { label: 'reminderRestExpiredVar2', traduction: 'Has expired' },
                    { label: 'reminderRestExpiredVar3', traduction: 'If you want to continue using all the system features, entering with your email or username and select the menu Payments > Reactivate ' },
                    { label: 'restExpiredEmailSubjectVar', traduction: 'Your comeygana service has expired' },
                    { label: 'resetPasswordSubjectVar', traduction: 'Reset your password on' }
                ]
            },
            {
                _id: '200',
                language: 'es',
                lang_dictionary: [
                    { label: 'chargeSoonEmailSubjectVar', traduction: 'Tu servicio mensual de comeygana terminará pronto' },
                    { label: 'greetVar', traduction: 'Hola' },
                    { label: 'welcomeMsgVar', traduction: 'Hemos recibido una petición para cambiar tu contraseña, si fuiste tu haz click en el botón abajo' },
                    { label: 'btnTextVar', traduction: 'Cambiar' },
                    { label: 'beforeMsgVar', traduction: 'Si no quieres cambiar la contraseña, ignora este mensaje.' },
                    { label: 'regardVar', traduction: 'Gracias, equipo comeygana' },
                    { label: 'followMsgVar', traduction: 'Siguenos en redes sociales' },
                    { label: 'reminderChargeSoonMsgVar', traduction: 'Recuerda que tu servicio mensual de comeygana para: ' },
                    { label: 'reminderChargeSoonMsgVar2', traduction: 'Finaliza el: ' },
                    { label: 'instructionchargeSoonMsgVar', traduction: 'Si deseas seguir usando todas las funcionalidades del sistema, ingresa con tu usuario o correo y selecciona el menú Establecimientos > Administración > Editar establecimiento > # Mesas' },
                    { label: 'reminderExpireSoonMsgVar', traduction: 'Recuerda que tu servicio mensual de comeygana para: ' },
                    { label: 'reminderExpireSoonMsgVar2', traduction: 'Expira el: ' },
                    { label: 'reminderExpireSoonMsgVar3', traduction: 'Si deseas seguir usando todas las funcionalidades del sistema, ingresa con tu usuario o correo y selecciona el menú Pagos > Pago mensual' },
                    { label: 'expireSoonEmailSubjectVar', traduction: 'Tu servicio comeygana expirará pronto' },
                    { label: 'reminderRestExpiredVar', traduction: 'Tu servicio mensual de comeygana para: ' },
                    { label: 'reminderRestExpiredVar2', traduction: 'ha expirado' },
                    { label: 'reminderRestExpiredVar3', traduction: 'Si deseas seguir usando todas las funcionalidades del sistema, ingresa con tu usuario o correo y selecciona la opción Pagos > Reactivar ' },
                    { label: 'restExpiredEmailSubjectVar', traduction: 'Tu servicio de comeygana ha expirado' },
                    { label: 'resetPasswordSubjectVar', traduction: 'Cambio de contraseña en' }
                ]
            }
        ];
        emailContents.forEach((emailContent) => email_content_collection_1.EmailContents.insert(emailContent));
    }
}
exports.loadEmailContents = loadEmailContents;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"hours.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/hours.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hours_collection_1 = require("../../../../both/collections/general/hours.collection");
function loadHours() {
    if (hours_collection_1.Hours.find().cursor.count() === 0) {
        const hours = [
            { hour: '00:00' },
            { hour: '00:30' },
            { hour: '01:00' },
            { hour: '01:30' },
            { hour: '02:00' },
            { hour: '02:30' },
            { hour: '03:00' },
            { hour: '03:30' },
            { hour: '04:00' },
            { hour: '04:30' },
            { hour: '05:00' },
            { hour: '05:30' },
            { hour: '06:00' },
            { hour: '06:30' },
            { hour: '07:00' },
            { hour: '07:30' },
            { hour: '08:00' },
            { hour: '08:30' },
            { hour: '09:00' },
            { hour: '09:30' },
            { hour: '10:00' },
            { hour: '10:30' },
            { hour: '11:00' },
            { hour: '11:30' },
            { hour: '12:00' },
            { hour: '12:30' },
            { hour: '13:00' },
            { hour: '13:30' },
            { hour: '14:00' },
            { hour: '14:30' },
            { hour: '15:00' },
            { hour: '15:30' },
            { hour: '16:00' },
            { hour: '16:30' },
            { hour: '17:00' },
            { hour: '17:30' },
            { hour: '18:00' },
            { hour: '18:30' },
            { hour: '19:00' },
            { hour: '19:30' },
            { hour: '20:00' },
            { hour: '20:30' },
            { hour: '21:00' },
            { hour: '21:30' },
            { hour: '22:00' },
            { hour: '22:30' },
            { hour: '23:00' },
            { hour: '23:30' }
        ];
        hours.forEach((hour) => hours_collection_1.Hours.insert(hour));
    }
}
exports.loadHours = loadHours;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"languages.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/languages.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const language_collection_1 = require("../../../../both/collections/general/language.collection");
function loadLanguages() {
    if (language_collection_1.Languages.find().cursor.count() === 0) {
        const languages = [{
                _id: "1000",
                is_active: true,
                language_code: 'es',
                name: 'Español',
                image: null
            }, {
                _id: "2000",
                is_active: true,
                language_code: 'en',
                name: 'English',
                image: null
            }, {
                _id: "3000",
                is_active: false,
                language_code: 'fr',
                name: 'Français',
                image: null
            }, {
                _id: "4000",
                is_active: false,
                language_code: 'pt',
                name: 'Portuguese',
                image: null
            }, {
                _id: "5000",
                is_active: false,
                language_code: 'it',
                name: 'Italiano',
                image: null
            } /*,{
                    _id: "6000",
                    is_active: true,
                    language_code: 'al',
                    name: 'Deutsch',
                    image: null
                }*/
        ];
        languages.forEach((language) => language_collection_1.Languages.insert(language));
    }
}
exports.loadLanguages = loadLanguages;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parameters.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/parameters.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parameter_collection_1 = require("../../../../both/collections/general/parameter.collection");
function loadParameters() {
    if (parameter_collection_1.Parameters.find().cursor.count() === 0) {
        const parameters = [
            { _id: '100', name: 'start_payment_day', value: '1', description: 'initial day of month to validate client payment' },
            { _id: '200', name: 'end_payment_day', value: '5', description: 'final day of month to validate client payment' },
            { _id: '300', name: 'from_email', value: 'comeygana <no-reply@comeygana.com>', description: 'default from account email to send messages' },
            { _id: '400', name: 'first_pay_discount', value: '50', description: 'discount in percent to service first pay' },
            { _id: '500', name: 'colombia_tax_iva', value: '19', description: 'Colombia tax iva to monthly comeygana payment' },
            { _id: '600', name: 'payu_script_p_tag', value: 'url(https://maf.pagosonline.net/ws/fp?id=', description: 'url for security script for payu form in <p> tag' },
            { _id: '700', name: 'payu_script_img_tag', value: 'https://maf.pagosonline.net/ws/fp/clear.png?id=', description: 'url for security script for payu form in <img> tag' },
            { _id: '800', name: 'payu_script_script_tag', value: 'https://maf.pagosonline.net/ws/fp/check.js?id=', description: 'url for security script for payu form in <script> tag' },
            { _id: '900', name: 'payu_script_object_tag', value: 'https://maf.pagosonline.net/ws/fp/fp.swf?id=', description: 'url for security script for payu form in <object> tag' },
            { _id: '1000', name: 'payu_payments_url_test', value: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi', description: 'url for connect test payu payments API' },
            { _id: '2000', name: 'payu_reports_url_test', value: 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi', description: 'url for connect test payu reports API' },
            { _id: '3000', name: 'ip_public_service_url', value: 'https://api.ipify.org?format=json', description: 'url for retrieve the client public ip' },
            { _id: '1100', name: 'company_name', value: 'Realbind S.A.S', description: 'Realbind company name for invoice' },
            { _id: '1150', name: 'company_phone', value: 'Tel: (57 1) 6959537', description: 'Realbind phone' },
            { _id: '1200', name: 'company_address', value: 'Cra 6 # 58-43 Of 201', description: 'Realbind company address' },
            { _id: '1300', name: 'company_country', value: 'Colombia', description: 'Realbind country location' },
            { _id: '1400', name: 'company_city', value: 'Bogotá', description: 'Realbind city location' },
            { _id: '1500', name: 'company_nit', value: 'NIT: 901.036.585-0', description: 'Realbind NIT' },
            { _id: '1510', name: 'company_regime', value: 'Régimen común', description: 'Realbind regime in Colombia' },
            { _id: '1520', name: 'company_contribution', value: 'No somos grandes contribuyentes', description: 'Realbind contribution in Colombia' },
            { _id: '1530', name: 'company_retainer', value: 'No somos autoretenedores por ventas ni servicios', description: 'Realbind retention in Colombia' },
            { _id: '1540', name: 'company_agent_retainer', value: 'No somos agentes retenedores de IVA e ICA', description: 'Realbind iva and ica agent retention in Colombia' },
            { _id: '1550', name: 'invoice_generated_msg', value: 'Factura emitida por computador', description: 'Invoice message for invoice' },
            { _id: '1600', name: 'iurest_url', value: 'https://www.comeygana.com', description: 'comeygana url page' },
            { _id: '1650', name: 'iurest_url_short', value: 'www.comeygana.com', description: 'comeygana url page short' },
            { _id: '1700', name: 'facebook_link', value: 'https://www.facebook.com', description: 'facebook link for comeygana' },
            { _id: '1800', name: 'twitter_link', value: 'https://www.twitter.com', description: 'twitter link for comeygana' },
            { _id: '1900', name: 'instagram_link', value: 'https://www.instagram.com', description: 'instagram link for comeygana' },
            { _id: '1610', name: 'iurest_img_url', value: 'https://www.comeygana.com/images/', description: 'comeygana images url' },
            { _id: '3100', name: 'ip_public_service_url2', value: 'https://ipinfo.io/json', description: 'url for retrieve the client public ip #2' },
            { _id: '3200', name: 'ip_public_service_url3', value: 'https://ifconfig.co/json', description: 'url for retrieve the client public ip #3' },
            { _id: '9000', name: 'payu_is_prod', value: 'false', description: 'Flag to enable to prod payu payment' },
            { _id: '9100', name: 'payu_test_state', value: 'APPROVED', description: 'Test state for payu payment transaction' },
            { _id: '9200', name: 'payu_reference_code', value: 'M0N_P_', description: 'Prefix for reference code on payu transactions' },
            { _id: '2100', name: 'max_user_penalties', value: '3', description: 'Max number of user penalties' },
            { _id: '2200', name: 'penalty_days', value: '30', description: 'User penalty days' },
            { _id: '8000', name: 'date_test_monthly_pay', value: 'March 5, 2018', description: 'Date test for monthly payment of comeygana service' },
            { _id: '10000', name: 'payu_payments_url_prod', value: 'https://api.payulatam.com/payments-api/4.0/service.cgi', description: 'url for connect prod payu payments API' },
            { _id: '20000', name: 'payu_reports_url_prod', value: 'https://api.payulatam.com/reports-api/4.0/service.cgi', description: 'url for connect prod payu reports API' },
            { _id: '8500', name: 'date_test_reactivate', value: 'January 6, 2018', description: 'Date test for reactivate restaurant for pay' },
            { _id: '30000', name: 'terms_url', value: 'http://www.tsti4t-1935943095.com/signin/', description: 'url to see terms and conditions' },
            { _id: '40000', name: 'policy_url', value: 'http://www.tsti4t-1935943095.com/signup/', description: 'url to see privacy policy' },
            { _id: '50000', name: 'QR_code_url', value: 'http://www.tsti4t-1935943095.com/qr?', description: 'This url redirect to page the comeygana/download when scanned QR code from other application' },
            { _id: '2300', name: 'user_start_points', value: '20', description: 'User start points' },
        ];
        parameters.forEach((parameter) => parameter_collection_1.Parameters.insert(parameter));
    }
}
exports.loadParameters = loadParameters;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"paymentMethods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/paymentMethods.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paymentMethod_collection_1 = require("../../../../both/collections/general/paymentMethod.collection");
function loadPaymentMethods() {
    if (paymentMethod_collection_1.PaymentMethods.find().cursor.count() === 0) {
        const payments = [
            { _id: "10", isActive: true, name: 'PAYMENT_METHODS.CASH' },
            { _id: "20", isActive: true, name: 'PAYMENT_METHODS.CREDIT_CARD' },
            { _id: "30", isActive: true, name: 'PAYMENT_METHODS.DEBIT_CARD' },
            { _id: "40", isActive: false, name: 'PAYMENT_METHODS.ONLINE' },
        ];
        payments.forEach((pay) => paymentMethod_collection_1.PaymentMethods.insert(pay));
    }
}
exports.loadPaymentMethods = loadPaymentMethods;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point-validity.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/point-validity.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const point_validity_collection_1 = require("../../../../both/collections/general/point-validity.collection");
function loadPointsValidity() {
    if (point_validity_collection_1.PointsValidity.find().cursor.count() === 0) {
        const poinst_validity = [
            { _id: "15", point_validity: "15" },
            { _id: "16", point_validity: "16" },
            { _id: "17", point_validity: "17" },
            { _id: "18", point_validity: "18" },
            { _id: "19", point_validity: "19" },
            { _id: "20", point_validity: "20" },
            { _id: "21", point_validity: "21" },
            { _id: "22", point_validity: "22" },
            { _id: "23", point_validity: "23" },
            { _id: "24", point_validity: "24" },
            { _id: "25", point_validity: "25" },
            { _id: "26", point_validity: "26" },
            { _id: "27", point_validity: "27" },
            { _id: "28", point_validity: "28" },
            { _id: "29", point_validity: "29" },
            { _id: "30", point_validity: "30" },
        ];
        poinst_validity.forEach((pnt_validity) => point_validity_collection_1.PointsValidity.insert(pnt_validity));
    }
}
exports.loadPointsValidity = loadPointsValidity;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/point.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const point_collection_1 = require("../../../../both/collections/general/point.collection");
function loadPoints() {
    if (point_collection_1.Points.find().cursor.count() === 0) {
        const points = [
            { _id: "5", point: "5 pts" },
            { _id: "10", point: "10 pts" },
            { _id: "15", point: "15 pts" },
            { _id: "20", point: "20 pts" },
            { _id: "25", point: "25 pts" },
            { _id: "30", point: "30 pts" },
            { _id: "35", point: "35 pts" },
            { _id: "40", point: "40 pts" },
            { _id: "45", point: "45 pts" },
            { _id: "50", point: "50 pts" },
            { _id: "55", point: "55 pts" },
            { _id: "60", point: "60 pts" },
            { _id: "65", point: "65 pts" },
            { _id: "70", point: "70 pts" },
            { _id: "75", point: "75 pts" },
            { _id: "80", point: "80 pts" },
            { _id: "85", point: "85 pts" },
            { _id: "90", point: "90 pts" },
            { _id: "95", point: "95 pts" },
            { _id: "100", point: "100 pts" }
        ];
        points.forEach((point) => point_collection_1.Points.insert(point));
    }
}
exports.loadPoints = loadPoints;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"type-of-food.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/general/type-of-food.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_of_food_collection_1 = require("../../../../both/collections/general/type-of-food.collection");
function loadTypesOfFood() {
    if (type_of_food_collection_1.TypesOfFood.find().cursor.count() === 0) {
        const types = [
            { _id: "10", type_of_food: "TYPE_OF_FOOD.GERMAN_FOOD" },
            { _id: "20", type_of_food: "TYPE_OF_FOOD.AMERICAN_FOOD" },
            { _id: "30", type_of_food: "TYPE_OF_FOOD.ARABIC_FOOD" },
            { _id: "40", type_of_food: "TYPE_OF_FOOD.ARGENTINE_FOOD" },
            { _id: "50", type_of_food: "TYPE_OF_FOOD.ASIAN_FOOD" },
            { _id: "60", type_of_food: "TYPE_OF_FOOD.BRAZILIAN_FOOD" },
            { _id: "70", type_of_food: "TYPE_OF_FOOD.HOMEMADE_FOOD" },
            { _id: "80", type_of_food: "TYPE_OF_FOOD.CHILEAN_FOOD" },
            { _id: "90", type_of_food: "TYPE_OF_FOOD.CHINESE_FOOD" },
            { _id: "100", type_of_food: "TYPE_OF_FOOD.COLOMBIAN_FOOD" },
            { _id: "110", type_of_food: "TYPE_OF_FOOD.COREAN_FOOD" },
            { _id: "120", type_of_food: "TYPE_OF_FOOD.MIDDLE_EASTERN_FOOD" },
            { _id: "130", type_of_food: "TYPE_OF_FOOD.SPANISH_FOOD" },
            { _id: "140", type_of_food: "TYPE_OF_FOOD.FRENCH_FOOD" },
            { _id: "150", type_of_food: "TYPE_OF_FOOD.FUSION_FOOD" },
            { _id: "160", type_of_food: "TYPE_OF_FOOD.GOURMET_FOOD" },
            { _id: "170", type_of_food: "TYPE_OF_FOOD.GREEK_FOOD" },
            { _id: "180", type_of_food: "TYPE_OF_FOOD.INDIAN_FOOD" },
            { _id: "190", type_of_food: "TYPE_OF_FOOD.INTERNATIONAL_FOOD" },
            { _id: "200", type_of_food: "TYPE_OF_FOOD.ITALIAN_FOOD" },
            { _id: "210", type_of_food: "TYPE_OF_FOOD.JAPANESE_FOOD" },
            { _id: "220", type_of_food: "TYPE_OF_FOOD.LATIN_AMERICAN_FOOD" },
            { _id: "230", type_of_food: "TYPE_OF_FOOD.MEDITERRANEAN_FOOD" },
            { _id: "240", type_of_food: "TYPE_OF_FOOD.MEXICAN_FOOD" },
            { _id: "250", type_of_food: "TYPE_OF_FOOD.ORGANIC_FOOD" },
            { _id: "260", type_of_food: "TYPE_OF_FOOD.PERUVIAN_FOOD" },
            { _id: "270", type_of_food: "TYPE_OF_FOOD.FAST_FOOD" },
            { _id: "280", type_of_food: "TYPE_OF_FOOD.THAI_FOOD" },
            { _id: "290", type_of_food: "TYPE_OF_FOOD.VEGETARIAN_FOOD" },
            { _id: "300", type_of_food: "TYPE_OF_FOOD.VIETNAMESE_FOOD" },
            { _id: "310", type_of_food: "TYPE_OF_FOOD.OTHERS" },
            { _id: "320", type_of_food: "TYPE_OF_FOOD.BARBECUE" },
            { _id: "330", type_of_food: "TYPE_OF_FOOD.PASTA" },
            { _id: "340", type_of_food: "TYPE_OF_FOOD.FISH_AND_SEAFOOD" },
            { _id: "350", type_of_food: "TYPE_OF_FOOD.PIZZA" },
            { _id: "360", type_of_food: "TYPE_OF_FOOD.SANDWICHES" },
            { _id: "370", type_of_food: "TYPE_OF_FOOD.SUSHI" },
            { _id: "380", type_of_food: "TYPE_OF_FOOD.VEGANISM" }
        ];
        types.forEach((type) => { type_of_food_collection_1.TypesOfFood.insert(type); });
    }
}
exports.loadTypesOfFood = loadTypesOfFood;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"payments":{"cc-payment-methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/payments/cc-payment-methods.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cc_payment_methods_collection_1 = require("../../../../both/collections/payment/cc-payment-methods.collection");
function loadCcPaymentMethods() {
    if (cc_payment_methods_collection_1.CcPaymentMethods.find().cursor.count() == 0) {
        const ccPaymentMethods = [
            { _id: '10', is_active: true, name: 'Visa', payu_code: 'VISA', logo_name: 'visa' },
            { _id: '20', is_active: true, name: 'Mastercard', payu_code: 'MASTERCARD', logo_name: 'mastercard' },
            { _id: '30', is_active: true, name: 'American Express', payu_code: 'AMEX', logo_name: 'amex' },
            { _id: '40', is_active: true, name: 'Diners Club', payu_code: 'DINERS', logo_name: 'diners' }
        ];
        ccPaymentMethods.forEach((ccPaymentMethod) => { cc_payment_methods_collection_1.CcPaymentMethods.insert(ccPaymentMethod); });
    }
}
exports.loadCcPaymentMethods = loadCcPaymentMethods;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"invoices-info.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/payments/invoices-info.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invoices_info_collection_1 = require("../../../../both/collections/payment/invoices-info.collection");
function loadInvoicesInfo() {
    if (invoices_info_collection_1.InvoicesInfo.find().cursor.count() == 0) {
        const invoicesInfo = [
            {
                _id: '100',
                country_id: '1900',
                resolution_one: '310000089509',
                prefix_one: 'I4T',
                start_date_one: new Date('2017-08-31T00:00:00.00Z'),
                end_date_one: new Date('2017-10-31T00:00:00.00Z'),
                start_value_one: 422000,
                end_value_one: 1000000,
                resolution_two: null,
                prefix_two: null,
                start_date_two: null,
                end_date_two: null,
                start_value_two: null,
                end_value_two: null,
                enable_two: false,
                current_value: null,
                start_new_value: true
            }
        ];
        invoicesInfo.forEach((invoiceInfo) => invoices_info_collection_1.InvoicesInfo.insert(invoiceInfo));
    }
}
exports.loadInvoicesInfo = loadInvoicesInfo;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"points":{"bag_plans.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/points/bag_plans.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bag_plans_collection_1 = require("../../../../both/collections/points/bag-plans.collection");
function loadBagPlans() {
    if (bag_plans_collection_1.BagPlans.find().cursor.count() == 0) {
        const bagPlans = [
            {
                _id: '100',
                name: 'free',
                label: 'BAG_PLAN.FREE',
                price: {
                    country_id: "1900",
                    price: 0,
                    currency: 'COP'
                },
                value_points: 2000,
                active: true,
            },
            {
                _id: '200',
                name: 'small',
                label: 'BAG_PLAN.SMALL',
                price: {
                    country_id: "1900",
                    price: 27900,
                    currency: 'COP'
                },
                value_points: 500,
                active: true,
            },
            {
                _id: '300',
                name: 'medium',
                label: 'BAG_PLAN.MEDIUM',
                price: {
                    country_id: "1900",
                    price: 31900,
                    currency: 'COP'
                },
                value_points: 1000,
                active: true,
            },
            {
                _id: '400',
                name: 'large',
                label: 'BAG_PLAN.LARGE',
                price: {
                    country_id: "1900",
                    price: 34900,
                    currency: 'COP'
                },
                value_points: 1500,
                active: true,
            }
        ];
        bagPlans.forEach((bagPlan) => bag_plans_collection_1.BagPlans.insert(bagPlan));
    }
}
exports.loadBagPlans = loadBagPlans;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"remove-fixtures.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/fixtures/remove-fixtures.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const menu_collection_1 = require("../../../both/collections/auth/menu.collection");
const role_collection_1 = require("../../../both/collections/auth/role.collection");
const hours_collection_1 = require("../../../both/collections/general/hours.collection");
const currency_collection_1 = require("../../../both/collections/general/currency.collection");
const paymentMethod_collection_1 = require("../../../both/collections/general/paymentMethod.collection");
const country_collection_1 = require("../../../both/collections/general/country.collection");
const city_collection_1 = require("../../../both/collections/general/city.collection");
const language_collection_1 = require("../../../both/collections/general/language.collection");
const email_content_collection_1 = require("../../../both/collections/general/email-content.collection");
const parameter_collection_1 = require("../../../both/collections/general/parameter.collection");
const cc_payment_methods_collection_1 = require("../../../both/collections/payment/cc-payment-methods.collection");
const point_collection_1 = require("../../../both/collections/general/point.collection");
const cooking_time_collection_1 = require("../../../both/collections/general/cooking-time.collection");
const type_of_food_collection_1 = require("../../../both/collections/general/type-of-food.collection");
const bag_plans_collection_1 = require("../../../both/collections/points/bag-plans.collection");
function removeFixtures() {
    /**
     * Remove Menus Collection
     */
    menu_collection_1.Menus.remove({});
    /**
     * Remove Roles Collection
     */
    role_collection_1.Roles.remove({});
    /**
     * Remove Hours Collection
     */
    hours_collection_1.Hours.remove({});
    /**
     * Remove Currencies Collection
     */
    currency_collection_1.Currencies.remove({});
    /**
     * Remove PaymentMethods Collection
     */
    paymentMethod_collection_1.PaymentMethods.remove({});
    /**
     * Remove Countries Collection
     */
    country_collection_1.Countries.remove({});
    /**
     * Remove Cities Collection
     */
    city_collection_1.Cities.remove({});
    /**
     * Remove Languages Collection
     */
    language_collection_1.Languages.remove({});
    /**
     * Remove EmailContents Collection
     */
    email_content_collection_1.EmailContents.remove({});
    /**
     * Remove Parameters Collection
     */
    parameter_collection_1.Parameters.remove({});
    /**
     * Remove CcPaymentMethods Collection
     */
    cc_payment_methods_collection_1.CcPaymentMethods.remove({});
    /**
     * Remove Points Collection
     */
    point_collection_1.Points.remove({});
    /**
     * Remove CookingTimes Collection
     */
    cooking_time_collection_1.CookingTimes.remove({});
    /**
     * Remove TypesOfFood Collection
     */
    type_of_food_collection_1.TypesOfFood.remove({});
    /**
     * Remove BagPlans Collection
     */
    bag_plans_collection_1.BagPlans.remove({});
}
exports.removeFixtures = removeFixtures;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"publications":{"auth":{"collaborators.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/auth/collaborators.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const user_collection_1 = require("../../../../both/collections/auth/user.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
meteor_1.Meteor.publish('getUsersDetailsForEstablishment', function (_establishment_work) {
    if (_establishment_work) {
        return user_detail_collection_1.UserDetails.find({ establishment_work: _establishment_work });
    }
});
meteor_1.Meteor.publish('getUsersByEstablishment', function (_establishment_work) {
    if (_establishment_work) {
        let _lUserDetails = [];
        check_1.check(_establishment_work, String);
        user_detail_collection_1.UserDetails.collection.find({ establishment_work: _establishment_work }).fetch().forEach(function (usdet, index, arr) {
            _lUserDetails.push(usdet.user_id);
        });
        return user_collection_1.Users.find({ _id: { $in: _lUserDetails } });
    }
});
/**
 * Get users with role '200' by current establishment.
 * @param { string } _usrId
 */ ;
meteor_1.Meteor.publish('getWaitersByCurrentEstablishment', function (_usrId) {
    let _lUserDetail = user_detail_collection_1.UserDetails.find({ user_id: _usrId }).fetch()[0];
    if (_lUserDetail) {
        return user_detail_collection_1.UserDetails.find({ establishment_work: _lUserDetail.current_establishment, role_id: '200' });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"menus.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/auth/menus.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const menu_collection_1 = require("../../../../both/collections/auth/menu.collection");
meteor_1.Meteor.publish('getMenus', function () {
    return menu_collection_1.Menus.find({}, { sort: { order: 1 } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"roles.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/auth/roles.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const role_collection_1 = require("../../../../both/collections/auth/role.collection");
meteor_1.Meteor.publish('getRoleComplete', function () {
    return role_collection_1.Roles.find({});
});
meteor_1.Meteor.publish('getRoleCollaborators', function () {
    return role_collection_1.Roles.find({ _id: { $in: ["200", "300", "600"] } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-details.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/auth/user-details.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
meteor_1.Meteor.publish('getUsersDetails', function () {
    return user_detail_collection_1.UserDetails.find({});
});
meteor_1.Meteor.publish('getUserDetailsByUser', function (_userId) {
    check(_userId, String);
    return user_detail_collection_1.UserDetails.find({ user_id: _userId });
});
meteor_1.Meteor.publish('getUserDetailsByCurrentTable', function (_establishmentId, _tableId) {
    return user_detail_collection_1.UserDetails.find({ current_establishment: _establishmentId, current_table: _tableId });
});
/**
 * Meteor publication return users by establishments Id
 * @param {string[]} _pEstablishmentsId
 */
meteor_1.Meteor.publish('getUsersByEstablishmentsId', function (_pEstablishmentsId) {
    return user_detail_collection_1.UserDetails.find({ current_establishment: { $in: _pEstablishmentsId } });
});
/**
 * Meteor publication return users details by admin user
 */
meteor_1.Meteor.publish('getUserDetailsByAdminUser', function (_userId) {
    check(_userId, String);
    let _lEstablishmentsId = [];
    establishment_collection_1.Establishments.collection.find({ creation_user: _userId }).fetch().forEach(function (establishment, index, arr) {
        _lEstablishmentsId.push(establishment._id);
    });
    return user_detail_collection_1.UserDetails.find({ current_establishment: { $in: _lEstablishmentsId } });
});
meteor_1.Meteor.publish('getUserDetailsByEstablishmentWork', function (_userId) {
    check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        return user_detail_collection_1.UserDetails.find({ current_establishment: _lUserDetail.establishment_work });
    }
    else {
        return;
    }
});
/**
 * Meteor publication return establishment collaborators
 */
meteor_1.Meteor.publish('getUsersCollaboratorsByEstablishmentsId', function (_pEstablishmentsId) {
    return user_detail_collection_1.UserDetails.find({ establishment_work: { $in: _pEstablishmentsId } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"users.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/auth/users.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const user_collection_1 = require("../../../../both/collections/auth/user.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
const check_1 = require("meteor/check");
meteor_1.Meteor.publish('getUserSettings', function () {
    return user_collection_1.Users.find({ _id: this.userId }, { fields: { username: 1, "services.profile.name": 1, "services.facebook": 1, "services.twitter": 1, "services.google": 1 } });
});
/**
 * Meteor publish, get all users
 */
meteor_1.Meteor.publish('getUsers', function () {
    return user_collection_1.Users.find({});
});
/**
 * Meteor publish. Get user by Id
 */
meteor_1.Meteor.publish('getUserByUserId', function (_usrId) {
    return user_collection_1.Users.find({ _id: _usrId });
});
/**
 * Meteor publication return users with establishment and table Id conditions
 * @param {string} _pEstablishmentId
 * @param {string} _pTableId
 */
meteor_1.Meteor.publish('getUserByTableId', function (_pEstablishmentId, _pTableId) {
    check_1.check(_pEstablishmentId, String);
    check_1.check(_pTableId, String);
    let _lUsers = [];
    user_detail_collection_1.UserDetails.collection.find({ current_establishment: _pEstablishmentId, current_table: _pTableId }).fetch().forEach(function (user, index, arr) {
        _lUsers.push(user.user_id);
    });
    return user_collection_1.Users.find({ _id: { $in: _lUsers } });
});
/**
 * Meteor publication return users by admin user Id
 */
meteor_1.Meteor.publish('getUsersByAdminUser', function (_pUserId) {
    check_1.check(_pUserId, String);
    let _lEstablishmentsId = [];
    let _lUsers = [];
    establishment_collection_1.Establishments.collection.find({ creation_user: _pUserId }).fetch().forEach(function (establishment, index, arr) {
        _lEstablishmentsId.push(establishment._id);
    });
    user_detail_collection_1.UserDetails.collection.find({ current_establishment: { $in: _lEstablishmentsId } }).fetch().forEach(function (userDetail, index, arr) {
        _lUsers.push(userDetail.user_id);
    });
    return user_collection_1.Users.find({ _id: { $in: _lUsers } });
});
/**
 * Meteor publication return users with establishment condition
 * @param {string} _pEstablishmentId
 */
meteor_1.Meteor.publish('getUsersByEstablishmentId', function (_pEstablishmentId) {
    check_1.check(_pEstablishmentId, String);
    let _lUsers = [];
    user_detail_collection_1.UserDetails.collection.find({ current_establishment: _pEstablishmentId }).fetch().forEach(function (user, index, arr) {
        _lUsers.push(user.user_id);
    });
    return user_collection_1.Users.find({ _id: { $in: _lUsers } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"establishment":{"establishment.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/establishment.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const check_1 = require("meteor/check");
const payment_history_collection_1 = require("../../../../both/collections/payment/payment-history.collection");
/**
 * Meteor publication establishments with creation user condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('establishments', function (_userId) {
    check_1.check(_userId, String);
    return establishment_collection_1.Establishments.find({ creation_user: _userId });
});
/**
 * Meteor publications establishmentByCurrentUser
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getEstablishmentByCurrentUser', function (_userId) {
    check_1.check(_userId, String);
    var user_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (user_detail) {
        return establishment_collection_1.Establishments.find({ _id: user_detail.current_establishment });
    }
    else {
        return;
    }
});
/**
 * Meteor publications establishmentByEstablishmentWork
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getEstablishmentByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    var user_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (user_detail) {
        return establishment_collection_1.Establishments.find({ _id: user_detail.establishment_work });
    }
    else {
        return;
    }
});
/**
 * Meteor publication to find current establishments with no pay
 * @param {string} _userId
 */
meteor_1.Meteor.publish('currentEstablishmentsNoPayed', function (_userId) {
    check_1.check(_userId, String);
    let currentDate = new Date();
    let currentMonth = (currentDate.getMonth() + 1).toString();
    let currentYear = currentDate.getFullYear().toString();
    let historyPaymentRes = [];
    let establishmentsInitial = [];
    establishment_collection_1.Establishments.collection.find({ creation_user: _userId, isActive: true, freeDays: false }).fetch().forEach(function (establishment, index, arr) {
        establishmentsInitial.push(establishment._id);
    });
    payment_history_collection_1.PaymentsHistory.collection.find({
        establishmentIds: {
            $in: establishmentsInitial
        }, month: currentMonth, year: currentYear, $or: [{ status: 'TRANSACTION_STATUS.APPROVED' }, { status: 'TRANSACTION_STATUS.PENDING' }]
    }).fetch().forEach(function (historyPayment, index, arr) {
        historyPayment.establishment_ids.forEach((establishment) => {
            historyPaymentRes.push(establishment);
        });
    });
    return establishment_collection_1.Establishments.find({ _id: { $nin: historyPaymentRes }, creation_user: _userId, isActive: true, freeDays: false });
});
/**
 * Meteor publication to find inactive establishments by user
 */
meteor_1.Meteor.publish('getInactiveEstablishments', function (_userId) {
    check_1.check(_userId, String);
    return establishment_collection_1.Establishments.find({ creation_user: _userId, isActive: false });
});
/**
 * Meteor publication return active establishments by user
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getActiveEstablishments', function (_userId) {
    check_1.check(_userId, String);
    return establishment_collection_1.Establishments.find({ creation_user: _userId, isActive: true });
});
/**
 * Meteor publication return establishments by id
 * @param {string} _pId
 */
meteor_1.Meteor.publish('getEstablishmentById', function (_pId) {
    check_1.check(_pId, String);
    return establishment_collection_1.Establishments.find({ _id: _pId });
});
/**
 * Meteor publication return establishment profile by establishment id
 */
meteor_1.Meteor.publish('getEstablishmentProfile', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return establishment_collection_1.EstablishmentsProfile.find({ establishment_id: _establishmentId });
});
/**
 * Meteor publication return establishments by ids
 * @param {string[]} _pId
 */
meteor_1.Meteor.publish('getEstablishmentsByIds', function (_pIds) {
    return establishment_collection_1.Establishments.find({ _id: { $in: _pIds } });
});
/**
 * Meteor publication return establishments
 */
meteor_1.Meteor.publish('getEstablishments', function () {
    return establishment_collection_1.Establishments.find({});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order-history.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/order-history.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const order_history_collection_1 = require("../../../../both/collections/establishment/order-history.collection");
/**
 * Meteor publication return orders history by user Id
 * @param {string} _userId
 * @param {string} _establishmentId
 */
meteor_1.Meteor.publish('getOrdersHistoryByUserId', function (_userId, _establishmentId) {
    check_1.check(_userId, String);
    check_1.check(_establishmentId, String);
    return order_history_collection_1.OrderHistories.find({ customer_id: _userId, establishment_id: _establishmentId });
});
/**
 * Meteor publication return orders history by establishment Id
 * @param {string} _establishmentId
 */
meteor_1.Meteor.publish('getOrderHistoryByEstablishment', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return order_history_collection_1.OrderHistories.find({ establishment_id: _establishmentId });
});
/**
 * Meteor publication return orders history by establishment Ids
 * @param {string[]} _establishmentIds
 */
meteor_1.Meteor.publish('getOrderHistoryByEstablishmentIds', function (_pEstablishmentIds) {
    return order_history_collection_1.OrderHistories.find({ establishment_id: { $in: _pEstablishmentIds } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"order.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/order.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const order_collection_1 = require("../../../../both/collections/establishment/order.collection");
const check_1 = require("meteor/check");
const table_collection_1 = require("../../../../both/collections/establishment/table.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
/**
 * Meteor publication orders with establishmentId and status conditions
 * @param {string} _establishmentId
 * @param {string} _status
 */
meteor_1.Meteor.publish('getOrders', function (_establishmentId, _tableQRCode, _status) {
    check_1.check(_establishmentId, String);
    check_1.check(_tableQRCode, String);
    let _lTable = table_collection_1.Tables.findOne({ QR_code: _tableQRCode });
    if (_lTable) {
        return order_collection_1.Orders.find({ establishment_id: _establishmentId, tableId: _lTable._id, status: { $in: _status } });
    }
    else {
        return;
    }
});
/**
 * Meteor publications orders with establishmentId and status conditions
 * @param {string}
 * @param {string}
*/
meteor_1.Meteor.publish('getOrdersByTableId', function (_establishmentId, _tableId, _status) {
    check_1.check(_establishmentId, String);
    return order_collection_1.Orders.find({ establishment_id: _establishmentId, tableId: _tableId, status: { $in: _status } });
});
/**
 * Meteor publications orders with userId and status conditions
 * @param {string}
 * @param {string}
*/
meteor_1.Meteor.publish('getOrdersByUserId', function (_userId, _status) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        if (_lUserDetail.current_establishment !== '' && _lUserDetail.current_table !== '') {
            return order_collection_1.Orders.find({ establishment_id: _lUserDetail.current_establishment, tableId: _lUserDetail.current_table, status: { $in: _status } });
        }
        else {
            return;
        }
    }
    else {
        return;
    }
});
/**
 * Meteor publication orders with establishmentId condition
 * @param {string} _establishmentId
*/
meteor_1.Meteor.publish('getOrdersByEstablishmentId', function (_establishmentId, _status) {
    check_1.check(_establishmentId, String);
    return order_collection_1.Orders.find({ establishment_id: _establishmentId, status: { $in: _status } });
});
/**
 * Meteor publication orders by establishment work
 * @param {string} _userId
 * @param {sring[]} _status
 */
meteor_1.Meteor.publish('getOrdersByEstablishmentWork', function (_userId, _status) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        return order_collection_1.Orders.find({ establishment_id: _lUserDetail.establishment_work, status: { $in: _status } });
    }
    else {
        return;
    }
});
/**
 * Meteor publications return orders by id
 */
meteor_1.Meteor.publish('getOrderById', function (_orderId) {
    return order_collection_1.Orders.find({ _id: _orderId });
});
/**
 * Meteor publications orders with establishment Ids and status conditions
 * @param {string[]} _pEstablishmentIds
 * @param {string[]} _status
*/
meteor_1.Meteor.publish('getOrdersByEstablishmentIds', function (_pEstablishmentIds, _status) {
    return order_collection_1.Orders.find({ establishment_id: { $in: _pEstablishmentIds }, status: { $in: _status } });
});
/**
 * Meteor publication return orders by user admin establishments
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getOrdersByAdminUser', function (_userId, _status) {
    check_1.check(_userId, String);
    let _lEstablishmentId = [];
    establishment_collection_1.Establishments.collection.find({ creation_user: _userId }).fetch().forEach(function (establishment, index, arr) {
        _lEstablishmentId.push(establishment._id);
    });
    return order_collection_1.Orders.find({ establishment_id: { $in: _lEstablishmentId }, status: { $in: _status } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward-point.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/reward-point.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const reward_point_collection_1 = require("../../../../both/collections/establishment/reward-point.collection");
/**
 * Meteor publication return user reward points
 * @param {string} _user_id
 */
meteor_1.Meteor.publish('getRewardPointsByUserId', function (_user_id) {
    check_1.check(_user_id, String);
    return reward_point_collection_1.RewardPoints.find({ id_user: _user_id });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/reward.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const reward_collection_1 = require("../../../../both/collections/establishment/reward.collection");
const check_1 = require("meteor/check");
const item_collection_1 = require("../../../../both/collections/menu/item.collection");
/**
 * Meteor publication rewards with creation user condition
 */
meteor_1.Meteor.publish('getRewards', function (_userId) {
    check_1.check(_userId, String);
    return reward_collection_1.Rewards.find({ creation_user: _userId });
});
/**
 * Meteor publication return rewards by establishment Id
 */
meteor_1.Meteor.publish('getEstablishmentRewards', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return reward_collection_1.Rewards.find({ establishments: { $in: [_establishmentId] }, is_active: true });
});
/**
 * Meteor publication to return the rewards
 */
meteor_1.Meteor["publishComposite"]('getRewardsToItems', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    if (_establishmentId !== null || _establishmentId !== '') {
        return {
            find() {
                return item_collection_1.Items.find({ 'establishments.establishment_id': { $in: [_establishmentId] } });
            },
            children: [{
                    find(item) {
                        return reward_collection_1.Rewards.find({ item_id: item._id });
                    }
                }]
        };
    }
    else {
        return;
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"table.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/table.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const table_collection_1 = require("../../../../both/collections/establishment/table.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication tables with user creation condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('tables', function (_userId) {
    check_1.check(_userId, String);
    return table_collection_1.Tables.find({ creation_user: _userId });
});
/**
 * Meteor publication tables
 * @param {string} _tableId
 */
meteor_1.Meteor.publish('getTableById', function (_tableId) {
    check_1.check(_tableId, String);
    return table_collection_1.Tables.find({ _id: _tableId });
});
/**
 * Meteor publication table by current_table
 */
meteor_1.Meteor.publish('getTableByCurrentTable', function (_userId) {
    check_1.check(_userId, String);
    var user_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (user_detail) {
        return table_collection_1.Tables.find({ _id: user_detail.current_table });
    }
    else {
        return;
    }
});
/**
 * Meteor publication return all tables
 */
meteor_1.Meteor.publish('getAllTables', function () {
    return table_collection_1.Tables.find({});
});
/**
 * Meteor publication return tables with establishment condition
 * @param {string} _establishmentId
 */
meteor_1.Meteor.publish('getTablesByEstablishment', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return table_collection_1.Tables.find({ establishment_id: _establishmentId, is_active: true });
});
/**
 * Meteor publication return tables by establishment Work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getTablesByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        return table_collection_1.Tables.find({ establishment_id: _lUserDetail.establishment_work, is_active: true });
    }
    else {
        return;
    }
});
/**
 * Meteor publication tables by QR Code
 * @param {string} _lQRCode
 */
meteor_1.Meteor.publish('getTableByQRCode', function (_lQRCode) {
    check_1.check(_lQRCode, String);
    return table_collection_1.Tables.find({ QR_code: _lQRCode });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"waiter-call.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/waiter-call.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const waiter_call_detail_collection_1 = require("../../../../both/collections/establishment/waiter-call-detail.collection");
/**
 * Meteor publication waiter call details. userId
 * @param { string } _userId
 */
meteor_1.Meteor.publish('countWaiterCallDetailByUsrId', function (_userId) {
    return waiter_call_detail_collection_1.WaiterCallDetails.find({ user_id: _userId, status: { $in: ["waiting", "completed"] } });
});
/**
 * Meteor publication waiter call details, for to payment.
 * @param { string } _establishmentId
 * @param { string } _tableId
 * @param { string } _type
 * @param { string[] } _status
 */
meteor_1.Meteor.publish('WaiterCallDetailForPayment', function (_establishmentId, _tableId, _type) {
    return waiter_call_detail_collection_1.WaiterCallDetails.find({
        establishment_id: _establishmentId,
        table_id: _tableId,
        type: _type,
        status: { $in: ['waiting', 'completed'] }
    });
});
/**
 * Meteor publication waiter call details. userId (Waiter id)
 * @param { string } _waiterId
 */
meteor_1.Meteor.publish('waiterCallDetailByWaiterId', function (_waiterId) {
    return waiter_call_detail_collection_1.WaiterCallDetails.find({ waiter_id: _waiterId, status: "completed" });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"general":{"cities.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/cities.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const city_collection_1 = require("../../../../both/collections/general/city.collection");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication cities
 */
meteor_1.Meteor.publish('cities', () => city_collection_1.Cities.find({ is_active: true }));
/**
 * City by establishment
 */
meteor_1.Meteor.publish('getCityByEstablishmentId', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    let establishment = establishment_collection_1.Establishments.findOne({ _id: _establishmentId });
    if (establishment) {
        return city_collection_1.Cities.find({ _id: establishment.cityId });
    }
    else {
        return city_collection_1.Cities.find({ is_active: true });
    }
});
/**
 * Meteor publications cities by country
 */
meteor_1.Meteor.publish('citiesByCountry', function (_countryId) {
    check_1.check(_countryId, String);
    return city_collection_1.Cities.find({ country: _countryId, is_active: true });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cooking-time.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/cooking-time.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const cooking_time_collection_1 = require("../../../../both/collections/general/cooking-time.collection");
/**
 * Meteor publication cooking times
 */
meteor_1.Meteor.publish('cookingTimes', () => cooking_time_collection_1.CookingTimes.find());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"countries.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/countries.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const country_collection_1 = require("../../../../both/collections/general/country.collection");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication countries
 */
meteor_1.Meteor.publish('countries', function () {
    return country_collection_1.Countries.find({ is_active: true });
});
/**
 * Country by establishment
 */
meteor_1.Meteor.publish('getCountryByEstablishmentId', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    let establishment = establishment_collection_1.Establishments.findOne({ _id: _establishmentId });
    if (establishment) {
        return country_collection_1.Countries.find({ _id: establishment.countryId });
    }
    else {
        return country_collection_1.Countries.find({ is_active: true });
        ;
    }
});
/**
 * Meteor publication return countries by establishments Id
 */
meteor_1.Meteor.publish('getCountriesByEstablishmentsId', function (_establishmentsId) {
    let _ids = [];
    establishment_collection_1.Establishments.collection.find({ _id: { $in: _establishmentsId } }).forEach(function (establishment, index, ar) {
        _ids.push(establishment.countryId);
    });
    return country_collection_1.Countries.find({ _id: { $in: _ids } });
});
/**
 * Meteor publicaation return countries by admin user Id
 */
meteor_1.Meteor.publish('getCountriesByAdminUser', function () {
    let _countriesIds = [];
    establishment_collection_1.Establishments.collection.find({ creation_user: this.userId }).forEach(function (establishment, index, ar) {
        _countriesIds.push(establishment.countryId);
    });
    return country_collection_1.Countries.find({ _id: { $in: _countriesIds }, is_active: true });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"currency.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/currency.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const currency_collection_1 = require("../../../../both/collections/general/currency.collection");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
/**
 * Meteor publication currencies
 */
meteor_1.Meteor.publish('currencies', () => currency_collection_1.Currencies.find({ isActive: true }));
/**
 * Meteor publication return currencies by establishments Id
 */
meteor_1.Meteor.publish('getCurrenciesByEstablishmentsId', function (_establishmentsId) {
    let _ids = [];
    establishment_collection_1.Establishments.collection.find({ _id: { $in: _establishmentsId } }).forEach(function (establishment, index, ar) {
        _ids.push(establishment.currencyId);
    });
    return currency_collection_1.Currencies.find({ _id: { $in: _ids } });
});
/**
 * Meteor publication return currencies by  userId
 */
meteor_1.Meteor.publish('getCurrenciesByUserId', function () {
    let _currenciesIds = [];
    establishment_collection_1.Establishments.collection.find({ creation_user: this.userId }).forEach(function (establishment, index, args) {
        _currenciesIds.push(establishment.currencyId);
    });
    return currency_collection_1.Currencies.find({ _id: { $in: _currenciesIds } });
});
/**
 * Meteor publication return currencies by
 */
meteor_1.Meteor.publish('getCurrenciesByCurrentUser', function (_userId) {
    let _userDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_userDetail.current_establishment != '') {
        let establishment = establishment_collection_1.Establishments.findOne({ _id: _userDetail.current_establishment });
        return currency_collection_1.Currencies.find({ _id: establishment.currencyId });
    }
    else {
        return currency_collection_1.Currencies.find({ _id: '0' });
    }
});
/**
 * Meteor publication return currency by establishment work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getCurrenciesByEstablishmentWork', function (_userId) {
    let _userDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    let _currenciesIds = [];
    if (_userDetail.establishment_work != '') {
        let establishment = establishment_collection_1.Establishments.findOne({ _id: _userDetail.establishment_work });
        return currency_collection_1.Currencies.find({ _id: establishment.currencyId });
    }
    else {
        return currency_collection_1.Currencies.find({ _id: '0' });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email-content.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/email-content.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const email_content_collection_1 = require("../../../../both/collections/general/email-content.collection");
/**
 * Meteor publication EmailContents
 */
meteor_1.Meteor.publish('getEmailContents', function () {
    return email_content_collection_1.EmailContents.find({});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"hour.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/hour.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const hours_collection_1 = require("../../../../both/collections/general/hours.collection");
/**
 * Meteor publication hours
 */
meteor_1.Meteor.publish('hours', () => hours_collection_1.Hours.find());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"languages.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/languages.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const language_collection_1 = require("../../../../both/collections/general/language.collection");
/**
 * Meteor publication languages
 */
meteor_1.Meteor.publish('languages', () => language_collection_1.Languages.find({ is_active: true }));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parameter.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/parameter.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const parameter_collection_1 = require("../../../../both/collections/general/parameter.collection");
/**
 * Meteor publication EmailContents
 */
meteor_1.Meteor.publish('getParameters', function () {
    return parameter_collection_1.Parameters.find({});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"paymentMethod.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/paymentMethod.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const paymentMethod_collection_1 = require("../../../../both/collections/general/paymentMethod.collection");
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
/**
 * Meteor publication paymentMethods
 */
meteor_1.Meteor.publish('paymentMethods', () => paymentMethod_collection_1.PaymentMethods.find({ isActive: true }));
/**
 * Meteor publication return payment methods by current establishment of the user
 */
meteor_1.Meteor.publish('getPaymentMethodsByUserCurrentEstablishment', function (_pUserId) {
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _pUserId });
    if (_lUserDetail.current_establishment) {
        let _lEstablishment = establishment_collection_1.Establishments.findOne({ _id: _lUserDetail.current_establishment });
        return paymentMethod_collection_1.PaymentMethods.find({ _id: { $in: _lEstablishment.paymentMethods }, isActive: true });
    }
    else {
        return paymentMethod_collection_1.PaymentMethods.find({ isActive: true });
    }
});
/*
 * Meteor publication return establishment payment methods
 */
meteor_1.Meteor.publish('getPaymentMethodsByEstablishmentId', function (_pEstablishmentId) {
    check_1.check(_pEstablishmentId, String);
    let _lEstablishment = establishment_collection_1.Establishments.findOne({ _id: _pEstablishmentId });
    if (_lEstablishment) {
        return paymentMethod_collection_1.PaymentMethods.find({ _id: { $in: _lEstablishment.paymentMethods }, isActive: true });
    }
    else {
        return paymentMethod_collection_1.PaymentMethods.find({ isActive: true });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point-validity.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/point-validity.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const point_validity_collection_1 = require("../../../../both/collections/general/point-validity.collection");
/**
 * Meteor publication points validity
 */
meteor_1.Meteor.publish('pointsValidity', () => point_validity_collection_1.PointsValidity.find());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"point.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/point.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const point_collection_1 = require("../../../../both/collections/general/point.collection");
/**
 * Meteor publication points
 */
meteor_1.Meteor.publish('points', () => point_collection_1.Points.find());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"type-of-food.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/general/type-of-food.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const type_of_food_collection_1 = require("../../../../both/collections/general/type-of-food.collection");
/**
 * Meteor publication typesOfFood
 */
meteor_1.Meteor.publish('typesOfFood', () => type_of_food_collection_1.TypesOfFood.find());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"menu":{"additions.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/additions.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const addition_collection_1 = require("../../../../both/collections/menu/addition.collection");
const item_collection_1 = require("../../../../both/collections/menu/item.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication additions with creation user condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('additions', function (_userId) {
    check_1.check(_userId, String);
    return addition_collection_1.Additions.find({ creation_user: _userId });
});
/**
 * Meteor publication return additions with establishment condition
 * @param {string} _establishmentId
 */
meteor_1.Meteor.publish('additionsByEstablishment', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return addition_collection_1.Additions.find({ 'establishments.establishment_id': { $in: [_establishmentId] }, is_active: true });
});
/**
 * Meteor publication return additions with id condition
 * @param {string} _pId
 */
meteor_1.Meteor.publish('additionsById', function (_pId) {
    check_1.check(_pId, String);
    return addition_collection_1.Additions.find({ _id: _pId });
});
/**
 * Meteor publication return additions with userId condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('additionsByCurrentEstablishment', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        return addition_collection_1.Additions.find({ 'establishments.establishment_id': { $in: [_lUserDetail.current_establishment] }, is_active: true });
    }
    else {
        return;
    }
});
/**
 * Meteor publication return addtions by itemId  condition
 * @param {string} _itemId
*/
meteor_1.Meteor.publish('additionsByItem', function (_itemId) {
    check_1.check(_itemId, String);
    var item = item_collection_1.Items.findOne({ _id: _itemId, additionsIsAccepted: true });
    if (typeof item !== 'undefined') {
        var aux = addition_collection_1.Additions.find({ _id: { $in: item.additions } }).fetch();
        return addition_collection_1.Additions.find({ _id: { $in: item.additions } });
    }
    else {
        return addition_collection_1.Additions.find({ _id: { $in: [] } });
    }
});
/**
 * Meteor publication additions by establishment work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('additionsByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        return addition_collection_1.Additions.find({ 'establishments.establishment_id': { $in: [_lUserDetail.establishment_work] }, is_active: true });
    }
    else {
        return;
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"categories.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/categories.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const category_collection_1 = require("../../../../both/collections/menu/category.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const section_collection_1 = require("../../../../both/collections/menu/section.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication categories with creation user condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('categories', function (_userId) {
    check_1.check(_userId, String);
    return category_collection_1.Categories.find({ creation_user: _userId });
});
/**
 * Meteor publication return categories with establishment condition
 * @param {string} _establishmentId
 */
meteor_1.Meteor.publish('categoriesByEstablishment', function (_establishmentId) {
    let _sections = [];
    check_1.check(_establishmentId, String);
    section_collection_1.Sections.collection.find({ establishments: { $in: [_establishmentId] }, is_active: true }).fetch().forEach(function (s, index, arr) {
        _sections.push(s._id);
    });
    return category_collection_1.Categories.find({ section: { $in: _sections }, is_active: true });
});
/**
 * Meteor ppublication return categories by establishment work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getCategoriesByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let _sections = [];
    let user_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (user_detail) {
        section_collection_1.Sections.collection.find({ establishments: { $in: [user_detail.establishment_work] }, is_active: true }).fetch().forEach(function (s, index, arr) {
            _sections.push(s._id);
        });
        return category_collection_1.Categories.find({ section: { $in: _sections }, is_active: true });
    }
    else {
        return;
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"garnish-food.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/garnish-food.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const garnish_food_collection_1 = require("../../../../both/collections/menu/garnish-food.collection");
const item_collection_1 = require("../../../../both/collections/menu/item.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication garnishFood with creation user condition
 * @param {String} _userId
 */
meteor_1.Meteor.publish('garnishFood', function (_userId) {
    check_1.check(_userId, String);
    return garnish_food_collection_1.GarnishFoodCol.find({ creation_user: _userId });
});
/**
 * Meteor publication return garnish food with establishment condition
 * @param {string} _establishmentId
 */
meteor_1.Meteor.publish('garnishFoodByEstablishment', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return garnish_food_collection_1.GarnishFoodCol.find({ 'establishments.establishment_id': { $in: [_establishmentId] }, is_active: true });
});
/**
 * Meteor publication return garnish food with _id
 * @param {string} _pId
 */
meteor_1.Meteor.publish('garnishFoodById', function (_pId) {
    check_1.check(_pId, String);
    return garnish_food_collection_1.GarnishFoodCol.find({ _id: _pId });
});
/**
 * Meteor publication return garnish food by itemId  condition
 * @param {string}
 */
meteor_1.Meteor.publish('garnishesByItem', function (_itemId) {
    check_1.check(_itemId, String);
    var item = item_collection_1.Items.findOne({ _id: _itemId, garnishFoodIsAcceped: true });
    if (item) {
        return garnish_food_collection_1.GarnishFoodCol.find({ _id: { $in: item.garnishFood } });
    }
    else {
        return;
    }
});
/**
 * Meteor publication garnish food by establishment work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('garnishFoodByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        return garnish_food_collection_1.GarnishFoodCol.find({ 'establishments.establishment_id': { $in: [_lUserDetail.establishment_work] }, is_active: true });
    }
    else {
        return;
    }
});
/**
 * Meteor publication return garnish food with userId condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('garnishFoodByCurrentEstablishment', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        return garnish_food_collection_1.GarnishFoodCol.find({ 'establishments.establishment_id': { $in: [_lUserDetail.current_establishment] }, is_active: true });
    }
    else {
        return;
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"item.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/item.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const item_collection_1 = require("../../../../both/collections/menu/item.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication items with creation user condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('items', function (_userId) {
    check_1.check(_userId, String);
    return item_collection_1.Items.find({ creation_user: _userId });
});
/**
 * Meteor publication admin active items
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getAdminActiveItems', function (_userId) {
    check_1.check(_userId, String);
    return item_collection_1.Items.find({ creation_user: _userId, is_active: true });
});
/**
 * Meteor publication return items with establishment condition
 */
meteor_1.Meteor.publish('itemsByEstablishment', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return item_collection_1.Items.find({ 'establishments.establishment_id': { $in: [_establishmentId] }, is_active: true });
});
/**
 * Meteor publication return items with user condition
 */
meteor_1.Meteor.publish('itemsByUser', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        if (_lUserDetail.current_establishment) {
            return item_collection_1.Items.find({ 'establishments.establishment_id': { $in: [_lUserDetail.current_establishment] }, is_active: true });
        }
        else {
            return;
        }
    }
    else {
        return;
    }
});
/**
 * Meteor publication return item by id
 */
meteor_1.Meteor.publish('itemById', function (_itemId) {
    check_1.check(_itemId, String);
    return item_collection_1.Items.find({ _id: _itemId });
});
/**
 * Meteor publication return items by establishment work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getItemsByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    let _sections = [];
    if (_lUserDetail) {
        if (_lUserDetail.establishment_work) {
            return item_collection_1.Items.find({ 'establishments.establishment_id': { $in: [_lUserDetail.establishment_work] }, is_active: true });
        }
        else {
            return;
        }
    }
    else {
        return;
    }
});
/**
 * Meteor publication return establishments items
 * @param {string[]} _pEstablishmentIds
 */
meteor_1.Meteor.publish('getItemsByEstablishmentIds', function (_pEstablishmentIds) {
    return item_collection_1.Items.find({ 'establishments.establishment_id': { $in: _pEstablishmentIds } });
});
/**
 * Meetor publication return items by establishment work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getItemsByUserEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        if (_lUserDetail.establishment_work) {
            return item_collection_1.Items.find({ 'establishments.establishment_id': { $in: [_lUserDetail.establishment_work] }, is_active: true });
        }
        else {
            return;
        }
    }
    else {
        return;
    }
});
/***
 * Meteor publication return items sorted by item name
 */
/**
 * Meteor publication return items with establishment condition
 */
meteor_1.Meteor.publish('itemsByEstablishmentSortedByName', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return item_collection_1.Items.find({ 'establishments.establishment_id': { $in: [_establishmentId] }, is_active: true }, { sort: { name: 1 } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"option-values.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/option-values.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const option_value_collection_1 = require("../../../../both/collections/menu/option-value.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication option values with creation user condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getAdminOptionValues', function (_userId) {
    check_1.check(_userId, String);
    return option_value_collection_1.OptionValues.find({ creation_user: _userId });
});
/**
 * Meteor publication option values with option ids condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getOptionValuesByOptionIds', function (_pOptionIds) {
    return option_value_collection_1.OptionValues.find({ option_id: { $in: _pOptionIds }, is_active: true });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"options.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/options.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const option_collection_1 = require("../../../../both/collections/menu/option.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication option with creation user condition
 * @param {String} _userId
 */
meteor_1.Meteor.publish('getAdminOptions', function (_userId) {
    check_1.check(_userId, String);
    return option_collection_1.Options.find({ creation_user: _userId });
});
/**
 * Meteor publication establishments options
 * @param {string} _establishmentId
*/
meteor_1.Meteor.publish('optionsByEstablishment', function (_establishmentsId) {
    return option_collection_1.Options.find({ establishments: { $in: _establishmentsId }, is_active: true });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sections.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/sections.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const section_collection_1 = require("../../../../both/collections/menu/section.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication section with creation user condition
 * @param {String} _userId
 */
meteor_1.Meteor.publish('sections', function (_userId) {
    check_1.check(_userId, String);
    return section_collection_1.Sections.find({ creation_user: _userId });
});
/**
 * Meteor publication establishments sections
 * @param {string} _establishmentId
*/
meteor_1.Meteor.publish('sectionsByEstablishment', function (_establishmentId) {
    check_1.check(_establishmentId, String);
    return section_collection_1.Sections.find({ establishments: { $in: [_establishmentId] }, is_active: true });
});
meteor_1.Meteor.publish('getSections', function () {
    return section_collection_1.Sections.find({});
});
/**
 * Meteor publication establishments sections by establishment work
 * @param {string} _userId
*/
meteor_1.Meteor.publish('getSectionsByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let user_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (user_detail) {
        return section_collection_1.Sections.find({ establishments: { $in: [user_detail.establishment_work] }, is_active: true });
    }
    else {
        return;
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"subcategories.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/menu/subcategories.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const subcategory_collection_1 = require("../../../../both/collections/menu/subcategory.collection");
const section_collection_1 = require("../../../../both/collections/menu/section.collection");
const category_collection_1 = require("../../../../both/collections/menu/category.collection");
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
const check_1 = require("meteor/check");
/**
 * Meteor publication subcategories with creation user condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('subcategories', function (_userId) {
    check_1.check(_userId, String);
    return subcategory_collection_1.Subcategories.find({ creation_user: _userId });
});
/**
 * Meteor publication return subcategories with establishment condition
 * @param {string} _establishmentId
 */
meteor_1.Meteor.publish('subcategoriesByEstablishment', function (_establishmentId) {
    let _sections = [];
    let _categories = [];
    check_1.check(_establishmentId, String);
    section_collection_1.Sections.collection.find({ establishments: { $in: [_establishmentId] }, is_active: true }).fetch().forEach(function (s, index, arr) {
        _sections.push(s._id);
    });
    category_collection_1.Categories.collection.find({ section: { $in: _sections }, is_active: true }).fetch().forEach(function (c, index, arr) {
        _categories.push(c._id);
    });
    return subcategory_collection_1.Subcategories.find({ category: { $in: _categories }, is_active: true });
});
/**
 * Meteor publication return subcategories by establishment work
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getSubcategoriesByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    let _sections = [];
    let _categories = [];
    let user_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (user_detail) {
        section_collection_1.Sections.collection.find({ establishments: { $in: [user_detail.establishment_work] }, is_active: true }).fetch().forEach(function (s, index, arr) {
            _sections.push(s._id);
        });
        category_collection_1.Categories.collection.find({ section: { $in: _sections }, is_active: true }).fetch().forEach(function (c, index, arr) {
            _categories.push(c._id);
        });
        return subcategory_collection_1.Subcategories.find({ category: { $in: _categories }, is_active: true });
    }
    else {
        return;
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"payment":{"cc-payment-method.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/payment/cc-payment-method.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const cc_payment_methods_collection_1 = require("../../../../both/collections/payment/cc-payment-methods.collection");
/**
 * Meteor publication EmailContents
 */
meteor_1.Meteor.publish('getCcPaymentMethods', function () {
    return cc_payment_methods_collection_1.CcPaymentMethods.find({ is_active: true });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"invoice-info.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/payment/invoice-info.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const invoices_info_collection_1 = require("../../../../both/collections/payment/invoices-info.collection");
/**
 * Meteor publication InvoicesInfo
 */
meteor_1.Meteor.publish('getInvoicesInfoByCountry', function (countryId) {
    return invoices_info_collection_1.InvoicesInfo.find({ country_id: countryId });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"iurest-invoices.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/payment/iurest-invoices.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const iurest_invoices_collection_1 = require("../../../../both/collections/payment/iurest-invoices.collection");
/**
 * Meteor publication InvoicesInfo
 */
meteor_1.Meteor.publish('getAllIurestInvoices', function () {
    return iurest_invoices_collection_1.IurestInvoices.find({});
});
meteor_1.Meteor.publish('getIurestInvoiceByUser', function (_userId) {
    check(_userId, String);
    return iurest_invoices_collection_1.IurestInvoices.find({ creation_user: _userId });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"payment-history.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/payment/payment-history.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const payment_history_collection_1 = require("../../../../both/collections/payment/payment-history.collection");
/**
 * Meteor publication EmailContents
 */
meteor_1.Meteor.publish('getHistoryPaymentsByUser', function (_userId) {
    return payment_history_collection_1.PaymentsHistory.find({ creation_user: _userId, isInitial: false }, { sort: { creation_date: -1 } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"payment-transaction.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/payment/payment-transaction.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const payment_transaction_collection_1 = require("../../../../both/collections/payment/payment-transaction.collection");
/**
 * Meteor publication EmailContents
 */
meteor_1.Meteor.publish('getTransactions', function () {
    return payment_transaction_collection_1.PaymentTransactions.find({});
});
meteor_1.Meteor.publish('getTransactionsByUser', function (_userId) {
    return payment_transaction_collection_1.PaymentTransactions.find({ creation_user: _userId });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"points":{"bag_plans.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/points/bag_plans.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bag_plans_collection_1 = require("../../../../both/collections/points/bag-plans.collection");
/**
 * Meteor publication bag plans
 * @param {string} _userId
 */
Meteor.publish('getBagPlans', function () {
    let _lBagsPlans = bag_plans_collection_1.BagPlans.find({});
    return _lBagsPlans;
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"establishment_points.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/points/establishment_points.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const establishment_points_collection_1 = require("../../../../both/collections/points/establishment-points.collection");
/**
 * Meteor publication establishment points by ids
 * @param {string[]} _pIds
 */
meteor_1.Meteor.publish('getEstablishmentPointsByIds', function (_pIds) {
    return establishment_points_collection_1.EstablishmentPoints.find({ establishment_id: { $in: _pIds } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"negative-point.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/points/negative-point.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const negative_points_collection_1 = require("../../../../both/collections/points/negative-points.collection");
/**
 * Meteor publication establishment negative points by id
 * @param {string} _pId
 */
meteor_1.Meteor.publish('getNegativePointsByEstablishmentId', function (_pId) {
    return negative_points_collection_1.NegativePoints.find({ establishment_id: _pId });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"indexes":{"indexdb.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/indexes/indexdb.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const establishment_collection_1 = require("../../../both/collections/establishment/establishment.collection");
const user_detail_collection_1 = require("../../../both/collections/auth/user-detail.collection");
const section_collection_1 = require("../../../both/collections/menu/section.collection");
const category_collection_1 = require("../../../both/collections/menu/category.collection");
const subcategory_collection_1 = require("../../../both/collections/menu/subcategory.collection");
const addition_collection_1 = require("../../../both/collections/menu/addition.collection");
const item_collection_1 = require("../../../both/collections/menu/item.collection");
const paymentMethod_collection_1 = require("../../../both/collections/general/paymentMethod.collection");
const payment_history_collection_1 = require("../../../both/collections/payment/payment-history.collection");
const order_collection_1 = require("../../../both/collections/establishment/order.collection");
const table_collection_1 = require("../../../both/collections/establishment/table.collection");
const waiter_call_detail_collection_1 = require("../../../both/collections/establishment/waiter-call-detail.collection");
const cc_payment_methods_collection_1 = require("../../../both/collections/payment/cc-payment-methods.collection");
const payment_transaction_collection_1 = require("../../../both/collections/payment/payment-transaction.collection");
const order_history_collection_1 = require("../../../both/collections/establishment/order-history.collection");
const city_collection_1 = require("../../../both/collections/general/city.collection");
const country_collection_1 = require("../../../both/collections/general/country.collection");
const language_collection_1 = require("../../../both/collections/general/language.collection");
const reward_point_collection_1 = require("../../../both/collections/establishment/reward-point.collection");
const reward_collection_1 = require("../../../both/collections/establishment/reward.collection");
const parameter_collection_1 = require("../../../both/collections/general/parameter.collection");
const option_value_collection_1 = require("../../../both/collections/menu/option-value.collection");
const option_collection_1 = require("../../../both/collections/menu/option.collection");
const invoices_info_collection_1 = require("../../../both/collections/payment/invoices-info.collection");
const establishment_points_collection_1 = require("../../../both/collections/points/establishment-points.collection");
const negative_points_collection_1 = require("../../../both/collections/points/negative-points.collection");
function createdbindexes() {
    // Establishment Collection Indexes
    establishment_collection_1.Establishments.collection._ensureIndex({ creation_user: 1 });
    establishment_collection_1.Establishments.collection._ensureIndex({ name: 1 });
    establishment_collection_1.Establishments.collection._ensureIndex({ isActive: 1 });
    // Establishment Profile Collection Indexes
    establishment_collection_1.EstablishmentsProfile.collection._ensureIndex({ establishment_id: 1 });
    // User Collections Indexes
    user_detail_collection_1.UserDetails.collection._ensureIndex({ user_id: 1 });
    user_detail_collection_1.UserDetails.collection._ensureIndex({ establishment_work: 1 });
    user_detail_collection_1.UserDetails.collection._ensureIndex({ current_establishment: 1, current_table: 1 });
    // Section Collection Indexes
    section_collection_1.Sections.collection._ensureIndex({ creation_user: 1 });
    section_collection_1.Sections.collection._ensureIndex({ establishments: 1 });
    // Category Collection Indexes
    category_collection_1.Categories.collection._ensureIndex({ creation_user: 1 });
    category_collection_1.Categories.collection._ensureIndex({ section: 1 });
    // Subcategory Collection Indexes
    subcategory_collection_1.Subcategories.collection._ensureIndex({ creation_user: 1 });
    subcategory_collection_1.Subcategories.collection._ensureIndex({ category: 1 });
    // Addition Collection Indexes
    addition_collection_1.Additions.collection._ensureIndex({ creation_user: 1 });
    addition_collection_1.Additions.collection._ensureIndex({ establishments: 1 });
    // Item Collection Indexes
    item_collection_1.Items.collection._ensureIndex({ creation_user: 1 });
    item_collection_1.Items.collection._ensureIndex({ sectionId: 1 });
    item_collection_1.Items.collection._ensureIndex({ establishments: 1 });
    // PaymentMethod Collection Indexes
    paymentMethod_collection_1.PaymentMethods.collection._ensureIndex({ isActive: 1 });
    // PaymentsHistory Collection Indexes
    payment_history_collection_1.PaymentsHistory.collection._ensureIndex({ establishment_ids: 1 });
    payment_history_collection_1.PaymentsHistory.collection._ensureIndex({ creation_user: 1 });
    payment_history_collection_1.PaymentsHistory.collection._ensureIndex({ creation_date: 1 });
    // Tables Collection Indexes
    table_collection_1.Tables.collection._ensureIndex({ QR_code: 1 });
    table_collection_1.Tables.collection._ensureIndex({ establishment_id: 1 });
    // Orders Collection Indexes
    order_collection_1.Orders.collection._ensureIndex({ establishment_id: 1 });
    order_collection_1.Orders.collection._ensureIndex({ tableId: 1 });
    order_collection_1.Orders.collection._ensureIndex({ status: 1 });
    // WaiterCallDetails Collection Indexes
    waiter_call_detail_collection_1.WaiterCallDetails.collection._ensureIndex({ status: 1 });
    waiter_call_detail_collection_1.WaiterCallDetails.collection._ensureIndex({ user_id: 1 });
    waiter_call_detail_collection_1.WaiterCallDetails.collection._ensureIndex({ establishment_id: 1, table_id: 1, type: 1 });
    // CcPaymentMethods Collection Indexes
    cc_payment_methods_collection_1.CcPaymentMethods.collection._ensureIndex({ is_active: 1 });
    // PaymentTransactions Collection Indexes
    payment_transaction_collection_1.PaymentTransactions.collection._ensureIndex({ creation_user: 1 });
    // OrderHistories Collection Indexes
    order_history_collection_1.OrderHistories.collection._ensureIndex({ customer_id: 1, establishment_id: 1 });
    // Cities Collection Indexes
    city_collection_1.Cities.collection._ensureIndex({ country: 1 });
    city_collection_1.Cities.collection._ensureIndex({ is_active: 1 });
    // Countries Collection Indexes
    country_collection_1.Countries.collection._ensureIndex({ is_active: 1 });
    // Languages Collection Indexes
    language_collection_1.Languages.collection._ensureIndex({ is_active: 1 });
    // RewardPoints Collection Indexes
    reward_point_collection_1.RewardPoints.collection._ensureIndex({ id_user: 1 });
    // Rewards Collection Indexes
    reward_collection_1.Rewards.collection._ensureIndex({ establishments: 1 });
    reward_collection_1.Rewards.collection._ensureIndex({ item_id: 1 });
    // Parameters Collection Indexes
    parameter_collection_1.Parameters.collection._ensureIndex({ name: 1 });
    // OptionValues Collection Indexes
    option_value_collection_1.OptionValues.collection._ensureIndex({ creation_user: 1 });
    option_value_collection_1.OptionValues.collection._ensureIndex({ option_id: 1 });
    // Options Collection Indexes
    option_collection_1.Options.collection._ensureIndex({ creation_user: 1 });
    option_collection_1.Options.collection._ensureIndex({ establishments: 1 });
    // InvoicesInfo Collection Indexes
    invoices_info_collection_1.InvoicesInfo.collection._ensureIndex({ country_id: 1 });
    // EstablishmentPoints Collection Indexes
    establishment_points_collection_1.EstablishmentPoints.collection._ensureIndex({ establishment_id: 1 });
    // NegativePoints Collection Indexes
    negative_points_collection_1.NegativePoints.collection._ensureIndex({ establishment_id: 1 });
}
exports.createdbindexes = createdbindexes;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"cron-config.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/cron-config.js                                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const percolate_synced_cron_1 = require("meteor/percolate:synced-cron");
percolate_synced_cron_1.SyncedCron.config({
    // Log job run details to console
    log: true,
    // Use a custom logger function (defaults to Meteor's logging package)
    logger: null,
    // Name of collection to use for synchronisation and logging
    collectionName: 'cron_history',
    // Default to using localTime
    utc: false,
    /*
      TTL in seconds for history records in collection to expire
      NOTE: Unset to remove expiry but ensure you remove the index from
      mongo by hand

      ALSO: SyncedCron can't use the `_ensureIndex` command to modify
      the TTL index. The best way to modify the default value of
      `collectionTTL` is to remove the index by hand (in the mongo shell
      run `db.cronHistory.dropIndex({startedAt: 1})`) and re-run your
      project. SyncedCron will recreate the index with the updated TTL.
    */
    collectionTTL: 172800
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cron.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/cron.js                                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const percolate_synced_cron_1 = require("meteor/percolate:synced-cron");
const country_collection_1 = require("../both/collections/general/country.collection");
function createCrons() {
    let activeCountries = country_collection_1.Countries.collection.find({ is_active: true }).fetch();
    activeCountries.forEach(country => {
        /**
        * This cron evaluates the freeDays flag on establishments with value true, and change it to false
        */
        /**
         SyncedCron.add({
           name: 'cronChangeFreeDays.' + country.name,
           schedule: function (parser) {
             return parser.cron(country.cronChangeFreeDays);
           },
           job: function () {
             Meteor.call('changeFreeDaysToFalse', country._id);
           }
         });
          */
        /**
        * This cron sends email to warn the charge soon of iurest service
        */
        /**
         SyncedCron.add({
           name: 'cronEmailChargeSoon.' + country.name,
           schedule: function (parser) {
             return parser.cron(country.cronEmailChargeSoon);
           },
           job: function () {
             Meteor.call('sendEmailChargeSoon', country._id);
           }
         });
          */
        /**
        * This cron sends email to warn the expire soon the iurest service
        */
        /**
         SyncedCron.add({
           name: 'cronEmailExpireSoon.' + country.name,
           schedule: function (parser) {
             return parser.cron(country.cronEmailExpireSoon);
           },
           job: function () {
             Meteor.call('sendEmailExpireSoon', country._id);
           }
         });
          */
        /**
         * This cron evaluates the isActive flag on establishments with value true, and insert them on history_payment collection
         */
        /**
        SyncedCron.add({
          name: 'cronValidateActive.' + country.name,
          schedule: function (parser) {
            return parser.cron(country.cronValidateActive);
          },
          job: function () {
            Meteor.call('validateActiveEstablishments', country._id);
          }
        });
         */
        /**
        * This cron sends an email to warn that the service has expired
        */
        /**
         SyncedCron.add({
           name: 'cronEmailRestExpired.' + country.name,
           schedule: function (parser) {
             return parser.cron(country.cronEmailRestExpired);
           },
           job: function () {
             Meteor.call('sendEmailRestExpired', country._id);
           }
         });
          */
        /**
        * This cron validate the points expiration date
        */
        percolate_synced_cron_1.SyncedCron.add({
            name: 'cronPointsExpire.' + country.name,
            schedule: function (parser) {
                return parser.cron(country.cronPointsExpire);
            },
            job: function () {
                Meteor.call('checkPointsToExpire', country._id);
            }
        });
    });
}
exports.createCrons = createCrons;
percolate_synced_cron_1.SyncedCron.start();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/main.js                                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
require("./imports/publications/menu/sections");
require("./imports/publications/menu/categories");
require("./imports/publications/menu/subcategories");
require("./imports/publications/menu/additions");
require("./imports/publications/menu/garnish-food");
require("./imports/publications/menu/item");
require("./imports/publications/menu/options");
require("./imports/publications/menu/option-values");
require("./imports/publications/auth/users");
require("./imports/publications/auth/roles");
require("./imports/publications/auth/menus");
require("./imports/publications/auth/collaborators");
require("./imports/publications/auth/user-details");
require("./imports/publications/general/hour");
require("./imports/publications/general/currency");
require("./imports/publications/general/paymentMethod");
require("./imports/publications/general/email-content");
require("./imports/publications/general/parameter");
require("./imports/publications/general/cities");
require("./imports/publications/general/countries");
require("./imports/publications/general/languages");
require("./imports/publications/general/point");
require("./imports/publications/general/cooking-time");
require("./imports/publications/general/point-validity");
require("./imports/publications/general/type-of-food");
require("./imports/publications/payment/payment-history");
require("./imports/publications/payment/cc-payment-method");
require("./imports/publications/payment/payment-transaction");
require("./imports/publications/payment/invoice-info");
require("./imports/publications/payment/iurest-invoices");
require("./imports/publications/establishment/establishment");
require("./imports/publications/establishment/table");
require("./imports/publications/establishment/order");
require("./imports/publications/establishment/waiter-call");
require("./imports/publications/establishment/reward");
require("./imports/publications/establishment/reward-point");
require("./imports/publications/establishment/order-history");
require("./imports/publications/points/bag_plans");
require("./imports/publications/points/establishment_points");
require("./imports/publications/points/negative-point");
require("../both/methods/menu/item.methods");
require("../both/methods/auth/collaborators.methods");
require("../both/methods/auth/menu.methods");
require("../both/methods/auth/user-detail.methods");
require("../both/methods/auth/user-devices.methods");
require("../both/methods/auth/user-login.methods");
require("../both/methods/auth/user.methods");
require("../both/methods/general/cron.methods");
require("../both/methods/general/email.methods");
require("../both/methods/general/parameter.methods");
require("../both/methods/general/change-email.methods");
require("../both/methods/general/country.methods");
require("../both/methods/general/iurest-invoice.methods");
require("../both/methods/general/push-notifications.methods");
require("../both/methods/establishment/establishment.methods");
require("../both/methods/establishment/order-history.methods");
require("../both/methods/establishment/order.methods");
require("../both/methods/establishment/schedule.methods");
require("../both/methods/establishment/table.method");
require("../both/methods/establishment/waiter-queue/waiter-queue.methods");
require("../both/methods/establishment/waiter-queue/queues.methods");
require("./imports/fixtures/auth/account-creation");
require("./imports/fixtures/auth/email-config");
const remove_fixtures_1 = require("./imports/fixtures/remove-fixtures");
const roles_1 = require("./imports/fixtures/auth/roles");
const menus_1 = require("./imports/fixtures/auth/menus");
const hours_1 = require("./imports/fixtures/general/hours");
const currencies_1 = require("./imports/fixtures/general/currencies");
const paymentMethods_1 = require("./imports/fixtures/general/paymentMethods");
const countries_1 = require("./imports/fixtures/general/countries");
const cities_1 = require("./imports/fixtures/general/cities");
const languages_1 = require("./imports/fixtures/general/languages");
const email_contents_1 = require("./imports/fixtures/general/email-contents");
const parameters_1 = require("./imports/fixtures/general/parameters");
const cc_payment_methods_1 = require("./imports/fixtures/payments/cc-payment-methods");
const invoices_info_1 = require("./imports/fixtures/payments/invoices-info");
const point_1 = require("./imports/fixtures/general/point");
const cooking_time_1 = require("./imports/fixtures/general/cooking-time");
const point_validity_1 = require("./imports/fixtures/general/point-validity");
const type_of_food_1 = require("./imports/fixtures/general/type-of-food");
const indexdb_1 = require("/server/imports/indexes/indexdb");
const cron_1 = require("./cron");
const bag_plans_1 = require("./imports/fixtures/points/bag_plans");
meteor_1.Meteor.startup(() => {
    remove_fixtures_1.removeFixtures();
    menus_1.loadMenus();
    roles_1.loadRoles();
    hours_1.loadHours();
    currencies_1.loadCurrencies();
    paymentMethods_1.loadPaymentMethods();
    countries_1.loadCountries();
    cities_1.loadCities();
    languages_1.loadLanguages();
    email_contents_1.loadEmailContents();
    parameters_1.loadParameters();
    cc_payment_methods_1.loadCcPaymentMethods();
    invoices_info_1.loadInvoicesInfo();
    point_1.loadPoints();
    cooking_time_1.loadCookingTimes();
    point_validity_1.loadPointsValidity();
    type_of_food_1.loadTypesOfFood();
    cron_1.createCrons();
    bag_plans_1.loadBagPlans();
    indexdb_1.createdbindexes();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".ts",
    ".scss"
  ]
});
require("/both/methods/establishment/QR/codeGenerator.js");
require("/both/methods/establishment/waiter-queue/queues.methods.js");
require("/both/methods/establishment/waiter-queue/waiter-queue.methods.js");
require("/both/collections/auth/device.collection.js");
require("/both/collections/auth/menu.collection.js");
require("/both/collections/auth/role.collection.js");
require("/both/collections/auth/user-detail.collection.js");
require("/both/collections/auth/user-login.collection.js");
require("/both/collections/auth/user-penalty.collection.js");
require("/both/collections/auth/user.collection.js");
require("/both/collections/establishment/establishment.collection.js");
require("/both/collections/establishment/order-history.collection.js");
require("/both/collections/establishment/order.collection.js");
require("/both/collections/establishment/reward-point.collection.js");
require("/both/collections/establishment/reward.collection.js");
require("/both/collections/establishment/table.collection.js");
require("/both/collections/establishment/waiter-call-detail.collection.js");
require("/both/collections/general/city.collection.js");
require("/both/collections/general/cooking-time.collection.js");
require("/both/collections/general/country.collection.js");
require("/both/collections/general/currency.collection.js");
require("/both/collections/general/email-content.collection.js");
require("/both/collections/general/hours.collection.js");
require("/both/collections/general/language.collection.js");
require("/both/collections/general/parameter.collection.js");
require("/both/collections/general/paymentMethod.collection.js");
require("/both/collections/general/point-validity.collection.js");
require("/both/collections/general/point.collection.js");
require("/both/collections/general/queue.collection.js");
require("/both/collections/general/type-of-food.collection.js");
require("/both/collections/menu/addition.collection.js");
require("/both/collections/menu/category.collection.js");
require("/both/collections/menu/garnish-food.collection.js");
require("/both/collections/menu/item.collection.js");
require("/both/collections/menu/option-value.collection.js");
require("/both/collections/menu/option.collection.js");
require("/both/collections/menu/section.collection.js");
require("/both/collections/menu/subcategory.collection.js");
require("/both/collections/payment/cc-payment-methods.collection.js");
require("/both/collections/payment/invoices-info.collection.js");
require("/both/collections/payment/iurest-invoices.collection.js");
require("/both/collections/payment/payment-history.collection.js");
require("/both/collections/payment/payment-transaction.collection.js");
require("/both/collections/points/bag-plans-history.collection.js");
require("/both/collections/points/bag-plans.collection.js");
require("/both/collections/points/establishment-points.collection.js");
require("/both/collections/points/negative-points.collection.js");
require("/both/methods/auth/collaborators.methods.js");
require("/both/methods/auth/menu.methods.js");
require("/both/methods/auth/user-detail.methods.js");
require("/both/methods/auth/user-devices.methods.js");
require("/both/methods/auth/user-login.methods.js");
require("/both/methods/auth/user.methods.js");
require("/both/methods/establishment/establishment.methods.js");
require("/both/methods/establishment/order-history.methods.js");
require("/both/methods/establishment/order.methods.js");
require("/both/methods/establishment/schedule.methods.js");
require("/both/methods/establishment/table.method.js");
require("/both/methods/general/change-email.methods.js");
require("/both/methods/general/country.methods.js");
require("/both/methods/general/cron.methods.js");
require("/both/methods/general/email.methods.js");
require("/both/methods/general/iurest-invoice.methods.js");
require("/both/methods/general/parameter.methods.js");
require("/both/methods/general/push-notifications.methods.js");
require("/both/methods/menu/item.methods.js");
require("/both/models/auth/device.model.js");
require("/both/models/auth/menu.model.js");
require("/both/models/auth/role.model.js");
require("/both/models/auth/user-detail.model.js");
require("/both/models/auth/user-login.model.js");
require("/both/models/auth/user-penalty.model.js");
require("/both/models/auth/user-profile.model.js");
require("/both/models/auth/user.model.js");
require("/both/models/establishment/establishment.model.js");
require("/both/models/establishment/node.js");
require("/both/models/establishment/order-history.model.js");
require("/both/models/establishment/order.model.js");
require("/both/models/establishment/reward-point.model.js");
require("/both/models/establishment/reward.model.js");
require("/both/models/establishment/table.model.js");
require("/both/models/establishment/waiter-call-detail.model.js");
require("/both/models/general/city.model.js");
require("/both/models/general/cooking-time.model.js");
require("/both/models/general/country.model.js");
require("/both/models/general/currency.model.js");
require("/both/models/general/email-content.model.js");
require("/both/models/general/hour.model.js");
require("/both/models/general/language.model.js");
require("/both/models/general/menu.model.js");
require("/both/models/general/parameter.model.js");
require("/both/models/general/paymentMethod.model.js");
require("/both/models/general/pick-options.model.js");
require("/both/models/general/point-validity.model.js");
require("/both/models/general/point.model.js");
require("/both/models/general/queue.model.js");
require("/both/models/general/type-of-food.model.js");
require("/both/models/menu/addition.model.js");
require("/both/models/menu/category.model.js");
require("/both/models/menu/garnish-food.model.js");
require("/both/models/menu/item.model.js");
require("/both/models/menu/option-value.model.js");
require("/both/models/menu/option.model.js");
require("/both/models/menu/section.model.js");
require("/both/models/menu/subcategory.model.js");
require("/both/models/payment/cc-payment-method.model.js");
require("/both/models/payment/cc-request-colombia.model.js");
require("/both/models/payment/invoice-info.model.js");
require("/both/models/payment/iurest-invoice.model.js");
require("/both/models/payment/payment-history.model.js");
require("/both/models/payment/payment-transaction.model.js");
require("/both/models/payment/response-query.model.js");
require("/both/models/points/bag-plan-history.model.js");
require("/both/models/points/bag-plan.model.js");
require("/both/models/points/establishment-point.model.js");
require("/both/models/points/negative-point.model.js");
require("/both/shared-components/validators/custom-validator.js");
require("/both/models/collection-object.model.js");
require("/server/cron-config.js");
require("/server/cron.js");
require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js