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
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
const user_penalty_collection_1 = require("/both/collections/auth/user-penalty.collection");
const establishment_qr_collection_1 = require("/both/collections/establishment/establishment-qr.collection");
const establishment_medal_collection_1 = require("/both/collections/points/establishment-medal.collection");
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
 * This function create random code with 14 length to establishment QR
 */
function createCodeToEstablishmentQR() {
    let _lText = '';
    let _lPossible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let _i = 0; _i < 14; _i++) {
        _lText += _lPossible.charAt(Math.floor(Math.random() * _lPossible.length));
    }
    return _lText;
}
exports.createCodeToEstablishmentQR = createCodeToEstablishmentQR;
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
         * Meteor method to validate establishment QR code
         * @param {string} _qrcode
         */
        verifyEstablishmentQRCode: function (_qrCode) {
            let _lEstablishmentQR = establishment_qr_collection_1.EstablishmentQRs.findOne({ QR_code: _qrCode });
            if (typeof _lEstablishmentQR !== undefined || _lEstablishmentQR !== null) {
                return _lEstablishmentQR;
            }
            else {
                return null;
            }
        },
        /**
         * This Meteor Method return establishment object with QR Code condition
         * @param {string} _qrCode
         * @param {string} _userId
         */
        getEstablishmentByQRCode: function (_qrCode, _userId) {
            let _establishment;
            let _lEstablishmentQR = establishment_qr_collection_1.EstablishmentQRs.findOne({ QR_code: _qrCode });
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
            if (_lEstablishmentQR) {
                _establishment = establishment_collection_1.Establishments.collection.findOne({ _id: _lEstablishmentQR.establishment_id });
                if (_establishment) {
                    if (_establishment.isActive) {
                        let _lEstablishmentMedal = establishment_medal_collection_1.EstablishmentMedals.findOne({ user_id: _userId, establishment_id: _establishment._id });
                        if (_lEstablishmentMedal) {
                            let _lNewQuantity = _lEstablishmentMedal.medals + 1;
                            establishment_medal_collection_1.EstablishmentMedals.update({ _id: _lEstablishmentMedal._id }, {
                                $set: {
                                    modification_date: new Date(),
                                    modification_user: _userId,
                                    medals: _lNewQuantity
                                }
                            });
                        }
                        else {
                            establishment_medal_collection_1.EstablishmentMedals.insert({
                                creation_user: _userId,
                                creation_date: new Date(),
                                user_id: _userId,
                                establishment_id: _establishment._id,
                                medals: 1,
                                is_active: true
                            });
                        }
                        if (_lUserDetail.grant_start_points !== undefined && _lUserDetail.grant_start_points) {
                            let _lExpireDate = new Date();
                            let _lUserStartPoints = parameter_collection_1.Parameters.findOne({ name: 'user_start_points' });
                            let _lCurrentEstablishmentMedal = establishment_medal_collection_1.EstablishmentMedals.findOne({ user_id: _userId, establishment_id: _establishment._id });
                            let _lNewQuantity = _lCurrentEstablishmentMedal.medals + Number.parseInt(_lUserStartPoints.value.toString());
                            establishment_medal_collection_1.EstablishmentMedals.update({ _id: _lCurrentEstablishmentMedal._id }, {
                                $set: {
                                    modification_date: new Date(),
                                    modification_user: _userId,
                                    medals: _lNewQuantity
                                }
                            });
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
         * This method allow restaurant give medal to specific user
         */
        giveMedalToUser: function (_establishmentId, _userId) {
            let _establishment;
            let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
            _establishment = establishment_collection_1.Establishments.collection.findOne({ _id: _establishmentId });
            if (_establishment) {
                if (_establishment.isActive) {
                    let _lEstablishmentMedal = establishment_medal_collection_1.EstablishmentMedals.findOne({ user_id: _userId, establishment_id: _establishment._id });
                    if (_lEstablishmentMedal) {
                        let _lNewQuantity = _lEstablishmentMedal.medals + 1;
                        establishment_medal_collection_1.EstablishmentMedals.update({ _id: _lEstablishmentMedal._id }, {
                            $set: {
                                modification_date: new Date(),
                                modification_user: _userId,
                                medals: _lNewQuantity
                            }
                        });
                    }
                    else {
                        establishment_medal_collection_1.EstablishmentMedals.insert({
                            creation_user: _userId,
                            creation_date: new Date(),
                            user_id: _userId,
                            establishment_id: _establishment._id,
                            medals: 1,
                            is_active: true
                        });
                    }
                }
                else {
                    throw new meteor_1.Meteor.Error('160');
                }
            }
            else {
                throw new meteor_1.Meteor.Error('150');
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
const user_collection_1 = require("/both/collections/auth/user.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const user_penalty_collection_1 = require("/both/collections/auth/user-penalty.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        penalizeCustomer: function (_pCustomerUser) {
            let _lUserDetail = user_detail_collection_1.UserDetails.findOne({ user_id: _pCustomerUser._id });
            let _lUserDetailPenalty = { date: new Date() };
            user_detail_collection_1.UserDetails.update({ _id: _lUserDetail._id }, { $push: { penalties: _lUserDetailPenalty } });
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
        },
        findUsers(_pUserFilter) {
            let _lUsersId = new Array();
            let _lUserFilter = user_collection_1.Users.collection.find({
                $or: [{ "username": { $regex: _pUserFilter } },
                    { "emails.address": { $regex: _pUserFilter } },
                    { "profile.name": { $regex: _pUserFilter } }
                ]
            });
            if (_lUserFilter.count() > 0) {
                _lUserFilter.forEach((user) => {
                    _lUsersId.push(user._id);
                });
            }
            return _lUsersId;
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

},"cyg-invoice.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/general/cyg-invoice.methods.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const payment_history_collection_1 = require("/both/collections/payment/payment-history.collection");
const user_detail_collection_1 = require("/both/collections/auth/user-detail.collection");
const country_collection_1 = require("/both/collections/general/country.collection");
const invoices_info_collection_1 = require("/both/collections/payment/invoices-info.collection");
const cyg_invoices_collection_1 = require("/both/collections/payment/cyg-invoices.collection");
const parameter_collection_1 = require("/both/collections/general/parameter.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const bag_plans_collection_1 = require("/both/collections/points/bag-plans.collection");
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
            let establishmentsInfoArray = [];
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
            let client_info = {
                name: meteor_1.Meteor.user().profile.full_name,
                address: lUserDetail.address,
                country: lCountry.name,
                city: lUserDetail.city_id,
                identification: lUserDetail.dni_number,
                phone: lUserDetail.contact_phone,
                email: meteor_1.Meteor.user().emails[0].address
            };
            lPaymentHistory.establishment_ids.forEach((establishmentElement) => {
                let establishmentInfo = {
                    establishment_name: establishment_collection_1.Establishments.findOne({ _id: establishmentElement.establishmentId }).name,
                    bag_plan_name: bag_plans_collection_1.BagPlans.findOne({ _id: establishmentElement.bagPlanId }).name,
                    bag_plan_currency: establishmentElement.bagPlanCurrency,
                    bag_plan_points: establishmentElement.bagPlanPoints.toString(),
                    bag_plan_price: establishmentElement.bagPlanPrice.toString(),
                    credit_points: establishmentElement.creditPoints.toString(),
                    credit_price: establishmentElement.creditPrice.toString()
                };
                establishmentsInfoArray.push(establishmentInfo);
            });
            cyg_invoices_collection_1.CygInvoices.collection.insert({
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
                generated_computer_msg: invoice_generated_msg,
                establishmentsInfo: establishmentsInfoArray
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

}},"reward":{"reward.methods.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/methods/reward/reward.methods.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const reward_history_collection_1 = require("/both/collections/points/reward-history.collection");
const establishment_collection_1 = require("/both/collections/establishment/establishment.collection");
const item_collection_1 = require("/both/collections/menu/item.collection");
const reward_collection_1 = require("/both/collections/establishment/reward.collection");
const establishment_medal_collection_1 = require("/both/collections/points/establishment-medal.collection");
const reward_confirmation_collection_1 = require("/both/collections/points/reward-confirmation.collection");
const establishment_points_collection_1 = require("/both/collections/points/establishment-points.collection");
const negative_points_collection_1 = require("/both/collections/points/negative-points.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This functon allow generate reward history
         * @param {RewardConfirmation} _pRewardConfirmation
         */
        generateRewardHistory: function (_pRewardConfirmation) {
            let _lEstablishment = establishment_collection_1.Establishments.findOne({ _id: _pRewardConfirmation.establishment_id });
            let _lReward = reward_collection_1.Rewards.findOne({ _id: _pRewardConfirmation.reward_id });
            let _lItem = item_collection_1.Items.findOne({ _id: _lReward.item_id });
            reward_history_collection_1.RewardHistories.insert({
                creation_user: _pRewardConfirmation.user_id,
                creation_date: new Date(),
                establishment_id: _lEstablishment._id,
                establishment_name: _lEstablishment.name,
                establishment_address: _lEstablishment.address,
                item_name: _lItem.name,
                item_quantity: _lReward.item_quantity,
                redeemed_medals: _pRewardConfirmation.medals_to_redeem
            });
        },
        /**
         * Function to redeem user medals
         * @param {RewardConfirmation} _pRewardConfirmation
         */
        redeemUserMedals: function (_pRewardConfirmation) {
            let _establishmentPoints = establishment_points_collection_1.EstablishmentPoints.findOne({ establishment_id: _pRewardConfirmation.establishment_id });
            let _pointsResult = Number.parseInt(_establishmentPoints.current_points.toString()) - Number.parseInt(_pRewardConfirmation.medals_to_redeem.toString());
            let _lEstablishmentMedal = establishment_medal_collection_1.EstablishmentMedals.findOne({ user_id: _pRewardConfirmation.user_id, establishment_id: _pRewardConfirmation.establishment_id });
            if (_pointsResult >= 0) {
                establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _pointsResult } });
            }
            else {
                let _negativePoints;
                if (_establishmentPoints.current_points > 0) {
                    _negativePoints = Number.parseInt(_pRewardConfirmation.medals_to_redeem.toString()) - Number.parseInt(_establishmentPoints.current_points.toString());
                    if (_negativePoints < 0) {
                        _negativePoints = (_negativePoints * (-1));
                    }
                }
                else {
                    _negativePoints = Number.parseInt(_pRewardConfirmation.medals_to_redeem.toString());
                }
                negative_points_collection_1.NegativePoints.insert({
                    establishment_id: _pRewardConfirmation.establishment_id,
                    user_id: _pRewardConfirmation.user_id,
                    points: _negativePoints,
                    paid: false
                });
                establishment_points_collection_1.EstablishmentPoints.update({ _id: _establishmentPoints._id }, { $set: { current_points: _pointsResult, negative_balance: true } });
            }
            let _lNewMedals = Number.parseInt(_lEstablishmentMedal.medals.toString()) - Number.parseInt(_pRewardConfirmation.medals_to_redeem.toString());
            establishment_medal_collection_1.EstablishmentMedals.update({ _id: _lEstablishmentMedal._id }, {
                $set: {
                    modification_user: _lEstablishmentMedal.user_id,
                    modification_date: new Date(),
                    medals: _lNewMedals
                }
            });
            meteor_1.Meteor.call('generateRewardHistory', _pRewardConfirmation);
            reward_confirmation_collection_1.RewardsConfirmations.update({ _id: _pRewardConfirmation._id }, {
                $set: {
                    modification_user: _lEstablishmentMedal.user_id,
                    modification_date: new Date(),
                    is_confirmed: true
                }
            });
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

}},"establishment":{"establishment-qr.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/establishment/establishment-qr.collection.js                                                       //
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
 * EstablishmentQRs Collection
 */
exports.EstablishmentQRs = new meteor_rxjs_1.MongoObservable.Collection('establishment_qrs');
/**
 * Allow EstablishmentQRs collection insert and update functions
 */
exports.EstablishmentQRs.allow({
    insert: loggedIn,
    update: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"establishment.collection.js":function(require,exports){

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

}},"general":{"country.collection.js":function(require,exports){

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

},"cyg-invoices.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/payment/cyg-invoices.collection.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_rxjs_1 = require("meteor-rxjs");
const meteor_1 = require("meteor/meteor");
exports.CygInvoices = new meteor_rxjs_1.MongoObservable.Collection('cyg_invoices');
/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!meteor_1.Meteor.user();
}
/**
 * Allow HistoryPaymentCollection collecion insert and update functions
 */
exports.CygInvoices.allow({
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

},"establishment-medal.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/points/establishment-medal.collection.js                                                           //
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
 * EstablishmentMedals Collection
 */
exports.EstablishmentMedals = new meteor_rxjs_1.MongoObservable.Collection('establishment_medals');
/**
 * Allow EstablishmentMedals collection insert and update functions
 */
exports.EstablishmentMedals.allow({
    insert: loggedIn,
    update: loggedIn
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
/**
 * Allow EstablishmentPoints collection insert, update and remove functions
 */
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

},"reward-confirmation.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/points/reward-confirmation.collection.js                                                           //
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
 * RewardsConfirmations Collection
 */
exports.RewardsConfirmations = new meteor_rxjs_1.MongoObservable.Collection('rewards_confirmations');
/**
 * Allow RewardsConfirmations collection insert and update functions
 */
exports.RewardsConfirmations.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward-history.collection.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/collections/points/reward-history.collection.js                                                                //
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
 * RewardHistories Collection
 */
exports.RewardHistories = new meteor_rxjs_1.MongoObservable.Collection('rewards_histories');
/**
 * Allow RewardHistories collection insert and update functions
 */
exports.RewardHistories.allow({
    insert: loggedIn,
    update: loggedIn
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

}},"establishment":{"establishment-qr.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/establishment/establishment-qr.model.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"establishment.model.js":function(require,exports){

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

}},"general":{"country.model.js":function(require,exports){

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cyg-invoice.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/payment/cyg-invoice.model.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

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

},"establishment-medal.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/points/establishment-medal.model.js                                                                     //
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

},"reward-confirmation.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/points/reward-confirmation.model.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward-history.model.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// both/models/points/reward-history.model.js                                                                          //
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
                _id: "15000",
                is_active: true,
                name: "MENUS.APPROVE_REWARDS",
                url: "/app/approve-rewards",
                icon_name: "assignment",
                order: 15000
            },
            {
                _id: "16000",
                is_active: true,
                name: "MENUS.GIVE_MEDAL",
                url: "/app/give-medals",
                icon_name: "card_giftcard",
                order: 16000
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
                            } /*, {
                                _id: "10013",
                                is_active: true,
                                name: "MENUS.ADMINISTRATION.MONTHLY_CONFIG",
                                url: "/app/establishment-list",
                                icon_name: "",
                                order: 10013
                            }*/
                        ]
                    } /*, {
                        _id: "1002",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.TABLES",
                        url: "",
                        icon_name: "",
                        order: 1002,
                        children:
                            [
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
                    }*/,
                    {
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
                name: "MENUS.APPROVE_REWARDS",
                url: "/app/supervisor-approve-rewards",
                icon_name: "assignment",
                order: 1100
            },
            {
                _id: "1200",
                is_active: true,
                name: "MENUS.GIVE_MEDAL",
                url: "/app/supervisor-give-medals",
                icon_name: "card_giftcard",
                order: 1200
            },
            /*{
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
            },*/
            {
                _id: "2000",
                is_active: true,
                name: "MENUS.PAYMENTS.BAGS",
                url: "",
                icon_name: "payment",
                order: 2000,
                children: [
                    {
                        _id: "2001",
                        is_active: true,
                        name: "MENUS.PAYMENTS.PURCHASE_BAGS",
                        url: "/app/bags-payment",
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
                    }
                ]
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
                    }
                ]
            },
            /*{
                _id: "3100",
                is_active: true,
                name: "MENUS.MENU_DEFINITION.ITEMS_ENABLE",
                url: "/app/items-enable-sup",
                icon_name: "done all",
                order: 3100
            },*/
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
                menus: ["900", "1000", "2000", "3000", "10000", "15000", "16000", "20000"]
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
                menus: ["910", "1100", "1200", "20000"],
                user_prefix: 'sp'
            }];
        roles.forEach((role) => role_collection_1.Roles.insert(role));
    }
}
exports.loadRoles = loadRoles;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"general":{"countries.js":function(require,exports){

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
            { _id: '100', is_active: false, name: 'COUNTRIES.ALBANIA', alfaCode2: 'AL', alfaCode3: 'ALB', numericCode: '008', indicative: '(+ 355)', currencyId: '270', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '200', is_active: false, name: 'COUNTRIES.GERMANY', alfaCode2: 'DE', alfaCode3: 'DEU', numericCode: '276', indicative: '(+ 49)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '300', is_active: false, name: 'COUNTRIES.ANDORRA', alfaCode2: 'AD', alfaCode3: 'AND', numericCode: '020', indicative: '(+ 376)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '400', is_active: false, name: 'COUNTRIES.ARGENTINA', alfaCode2: 'AR', alfaCode3: 'ARG', numericCode: '032', indicative: '(+ 54)', currencyId: '370', itemsWithDifferentTax: false, establishment_price: 117, tablePrice: 3, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '' },
            { _id: '500', is_active: false, name: 'COUNTRIES.ARMENIA', alfaCode2: 'AM', alfaCode3: 'ARM', numericCode: '051', indicative: '(+ 374)', currencyId: '190', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '600', is_active: false, name: 'COUNTRIES.AUSTRIA', alfaCode2: 'AT', alfaCode3: 'AUT', numericCode: '040', indicative: '(+ 43)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '700', is_active: false, name: 'COUNTRIES.AZERBAIJAN', alfaCode2: 'AZ', alfaCode3: 'AZE', numericCode: '031', indicative: '(+ 994)', currencyId: '350', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '800', is_active: false, name: 'COUNTRIES.BELGIUM', alfaCode2: 'BE', alfaCode3: 'BEL', numericCode: '056', indicative: '(+ 32)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '900', is_active: false, name: 'COUNTRIES.BELIZE', alfaCode2: 'BZ', alfaCode3: 'BLZ', numericCode: '084', indicative: '(+ 501)', currencyId: '130', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1000', is_active: false, name: 'COUNTRIES.BERMUDAS', alfaCode2: 'BM', alfaCode3: 'BMU', numericCode: '060', indicative: '(+ 1004)', currencyId: '140', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1100', is_active: false, name: 'COUNTRIES.BELARUS', alfaCode2: 'BY', alfaCode3: 'BLR', numericCode: '112', indicative: '(+ 375)', currencyId: '440', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1200', is_active: false, name: 'COUNTRIES.BOLIVIA', alfaCode2: 'BO', alfaCode3: 'BOL', numericCode: '068', indicative: '(+ 591)', currencyId: '30', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1300', is_active: false, name: 'COUNTRIES.BOSNIA_HERZEGOVINA', alfaCode2: 'BA', alfaCode3: 'BIH', numericCode: '070', indicative: '(+ 387)', currencyId: '360', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1400', is_active: false, name: 'COUNTRIES.BRAZIL', alfaCode2: 'BR', alfaCode3: 'BRA', numericCode: '076', indicative: '(+ 55)', currencyId: '430', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1500', is_active: false, name: 'COUNTRIES.BULGARIA', alfaCode2: 'BG', alfaCode3: 'BGR', numericCode: '100', indicative: '(+ 359)', currencyId: '310', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1600', is_active: false, name: 'COUNTRIES.CANADA', alfaCode2: 'CA', alfaCode3: 'CAN', numericCode: '124', indicative: '(+ 001)', currencyId: '150', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1700', is_active: false, name: 'COUNTRIES.CHILE', alfaCode2: 'CL', alfaCode3: 'CHL', numericCode: '152', indicative: '(+ 56)', currencyId: '380', itemsWithDifferentTax: false, establishment_price: 4300, tablePrice: 106, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '' },
            { _id: '1800', is_active: false, name: 'COUNTRIES.CYPRUS', alfaCode2: 'CY', alfaCode3: 'CYP', numericCode: '196', indicative: '(+357)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '1900', is_active: true, name: 'COUNTRIES.COLOMBIA', alfaCode2: 'CO', alfaCode3: 'COL', numericCode: '170', indicative: '(+ 57)', currencyId: '390', itemsWithDifferentTax: false, establishment_price: 22000, tablePrice: 200, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '15 0 * * *' },
            { _id: '2000', is_active: false, name: 'COUNTRIES.COSTA_RICA', alfaCode2: 'CR', alfaCode3: 'CRI', numericCode: '188', indicative: '(+ 506)', currencyId: '40', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2100', is_active: false, name: 'COUNTRIES.CROATIA', alfaCode2: 'HR', alfaCode3: 'HRV', numericCode: '191', indicative: '(+ 385)', currencyId: '250', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2200', is_active: false, name: 'COUNTRIES.DENMARK', alfaCode2: 'DK', alfaCode3: 'DNK', numericCode: '208', indicative: '(+ 45)', currencyId: '70', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2300', is_active: false, name: 'COUNTRIES.ECUADOR', alfaCode2: 'EC', alfaCode3: 'ECU', numericCode: '218', indicative: '(+ 593)', currencyId: '160', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2400', is_active: false, name: 'COUNTRIES.EL_SALVADOR', alfaCode2: 'SV', alfaCode3: 'SLV', numericCode: '222', indicative: '(+ 503)', currencyId: '160', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2500', is_active: false, name: 'COUNTRIES.SLOVAKIA', alfaCode2: 'SK', alfaCode3: 'SVK', numericCode: '703', indicative: '(+ 421)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2600', is_active: false, name: 'COUNTRIES.SLOVENIA', alfaCode2: 'SI', alfaCode3: 'SVN', numericCode: '705', indicative: '(+ 386)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2700', is_active: false, name: 'COUNTRIES.SPAIN', alfaCode2: 'ES', alfaCode3: 'ESP', numericCode: '724', indicative: '(+ 34)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2800', is_active: false, name: 'COUNTRIES.UNITED_STATES', alfaCode2: 'US', alfaCode3: 'USA', numericCode: '840', indicative: '(+ 1)', currencyId: '160', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '2900', is_active: false, name: 'COUNTRIES.ESTONIA', alfaCode2: 'EE', alfaCode3: 'EST', numericCode: '233', indicative: '(+ 372)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3000', is_active: false, name: 'COUNTRIES.FINLAND', alfaCode2: 'FI', alfaCode3: 'FIN', numericCode: '246', indicative: '(+ 358)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3100', is_active: false, name: 'COUNTRIES.FRANCE', alfaCode2: 'FR', alfaCode3: 'FRA', numericCode: '250', indicative: '(+ 33)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3200', is_active: false, name: 'COUNTRIES.GEORGIA', alfaCode2: 'GE', alfaCode3: 'GEO', numericCode: '268', indicative: '(+ 995)', currencyId: '260', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3300', is_active: false, name: 'COUNTRIES.GREECE', alfaCode2: 'GR', alfaCode3: 'GRC', numericCode: '300', indicative: '(+ 30)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3400', is_active: false, name: 'COUNTRIES.GREENLAND', alfaCode2: 'GL', alfaCode3: 'GRL', numericCode: '304', indicative: '(+ 299)', currencyId: '70', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3500', is_active: false, name: 'COUNTRIES.GUATEMALA', alfaCode2: 'GT', alfaCode3: 'GTM', numericCode: '320', indicative: '(+ 502)', currencyId: '420', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3600', is_active: false, name: 'COUNTRIES.FRENCH_GUIANA', alfaCode2: 'GF', alfaCode3: 'GUF', numericCode: '254', indicative: '(+ 594)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3700', is_active: false, name: 'COUNTRIES.GUYANA', alfaCode2: 'GY', alfaCode3: 'GUY', numericCode: '328', indicative: '(+ 592)', currencyId: '170', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3800', is_active: false, name: 'COUNTRIES.HONDURAS', alfaCode2: 'HN', alfaCode3: 'HND', numericCode: '340', indicative: '(+ 504)', currencyId: '280', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '3900', is_active: false, name: 'COUNTRIES.HUNGARY', alfaCode2: 'HU', alfaCode3: 'HUN', numericCode: '348', indicative: '(+ 36)', currencyId: '210', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4000', is_active: false, name: 'COUNTRIES.IRELAND', alfaCode2: 'IE', alfaCode3: 'IRL', numericCode: '372', indicative: '(+ 353)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4100', is_active: false, name: 'COUNTRIES.ICELAND', alfaCode2: 'IS', alfaCode3: 'ISL', numericCode: '352', indicative: '(+ 354)', currencyId: '80', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4200', is_active: false, name: 'COUNTRIES.FALKLAND_ISLANDS', alfaCode2: 'FK', alfaCode3: 'FLK', numericCode: '238', indicative: '(+ 500)', currencyId: '330', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4300', is_active: false, name: 'COUNTRIES.ITALY', alfaCode2: 'IT', alfaCode3: 'ITA', numericCode: '380', indicative: '(+ 39)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4400', is_active: false, name: 'COUNTRIES.KAZAKHSTAN', alfaCode2: 'KZ', alfaCode3: 'KAZ', numericCode: '398', indicative: '(+ 731)', currencyId: '470', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4500', is_active: false, name: 'COUNTRIES.LATVIA', alfaCode2: 'LV', alfaCode3: 'LVA', numericCode: '428', indicative: '(+ 371)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4600', is_active: false, name: 'COUNTRIES.LIECHTENSTEIN', alfaCode2: 'LI', alfaCode3: 'LIE', numericCode: '438', indicative: '(+ 417)', currencyId: '220', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4700', is_active: false, name: 'COUNTRIES.LITHUANIA', alfaCode2: 'LT', alfaCode3: 'LTU', numericCode: '440', indicative: '(+ 370)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4800', is_active: false, name: 'COUNTRIES.LUXEMBOURG', alfaCode2: 'LU', alfaCode3: 'LUX', numericCode: '442', indicative: '(+ 352)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '4900', is_active: false, name: 'COUNTRIES.MACEDONIA', alfaCode2: 'MK', alfaCode3: 'MKD', numericCode: '807', indicative: '(+ 389)', currencyId: '110', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5000', is_active: false, name: 'COUNTRIES.MALTA', alfaCode2: 'MT', alfaCode3: 'MLT', numericCode: '470', indicative: '(+ 356)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5100', is_active: false, name: 'COUNTRIES.MEXICO', alfaCode2: 'MX', alfaCode3: 'MEX', numericCode: '484', indicative: '(+ 52)', currencyId: '400', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5200', is_active: false, name: 'COUNTRIES.MOLDAVIA', alfaCode2: 'MD', alfaCode3: 'MDA', numericCode: '498', indicative: '(+ 373)', currencyId: '290', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5300', is_active: false, name: 'COUNTRIES.MONACO', alfaCode2: 'MC', alfaCode3: 'MCO', numericCode: '492', indicative: '(+ 377)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5400', is_active: false, name: 'COUNTRIES.MONTENEGRO', alfaCode2: 'ME', alfaCode3: 'MNE', numericCode: '499', indicative: '(+ 382)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5500', is_active: false, name: 'COUNTRIES.NICARAGUA', alfaCode2: 'NI', alfaCode3: 'NIC', numericCode: '558', indicative: '(+ 505)', currencyId: '50', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5600', is_active: false, name: 'COUNTRIES.NORWAY', alfaCode2: 'NO', alfaCode3: 'NOR', numericCode: '578', indicative: '(+ 47)', currencyId: '90', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5700', is_active: false, name: 'COUNTRIES.NETHERLANDS', alfaCode2: 'NL', alfaCode3: 'NLD', numericCode: '528', indicative: '(+ 31)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5800', is_active: false, name: 'COUNTRIES.PANAMA', alfaCode2: 'PA', alfaCode3: 'PAN', numericCode: '591', indicative: '(+ 507)', currencyId: '10', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '5900', is_active: false, name: 'COUNTRIES.PARAGUAY', alfaCode2: 'PY', alfaCode3: 'PRY', numericCode: '600', indicative: '(+ 595)', currencyId: '240', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6000', is_active: false, name: 'COUNTRIES.PERU', alfaCode2: 'PE', alfaCode3: 'PER', numericCode: '604', indicative: '(+ 51)', currencyId: '460', itemsWithDifferentTax: false, establishment_price: 22, tablePrice: 0.6, cronValidateActive: '1 0 6 * *', cronChangeFreeDays: '0 0 1 * *', cronEmailChargeSoon: '30 17 28 * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailRestExpired: '10 0 6 * *', max_number_tables: 100, cronPointsExpire: '' },
            { _id: '6100', is_active: false, name: 'COUNTRIES.POLAND', alfaCode2: 'PL', alfaCode3: 'POL', numericCode: '616', indicative: '(+ 48)', currencyId: '480', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6200', is_active: false, name: 'COUNTRIES.PORTUGAL', alfaCode2: 'PT', alfaCode3: 'PRT', numericCode: '620', indicative: '(+ 351)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6300', is_active: false, name: 'COUNTRIES.UNITED_KINGDOM', alfaCode2: 'GB', alfaCode3: 'GBR', numericCode: '826', indicative: '(+ 44)', currencyId: '320', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6400', is_active: false, name: 'COUNTRIES.CZECH_REPUBLIC', alfaCode2: 'CZ', alfaCode3: 'CZE', numericCode: '203', indicative: '(+ 42)', currencyId: '60', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6500', is_active: false, name: 'COUNTRIES.ROMANIA', alfaCode2: 'RO', alfaCode3: 'ROU', numericCode: '642', indicative: '(+ 40)', currencyId: '300', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6600', is_active: false, name: 'COUNTRIES.RUSSIA', alfaCode2: 'RU', alfaCode3: 'RUS', numericCode: '643', indicative: '(+ 7)', currencyId: '450', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6700', is_active: false, name: 'COUNTRIES.SAN_MARINO', alfaCode2: 'SM', alfaCode3: 'SMR', numericCode: '674', indicative: '(+ 378)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6800', is_active: false, name: 'COUNTRIES.SAINT_PIERRE_MIQUELON', alfaCode2: 'PM', alfaCode3: 'SPM', numericCode: '666', indicative: '(+ 508)', currencyId: '200', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '6900', is_active: false, name: 'COUNTRIES.SERBIA', alfaCode2: 'RS', alfaCode3: 'SRB', numericCode: '688', indicative: '(+ 381)', currencyId: '120', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7000', is_active: false, name: 'COUNTRIES.SWEDEN', alfaCode2: 'SE', alfaCode3: 'SWE', numericCode: '752', indicative: '(+ 46)', currencyId: '100', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7100', is_active: false, name: 'COUNTRIES.SWITZERLAND', alfaCode2: 'CH', alfaCode3: 'CHE', numericCode: '756', indicative: '(+ 41)', currencyId: '220', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7200', is_active: false, name: 'COUNTRIES.SURINAM', alfaCode2: 'SR', alfaCode3: 'SUR', numericCode: '740', indicative: '(+ 597)', currencyId: '180', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7300', is_active: false, name: 'COUNTRIES.TURKEY', alfaCode2: 'TR', alfaCode3: 'TUR', numericCode: '792', indicative: '(+ 90)', currencyId: '340', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7400', is_active: false, name: 'COUNTRIES.UKRAINE', alfaCode2: 'UA', alfaCode3: 'UKR', numericCode: '804', indicative: '(+ 380)', currencyId: '230', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7500', is_active: false, name: 'COUNTRIES.URUGUAY', alfaCode2: 'UY', alfaCode3: 'URY', numericCode: '858', indicative: '(+ 598)', currencyId: '410', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' },
            { _id: '7600', is_active: false, name: 'COUNTRIES.VENEZUELA', alfaCode2: 'VE', alfaCode3: 'VEN', numericCode: '862', indicative: '(+ 58)', currencyId: '20', itemsWithDifferentTax: false, establishment_price: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailRestExpired: '', max_number_tables: 0, cronPointsExpire: '' }
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
            { _id: '600', name: 'payu_script_tag', value: 'https://maf.pagosonline.net/ws/fp/tags.js?id=', description: 'url for security script for payu form in <script> tag' },
            { _id: '700', name: 'payu_noscript_tag', value: 'https://maf.pagosonline.net/ws/fp/tags.js?id=', description: 'url for security script for payu form in <noscript> tag' },
            { _id: '800', name: 'payu_script_code', value: '80200', description: 'url ended code for security tag for payu form in <script> and <noscript> tag' },
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
            { _id: '9200', name: 'payu_reference_code', value: 'CYG_P_', description: 'Prefix for reference code on payu transactions' },
            { _id: '2100', name: 'max_user_penalties', value: '3', description: 'Max number of user penalties' },
            { _id: '2200', name: 'penalty_days', value: '30', description: 'User penalty days' },
            { _id: '8000', name: 'date_test_monthly_pay', value: 'March 5, 2018', description: 'Date test for monthly payment of comeygana service' },
            { _id: '10000', name: 'payu_payments_url_prod', value: 'https://api.payulatam.com/payments-api/4.0/service.cgi', description: 'url for connect prod payu payments API' },
            { _id: '20000', name: 'payu_reports_url_prod', value: 'https://api.payulatam.com/reports-api/4.0/service.cgi', description: 'url for connect prod payu reports API' },
            { _id: '8500', name: 'date_test_reactivate', value: 'January 6, 2018', description: 'Date test for reactivate restaurant for pay' },
            { _id: '30000', name: 'terms_url', value: 'http://www.tsti4t-1935943095.com/signin/', description: 'url to see terms and conditions' },
            { _id: '40000', name: 'policy_url', value: 'http://www.tsti4t-1935943095.com/signup/', description: 'url to see privacy policy' },
            { _id: '50000', name: 'QR_code_url', value: 'http://www.tsti4t-1935943095.com/qr?', description: 'This url redirect to page the comeygana/download when scanned QR code from other application' },
            { _id: '2300', name: 'user_start_points', value: '1', description: 'User start points' },
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
            { _id: "1", point: 1 },
            { _id: "2", point: 2 },
            { _id: "3", point: 3 },
            { _id: "4", point: 4 },
            { _id: "5", point: 5 },
            { _id: "6", point: 6 },
            { _id: "7", point: 7 },
            { _id: "8", point: 8 },
            { _id: "9", point: 9 },
            { _id: "10", point: 10 }
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
                price: [{
                        country_id: "1900",
                        price: 0,
                        currency: 'COP'
                    }],
                value_points: 350,
                active: true,
            },
            {
                _id: '200',
                name: 'small',
                label: 'BAG_PLAN.SMALL',
                price: [{
                        country_id: "1900",
                        price: 28900,
                        currency: 'COP'
                    }],
                value_points: 300,
                active: true,
            },
            {
                _id: '300',
                name: 'medium',
                label: 'BAG_PLAN.MEDIUM',
                price: [{
                        country_id: "1900",
                        price: 34900,
                        currency: 'COP'
                    }],
                value_points: 500,
                active: true,
            },
            {
                _id: '400',
                name: 'large',
                label: 'BAG_PLAN.LARGE',
                price: [{
                        country_id: "1900",
                        price: 38900,
                        currency: 'COP'
                    }],
                value_points: 700,
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
const language_collection_1 = require("../../../both/collections/general/language.collection");
const email_content_collection_1 = require("../../../both/collections/general/email-content.collection");
const parameter_collection_1 = require("../../../both/collections/general/parameter.collection");
const cc_payment_methods_collection_1 = require("../../../both/collections/payment/cc-payment-methods.collection");
const point_collection_1 = require("../../../both/collections/general/point.collection");
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
    return role_collection_1.Roles.find({ _id: { $in: ["600"] } });
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

}},"establishment":{"establishment-qr.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/establishment/establishment-qr.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const establishment_qr_collection_1 = require("../../../../both/collections/establishment/establishment-qr.collection");
/**
 * Meteor publication getEstablishmentQRsByAdmin with creation user condition
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getEstablishmentQRsByAdmin', function (_userId) {
    check_1.check(_userId, String);
    return establishment_qr_collection_1.EstablishmentQRs.find({ creation_user: _userId });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"establishment.js":function(require,exports){

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
const user_detail_collection_1 = require("../../../../both/collections/auth/user-detail.collection");
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
 * Meteor publications getRewardsByEstablishmentWork
 * @param {string} _userId
 */
meteor_1.Meteor.publish('getRewardsByEstablishmentWork', function (_userId) {
    check_1.check(_userId, String);
    var user_detail = user_detail_collection_1.UserDetails.findOne({ user_id: _userId });
    if (user_detail) {
        return reward_collection_1.Rewards.find({ establishments: { $in: [user_detail.establishment_work] } });
    }
    else {
        return;
    }
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

}},"general":{"countries.js":function(require,exports){

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
meteor_1.Meteor.publish('getCurrenciesByUserId', function (_userId) {
    let _currenciesIds = [];
    establishment_collection_1.Establishments.collection.find({ creation_user: _userId }).forEach(function (establishment, index, args) {
        _currenciesIds.push(establishment.currencyId);
    });
    return currency_collection_1.Currencies.find({ _id: { $in: _currenciesIds } });
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
/**
 * Meteor publication paymentMethods
 */
meteor_1.Meteor.publish('paymentMethods', () => paymentMethod_collection_1.PaymentMethods.find({ isActive: true }));
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

},"cyg-invoices.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/payment/cyg-invoices.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const cyg_invoices_collection_1 = require("../../../../both/collections/payment/cyg-invoices.collection");
/**
 * Meteor publication InvoicesInfo
 */
meteor_1.Meteor.publish('getAllCygInvoices', function () {
    return cyg_invoices_collection_1.CygInvoices.find({});
});
meteor_1.Meteor.publish('getCygInvoiceByUser', function (_userId) {
    check(_userId, String);
    return cyg_invoices_collection_1.CygInvoices.find({ creation_user: _userId });
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
    return payment_history_collection_1.PaymentsHistory.find({ creation_user: _userId }, { sort: { creation_date: -1 } });
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
/**
 * Meteor publication bag plans
 * @param {string} _userId
 */
Meteor.publish('getBagPlansNoFree', function () {
    let _lBagsPlans = bag_plans_collection_1.BagPlans.find({ name: { $nin: ['free'] } });
    return _lBagsPlans;
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"establishment-medals.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/points/establishment-medals.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const establishment_medal_collection_1 = require("../../../../both/collections/points/establishment-medal.collection");
/**
 * Meteor publication establishment medals by user id
 * @param {string} _pUserId
 */
meteor_1.Meteor.publish('getEstablishmentMedalsByUserId', function (_pUserId) {
    check_1.check(_pUserId, String);
    return establishment_medal_collection_1.EstablishmentMedals.find({ user_id: _pUserId });
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
/**
 * Meteor publication establishment points by user
 * @param {string} user_id
 */
meteor_1.Meteor.publish('getEstablishmentPointsByUser', function (_userId) {
    return establishment_points_collection_1.EstablishmentPoints.find({ creation_user: _userId });
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
/**
 * Meteor publication negative poitns by establishments array
 */
meteor_1.Meteor.publish('getNegativePointsByEstablishmentsArray', function (_establishmentArray) {
    return negative_points_collection_1.NegativePoints.find({ "establishment_id": { $in: _establishmentArray } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward-confirmation.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/points/reward-confirmation.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const reward_confirmation_collection_1 = require("../../../../both/collections/points/reward-confirmation.collection");
/**
 * Meteor publication rewards confirmation by establishment id
 * @param {string} _pEstablishmentId
 */
meteor_1.Meteor.publish('getRewardsConfirmationsByEstablishmentId', function (_pEstablishmentId) {
    check_1.check(_pEstablishmentId, String);
    return reward_confirmation_collection_1.RewardsConfirmations.find({ establishment_id: _pEstablishmentId });
});
/**
 * Meteor publication rewards confirmation by establishments ids
 */
meteor_1.Meteor.publish('getRewardsConfirmationsByEstablishmentsIds', function (_pEstablishmentsIds) {
    return reward_confirmation_collection_1.RewardsConfirmations.find({ establishment_id: { $in: _pEstablishmentsIds } });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reward-history.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/imports/publications/points/reward-history.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteor_1 = require("meteor/meteor");
const check_1 = require("meteor/check");
const reward_history_collection_1 = require("../../../../both/collections/points/reward-history.collection");
/**
 * Meteor publication rewards histories by establishment id
 * @param {string} _pEstablishmentId
 */
meteor_1.Meteor.publish('getRewardHistoriesByEstablishmentId', function (_pEstablishmentId) {
    check_1.check(_pEstablishmentId, String);
    return reward_history_collection_1.RewardHistories.find({ establishment_id: _pEstablishmentId });
});
/**
 * Meteor publication rewards histories by user id
 */
meteor_1.Meteor.publish('getRewardHistoriesByUserId', function (_pUserId) {
    check_1.check(_pUserId, String);
    return reward_history_collection_1.RewardHistories.find({ creation_user: _pUserId });
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
require("/server/imports/publications/menu/sections");
require("/server/imports/publications/menu/categories");
require("/server/imports/publications/menu/subcategories");
require("/server/imports/publications/menu/additions");
require("/server/imports/publications/menu/item");
require("/server/imports/publications/menu/options");
require("/server/imports/publications/menu/option-values");
require("/server/imports/publications/auth/users");
require("/server/imports/publications/auth/roles");
require("/server/imports/publications/auth/menus");
require("/server/imports/publications/auth/collaborators");
require("/server/imports/publications/auth/user-details");
require("/server/imports/publications/general/hour");
require("/server/imports/publications/general/currency");
require("/server/imports/publications/general/paymentMethod");
require("/server/imports/publications/general/email-content");
require("/server/imports/publications/general/parameter");
require("/server/imports/publications/general/countries");
require("/server/imports/publications/general/languages");
require("/server/imports/publications/general/point");
require("/server/imports/publications/general/type-of-food");
require("/server/imports/publications/payment/payment-history");
require("/server/imports/publications/payment/cc-payment-method");
require("/server/imports/publications/payment/payment-transaction");
require("/server/imports/publications/payment/invoice-info");
require("/server/imports/publications/payment/cyg-invoices");
require("/server/imports/publications/establishment/establishment");
require("/server/imports/publications/establishment/establishment-qr");
require("/server/imports/publications/establishment/table");
require("/server/imports/publications/establishment/waiter-call");
require("/server/imports/publications/establishment/reward");
require("/server/imports/publications/establishment/reward-point");
require("/server/imports/publications/points/bag_plans");
require("/server/imports/publications/points/establishment_points");
require("/server/imports/publications/points/negative-point");
require("/server/imports/publications/points/establishment-medals");
require("/server/imports/publications/points/reward-confirmation");
require("/server/imports/publications/points/reward-history");
require("../both/methods/menu/item.methods");
require("../both/methods/auth/collaborators.methods");
require("../both/methods/auth/menu.methods");
require("../both/methods/auth/user-detail.methods");
require("../both/methods/auth/user-devices.methods");
require("../both/methods/auth/user-login.methods");
require("../both/methods/auth/user.methods");
require("../both/methods/general/cron.methods");
require("../both/methods/general/email.methods");
require("../both/methods/general/change-email.methods");
require("../both/methods/general/country.methods");
require("../both/methods/general/cyg-invoice.methods");
require("../both/methods/general/push-notifications.methods");
require("../both/methods/establishment/establishment.methods");
require("../both/methods/reward/reward.methods");
require("/server/imports/fixtures/auth/account-creation");
require("/server/imports/fixtures/auth/email-config");
const remove_fixtures_1 = require("/server/imports/fixtures/remove-fixtures");
const roles_1 = require("/server/imports/fixtures/auth/roles");
const menus_1 = require("/server/imports/fixtures/auth/menus");
const hours_1 = require("/server/imports/fixtures/general/hours");
const currencies_1 = require("/server/imports/fixtures/general/currencies");
const paymentMethods_1 = require("/server/imports/fixtures/general/paymentMethods");
const countries_1 = require("/server/imports/fixtures/general/countries");
const languages_1 = require("/server/imports/fixtures/general/languages");
const email_contents_1 = require("/server/imports/fixtures/general/email-contents");
const parameters_1 = require("/server/imports/fixtures/general/parameters");
const cc_payment_methods_1 = require("/server/imports/fixtures/payments/cc-payment-methods");
const invoices_info_1 = require("/server/imports/fixtures/payments/invoices-info");
const point_1 = require("/server/imports/fixtures/general/point");
const type_of_food_1 = require("/server/imports/fixtures/general/type-of-food");
const indexdb_1 = require("/server/imports/indexes/indexdb");
const cron_1 = require("/server/cron");
const bag_plans_1 = require("/server/imports/fixtures/points/bag_plans");
meteor_1.Meteor.startup(() => {
    remove_fixtures_1.removeFixtures();
    menus_1.loadMenus();
    roles_1.loadRoles();
    hours_1.loadHours();
    currencies_1.loadCurrencies();
    paymentMethods_1.loadPaymentMethods();
    countries_1.loadCountries();
    languages_1.loadLanguages();
    email_contents_1.loadEmailContents();
    parameters_1.loadParameters();
    cc_payment_methods_1.loadCcPaymentMethods();
    invoices_info_1.loadInvoicesInfo();
    point_1.loadPoints();
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
require("/both/collections/auth/device.collection.js");
require("/both/collections/auth/menu.collection.js");
require("/both/collections/auth/role.collection.js");
require("/both/collections/auth/user-detail.collection.js");
require("/both/collections/auth/user-login.collection.js");
require("/both/collections/auth/user-penalty.collection.js");
require("/both/collections/auth/user.collection.js");
require("/both/collections/establishment/establishment-qr.collection.js");
require("/both/collections/establishment/establishment.collection.js");
require("/both/collections/establishment/order-history.collection.js");
require("/both/collections/establishment/order.collection.js");
require("/both/collections/establishment/reward-point.collection.js");
require("/both/collections/establishment/reward.collection.js");
require("/both/collections/establishment/table.collection.js");
require("/both/collections/establishment/waiter-call-detail.collection.js");
require("/both/collections/general/country.collection.js");
require("/both/collections/general/currency.collection.js");
require("/both/collections/general/email-content.collection.js");
require("/both/collections/general/hours.collection.js");
require("/both/collections/general/language.collection.js");
require("/both/collections/general/parameter.collection.js");
require("/both/collections/general/paymentMethod.collection.js");
require("/both/collections/general/point.collection.js");
require("/both/collections/general/queue.collection.js");
require("/both/collections/general/type-of-food.collection.js");
require("/both/collections/menu/addition.collection.js");
require("/both/collections/menu/category.collection.js");
require("/both/collections/menu/item.collection.js");
require("/both/collections/menu/option-value.collection.js");
require("/both/collections/menu/option.collection.js");
require("/both/collections/menu/section.collection.js");
require("/both/collections/menu/subcategory.collection.js");
require("/both/collections/payment/cc-payment-methods.collection.js");
require("/both/collections/payment/cyg-invoices.collection.js");
require("/both/collections/payment/invoices-info.collection.js");
require("/both/collections/payment/payment-history.collection.js");
require("/both/collections/payment/payment-transaction.collection.js");
require("/both/collections/points/bag-plans-history.collection.js");
require("/both/collections/points/bag-plans.collection.js");
require("/both/collections/points/establishment-medal.collection.js");
require("/both/collections/points/establishment-points.collection.js");
require("/both/collections/points/negative-points.collection.js");
require("/both/collections/points/reward-confirmation.collection.js");
require("/both/collections/points/reward-history.collection.js");
require("/both/methods/auth/collaborators.methods.js");
require("/both/methods/auth/menu.methods.js");
require("/both/methods/auth/user-detail.methods.js");
require("/both/methods/auth/user-devices.methods.js");
require("/both/methods/auth/user-login.methods.js");
require("/both/methods/auth/user.methods.js");
require("/both/methods/establishment/establishment.methods.js");
require("/both/methods/general/change-email.methods.js");
require("/both/methods/general/country.methods.js");
require("/both/methods/general/cron.methods.js");
require("/both/methods/general/cyg-invoice.methods.js");
require("/both/methods/general/email.methods.js");
require("/both/methods/general/push-notifications.methods.js");
require("/both/methods/menu/item.methods.js");
require("/both/methods/reward/reward.methods.js");
require("/both/models/auth/device.model.js");
require("/both/models/auth/menu.model.js");
require("/both/models/auth/role.model.js");
require("/both/models/auth/user-detail.model.js");
require("/both/models/auth/user-login.model.js");
require("/both/models/auth/user-penalty.model.js");
require("/both/models/auth/user-profile.model.js");
require("/both/models/auth/user.model.js");
require("/both/models/establishment/establishment-qr.model.js");
require("/both/models/establishment/establishment.model.js");
require("/both/models/establishment/node.js");
require("/both/models/establishment/order-history.model.js");
require("/both/models/establishment/order.model.js");
require("/both/models/establishment/reward-point.model.js");
require("/both/models/establishment/reward.model.js");
require("/both/models/establishment/table.model.js");
require("/both/models/establishment/waiter-call-detail.model.js");
require("/both/models/general/country.model.js");
require("/both/models/general/currency.model.js");
require("/both/models/general/email-content.model.js");
require("/both/models/general/hour.model.js");
require("/both/models/general/language.model.js");
require("/both/models/general/menu.model.js");
require("/both/models/general/parameter.model.js");
require("/both/models/general/paymentMethod.model.js");
require("/both/models/general/pick-options.model.js");
require("/both/models/general/point.model.js");
require("/both/models/general/queue.model.js");
require("/both/models/general/type-of-food.model.js");
require("/both/models/menu/addition.model.js");
require("/both/models/menu/category.model.js");
require("/both/models/menu/item.model.js");
require("/both/models/menu/option-value.model.js");
require("/both/models/menu/option.model.js");
require("/both/models/menu/section.model.js");
require("/both/models/menu/subcategory.model.js");
require("/both/models/payment/cc-payment-method.model.js");
require("/both/models/payment/cc-request-colombia.model.js");
require("/both/models/payment/cyg-invoice.model.js");
require("/both/models/payment/invoice-info.model.js");
require("/both/models/payment/payment-history.model.js");
require("/both/models/payment/payment-transaction.model.js");
require("/both/models/payment/response-query.model.js");
require("/both/models/points/bag-plan-history.model.js");
require("/both/models/points/bag-plan.model.js");
require("/both/models/points/establishment-medal.model.js");
require("/both/models/points/establishment-point.model.js");
require("/both/models/points/negative-point.model.js");
require("/both/models/points/reward-confirmation.model.js");
require("/both/models/points/reward-history.model.js");
require("/both/shared-components/validators/custom-validator.js");
require("/both/models/collection-object.model.js");
require("/server/cron-config.js");
require("/server/cron.js");
require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvUVIvY29kZUdlbmVyYXRvci50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvYXV0aC9jb2xsYWJvcmF0b3JzLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9hdXRoL21lbnUubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXRhaWwubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXZpY2VzLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9hdXRoL3VzZXItbG9naW4ubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jaGFuZ2UtZW1haWwubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2dlbmVyYWwvY291bnRyeS5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jcm9uLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2N5Zy1pbnZvaWNlLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2VtYWlsLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL3B1c2gtbm90aWZpY2F0aW9ucy5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvbWVudS9pdGVtLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9yZXdhcmQvcmV3YXJkLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9kZXZpY2UuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3JvbGUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWxvZ2luLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLXBlbmFsdHkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3dhaXRlci1jYWxsLWRldGFpbC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY3VycmVuY3kuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2hvdXJzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wb2ludC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcXVldWUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL21lbnUvYWRkaXRpb24uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9tZW51L2NhdGVnb3J5LmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvbWVudS9vcHRpb24tdmFsdWUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9tZW51L29wdGlvbi5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc2VjdGlvbi5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc3ViY2F0ZWdvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kcy5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvY3lnLWludm9pY2VzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L3BheW1lbnQtdHJhbnNhY3Rpb24uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWwuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludHMuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnRzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvcmV3YXJkLWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tb2RlbHMvYXV0aC9kZXZpY2UubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2F1dGgvdXNlci1sb2dpbi5tb2RlbC50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tb2RlbHMvYXV0aC91c2VyLXByb2ZpbGUubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbC50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9ub2RlLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21vZGVscy9wYXltZW50L3Jlc3BvbnNlLXF1ZXJ5Lm1vZGVsLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL3NoYXJlZC1jb21wb25lbnRzL3ZhbGlkYXRvcnMvY3VzdG9tLXZhbGlkYXRvci50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9hY2NvdW50LWNyZWF0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9maXh0dXJlcy9hdXRoL2VtYWlsLWNvbmZpZy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9tZW51cy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9yb2xlcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9jb3VudHJpZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvY3VycmVuY2llcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9lbWFpbC1jb250ZW50cy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9ob3Vycy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9sYW5ndWFnZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvcGFyYW1ldGVycy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9wYXltZW50TWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9wb2ludC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC90eXBlLW9mLWZvb2QudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL3BheW1lbnRzL2NjLXBheW1lbnQtbWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvcGF5bWVudHMvaW52b2ljZXMtaW5mby50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvcG9pbnRzL2JhZ19wbGFucy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvcmVtb3ZlLWZpeHR1cmVzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9jb2xsYWJvcmF0b3JzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9tZW51cy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2F1dGgvcm9sZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3VzZXItZGV0YWlscy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2F1dGgvdXNlcnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC90YWJsZS50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvd2FpdGVyLWNhbGwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2NvdW50cmllcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvY3VycmVuY3kudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2hvdXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2xhbmd1YWdlcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvcGFyYW1ldGVyLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wb2ludC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvdHlwZS1vZi1mb29kLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9hZGRpdGlvbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L2NhdGVnb3JpZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L2l0ZW0udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L29wdGlvbi12YWx1ZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L29wdGlvbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L3NlY3Rpb25zLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9zdWJjYXRlZ29yaWVzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvY3lnLWludm9pY2VzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9pbnZvaWNlLWluZm8udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L3BheW1lbnQtaGlzdG9yeS50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvcGF5bWVudC10cmFuc2FjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9iYWdfcGxhbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudF9wb2ludHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9yZXdhcmQtaGlzdG9yeS50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvaW5kZXhlcy9pbmRleGRiLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvY3Jvbi1jb25maWcudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9jcm9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNkRBQTBEO0FBRTFELHNEQUF1RDtBQUV2RDtJQVlJLFlBQWEsaUJBQXdCO1FBVDdCLGVBQVUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQWUsQ0FBQztRQUN2RCxhQUFRLEdBQWUsSUFBSSxLQUFLLEVBQVEsQ0FBQztRQUN6QyxRQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFpQixDQUFDO1FBQ2xELGNBQVMsR0FBUSxJQUFJLFdBQUksRUFBRSxDQUFDO1FBQzVCLGVBQVUsR0FBRyxFQUFFLENBQUM7UUFDaEIsc0JBQWlCLEdBQVUsQ0FBQyxDQUFDO1FBS2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsaUJBQWlCLENBQUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU0sWUFBWTtRQUNmLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFJ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QkFBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsRUFBQztRQUNuQyxNQUFNLEtBQUssR0FBVztZQUNsQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVB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QUFtRDtBQUNuRCxtREFBaUQ7QUFDakQsNkNBQTJDO0FBQzNDLGdEQUE4QztBQUM5QyxpREFBK0M7QUFDL0Msd0RBQXNEO0FBQ3RELG1EQUFpRDtBQUNqRCx1REFBcUQ7QUFDckQsOERBQTREO0FBQzVELCtEQUE2RDtBQUM3RCxpREFBK0M7QUFFL0MseURBQWtEO0FBQ2xELHFEQUE4QztBQUM5Qyw2RUFBb0U7QUFDcEUsOERBQTBEO0FBQzFELDhEQUEwRDtBQUMxRCxpRUFBNkQ7QUFDN0QsMkVBQXVFO0FBQ3ZFLG1GQUErRTtBQUMvRSx5RUFBcUU7QUFDckUseUVBQXFFO0FBQ3JFLG1GQUE4RTtBQUM5RSwyRUFBdUU7QUFDdkUsNEZBQXNGO0FBQ3RGLGtGQUE2RTtBQUM3RSxpRUFBOEQ7QUFDOUQsK0VBQTBFO0FBQzFFLDREQUE0RDtBQUM1RCxzQ0FBcUM7QUFDckMsd0VBQW1FO0FBRW5FLGVBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO0lBQ2hCLGdDQUFjLEVBQUUsQ0FBQztJQUNqQixpQkFBUyxFQUFFLENBQUM7SUFDWixpQkFBUyxFQUFFLENBQUM7SUFDWixpQkFBUyxFQUFFLENBQUM7SUFDWiwyQkFBYyxFQUFFLENBQUM7SUFDakIsbUNBQWtCLEVBQUUsQ0FBQztJQUNyQix5QkFBYSxFQUFFLENBQUM7SUFDaEIseUJBQWEsRUFBRSxDQUFDO0lBQ2hCLGtDQUFpQixFQUFFLENBQUM7SUFDcEIsMkJBQWMsRUFBRSxDQUFDO0lBQ2pCLHlDQUFvQixFQUFFLENBQUM7SUFDdkIsZ0NBQWdCLEVBQUUsQ0FBQztJQUNuQixrQkFBVSxFQUFFLENBQUM7SUFDYiw4QkFBZSxFQUFFLENBQUM7SUFDbEIsa0JBQVcsRUFBRSxDQUFDO0lBQ2Qsd0JBQVksRUFBRSxDQUFDO0lBQ2YseUJBQWUsRUFBRSxDQUFDO0FBQ3RCLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvbm9kZSc7XG5pbXBvcnQgeyBCeXRlc0luZm8sIFFSQ29kZUluZm9ybWF0aW9uIH0gZnJvbSAnLi4vLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvdGFibGUubW9kZWwnO1xuaW1wb3J0IENvbGxlY3Rpb25zID0gcmVxdWlyZSgndHlwZXNjcmlwdC1jb2xsZWN0aW9ucycpO1xuXG5leHBvcnQgY2xhc3MgQ29kZUdlbmVyYXRvciB7XG4gICAgXG4gICAgcHJpdmF0ZSBzdHJpbmdUb0NvbnZlcnQ6c3RyaW5nO1xuICAgIHByaXZhdGUgZGljY2lvbmFyeSA9IG5ldyBDb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PFN0cmluZyxOb2RlPigpO1xuICAgIHByaXZhdGUgc29ydExpc3Q6QXJyYXk8Tm9kZT4gPSBuZXcgQXJyYXk8Tm9kZT4oKTtcbiAgICBwcml2YXRlIG1hcCA9IG5ldyBDb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PFN0cmluZyxTdHJpbmc+KCk7XG4gICAgcHJpdmF0ZSBmaW5hbFRyZWU6Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgcHJpdmF0ZSBiaW5hcnlDb2RlID0gJyc7XG4gICAgcHJpdmF0ZSBzaWduaWZpY2F0aXZlQml0czpudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgZmluYWxCeXRlczogQnl0ZXNJbmZvW107XG4gICAgcHJpdmF0ZSBRUkNvZGU6c3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoIF9wU3RyaW5nVG9Db252ZXJ0OnN0cmluZyApe1xuICAgICAgICB0aGlzLnN0cmluZ1RvQ29udmVydCA9IF9wU3RyaW5nVG9Db252ZXJ0O1xuICAgICAgICB0aGlzLmZpbmFsVHJlZS5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwgKTtcbiAgICAgICAgdGhpcy5maW5hbEJ5dGVzID0gW107XG4gICAgfVxuXG4gICAgcHVibGljIGdlbmVyYXRlQ29kZSgpe1xuICAgICAgICB0aGlzLmJ1aWxkRnJlY3VlbmN5VGFibGUoKTtcbiAgICAgICAgdGhpcy5zb3J0RGF0YSgpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRyZWUoKTtcbiAgICAgICAgdGhpcy5jb2RlVHJlZSgpO1xuICAgICAgICB0aGlzLmNyZWF0ZVFSQ29kZSgpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGJ1aWxkRnJlY3VlbmN5VGFibGUoKTp2b2lke1xuICAgICAgICBsZXQgX2xOb2RlOk5vZGU7XG4gICAgICAgIGxldCBfbENoYXJzOm51bWJlciA9IDA7XG5cbiAgICAgICAgZm9yKGxldCBfaSA9IDA7IF9pIDwgdGhpcy5zdHJpbmdUb0NvbnZlcnQubGVuZ3RoOyBfaSsrICl7XG4gICAgICAgICAgICBfbENoYXJzID0gdGhpcy5zdHJpbmdUb0NvbnZlcnQuY2hhckNvZGVBdCggX2kgKTtcbiAgICAgICAgICAgIF9sTm9kZSA9IHRoaXMuZGljY2lvbmFyeS5nZXRWYWx1ZSggJycgKyBfbENoYXJzICk7XG5cbiAgICAgICAgICAgIGlmKCBfbE5vZGUgPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgbGV0IF9sQXV4Ok5vZGUgPSBuZXcgTm9kZSgpO1xuICAgICAgICAgICAgICAgIF9sQXV4LmNyZWF0ZU5vZGUoX2xDaGFycyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWNjaW9uYXJ5LnNldFZhbHVlKCBfbENoYXJzICsgJycsIF9sQXV4ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9sTm9kZS5zZXRGcmVjdWVuY3koIF9sTm9kZS5nZXRGcmVjdWVuY3koKSArIDEgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc29ydERhdGEoKTp2b2lke1xuICAgICAgICBsZXQgX2xOb2RlOk5vZGU7XG4gICAgICAgIGxldCBfbEZyZWN1ZW5jeTpudW1iZXI7XG4gICAgICAgIGxldCBfbFNvcnRGcmVjdWVuY3k6bnVtYmVyW10gPSBbXTtcbiAgICAgICAgbGV0IF9sU29ydFRNUDpBcnJheTxudW1iZXI+ID0gbmV3IEFycmF5PG51bWJlcj4oKTtcbiAgICAgICAgbGV0IF9BdXhDb250Om51bWJlciA9IDA7XG5cbiAgICAgICAgZm9yKCBsZXQgX2kgPSAwOyBfaSA8PSAyNTU7IF9pKysgKXtcbiAgICAgICAgICAgIF9sU29ydFRNUC5zcGxpY2UoIDAsIDAsIDAgKTtcbiAgICAgICAgfSAgICAgICAgXG5cbiAgICAgICAgdGhpcy5kaWNjaW9uYXJ5LnZhbHVlcygpLmZvckVhY2goKHJlcyk9PiB7XG4gICAgICAgICAgICBfbFNvcnRGcmVjdWVuY3kuc3BsaWNlKCBfQXV4Q29udCwgMCwgcmVzLmdldEZyZWN1ZW5jeSgpICk7XG4gICAgICAgICAgICBfbFNvcnRUTVAuc3BsaWNlKCByZXMuZ2V0Q2hhcigpLCAxLCByZXMuZ2V0RnJlY3VlbmN5KCkgKTsgXG4gICAgICAgICAgICBfQXV4Q29udCsrO1xuICAgICAgICB9KTtcblxuICAgICAgICBfbFNvcnRGcmVjdWVuY3kuc29ydCgpO1xuXG4gICAgICAgIF9sU29ydEZyZWN1ZW5jeS5mb3JFYWNoKChub2QpPT57XG4gICAgICAgICAgICBsZXQgdG1wID0gX2xTb3J0VE1QLmluZGV4T2YoIG5vZCApO1xuICAgICAgICAgICAgX2xTb3J0VE1QLnNwbGljZSggdG1wLCAxLCAwICk7XG4gICAgICAgICAgICBsZXQgdG1wTm9kZTpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgICAgIHRtcE5vZGUuY3JlYXRlTm9kZUV4dGVuZCggbm9kLCB0bXAsIG51bGwsIG51bGwgKTtcbiAgICAgICAgICAgIHRoaXMuc29ydExpc3QucHVzaCh0bXBOb2RlKTtcbiAgICAgICAgfSk7ICAgICAgXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVOZXdOb2RlKCBfcE5vZGVMZWZ0Ok5vZGUsIF9wTm9kZVJpZ2h0Ok5vZGUgKTpOb2Rle1xuICAgICAgICBsZXQgX2xOZXdOb2RlOk5vZGUgPSBuZXcgTm9kZSgpO1xuICAgICAgICBsZXQgX2xGcmVjdWVuY3lOZXdOb2RlOm51bWJlcjtcblxuICAgICAgICBfbEZyZWN1ZW5jeU5ld05vZGUgPSAoIF9wTm9kZUxlZnQuZ2V0RnJlY3VlbmN5KCkgKyBfcE5vZGVSaWdodC5nZXRGcmVjdWVuY3koKSApO1xuICAgICAgICBfbE5ld05vZGUuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIF9sTmV3Tm9kZS5zZXRGcmVjdWVuY3koIF9sRnJlY3VlbmN5TmV3Tm9kZSApO1xuICAgICAgICBfbE5ld05vZGUuc2V0Tm9kZUxlZnQoIF9wTm9kZUxlZnQgKTtcbiAgICAgICAgX2xOZXdOb2RlLnNldE5vZGVSaWdodCggX3BOb2RlUmlnaHQgKTtcbiAgICAgICAgcmV0dXJuIF9sTmV3Tm9kZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluc2VydE5ld05vZGUoIF9wTmV3Tm9kZTpOb2RlLCBfcFNvcnRMaXN0OkFycmF5PE5vZGU+ICk6QXJyYXk8Tm9kZT57XG4gICAgICAgIGxldCBfbEZpcnN0Tm9kZTpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgbGV0IF9sU2Vjb25kTm9kZTpOb2RlID0gbmV3IE5vZGUoKTtcblxuICAgICAgICBfbEZpcnN0Tm9kZS5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwpO1xuICAgICAgICBfbFNlY29uZE5vZGUuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIF9wU29ydExpc3Quc3BsaWNlKDAgLCAwLCBfcE5ld05vZGUgKTtcblxuICAgICAgICBmb3IoIGxldCBfaSA9IDA7IF9pIDwgX3BTb3J0TGlzdC5sZW5ndGggLSAxOyBfaSsrICl7XG4gICAgICAgICAgICBfbEZpcnN0Tm9kZSA9IF9wU29ydExpc3RbIF9pIF07XG4gICAgICAgICAgICBfbFNlY29uZE5vZGUgPSBfcFNvcnRMaXN0WyAoX2kgKyAxKSBdO1xuXG4gICAgICAgICAgICBpZiggX2xGaXJzdE5vZGUuZ2V0RnJlY3VlbmN5KCkgPj0gX2xTZWNvbmROb2RlLmdldEZyZWN1ZW5jeSgpICl7XG4gICAgICAgICAgICAgICAgX3BTb3J0TGlzdC5zcGxpY2UoICggX2kgKyAxICksIDEsIF9sRmlyc3ROb2RlICk7XG4gICAgICAgICAgICAgICAgX3BTb3J0TGlzdC5zcGxpY2UoIF9pLCAxLCBfbFNlY29uZE5vZGUgKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9wU29ydExpc3Q7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVUcmVlKCk6dm9pZCB7XG4gICAgICAgIGxldCBfbFRlbXBOb2RlTGVmdDpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgbGV0IF9sVGVtcE5vZGVSaWdodDpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgbGV0IF9sVGVtcE5ld05vZGU6Tm9kZSA9IG5ldyBOb2RlKCk7XG5cbiAgICAgICAgX2xUZW1wTm9kZUxlZnQuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIF9sVGVtcE5vZGVSaWdodC5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwgKTtcbiAgICAgICAgX2xUZW1wTmV3Tm9kZS5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwgKTtcblxuICAgICAgICB3aGlsZSggdGhpcy5zb3J0TGlzdC5sZW5ndGggIT0gMSApeyAgICAgICAgICAgIFxuICAgICAgICAgICAgX2xUZW1wTm9kZUxlZnQgPSB0aGlzLnNvcnRMaXN0LnNoaWZ0KCk7XG4gICAgICAgICAgICBfbFRlbXBOb2RlUmlnaHQgPSB0aGlzLnNvcnRMaXN0LnNoaWZ0KCk7XG4gICAgICAgICAgICBfbFRlbXBOZXdOb2RlID0gdGhpcy5jcmVhdGVOZXdOb2RlKCBfbFRlbXBOb2RlTGVmdCwgX2xUZW1wTm9kZVJpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLnNvcnRMaXN0ID0gdGhpcy5pbnNlcnROZXdOb2RlKCBfbFRlbXBOZXdOb2RlLCB0aGlzLnNvcnRMaXN0ICk7XG4gICAgICAgIH0gICAgICAgIFxuICAgICAgICB0aGlzLmZpbmFsVHJlZSA9IHRoaXMuc29ydExpc3Quc2hpZnQoKTtcbiAgICAgICAgdGhpcy5wcmVPcmRlciggdGhpcy5maW5hbFRyZWUsIFwiXCIgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByZU9yZGVyKCBfcE5vZGU6Tm9kZSwgX3BWYWw6c3RyaW5nICk6dm9pZHtcbiAgICAgICAgaWYoIF9wTm9kZS5nZXROb2RlTGVmdCgpID09IG51bGwgJiYgX3BOb2RlLmdldE5vZGVSaWdodCgpID09IG51bGwgKXtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFZhbHVlKCBfcE5vZGUuZ2V0Q2hhcigpICsgJycsIF9wVmFsICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVPcmRlciggX3BOb2RlLmdldE5vZGVMZWZ0KCksIF9wVmFsLmNvbmNhdCggXCIxXCIgKSApO1xuICAgICAgICB0aGlzLnByZU9yZGVyKCBfcE5vZGUuZ2V0Tm9kZVJpZ2h0KCksIF9wVmFsLmNvbmNhdCggXCIwXCIgKSApO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29kZVRyZWUoKTp2b2lke1xuICAgICAgICBsZXQgX2xDb2RlQnl0ZXMgPSAnJztcbiAgICAgICAgbGV0IF9sQ2hhcnMgPSAwO1xuICAgICAgICBsZXQgX2xFbmQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBsZXQgX2xCeXRlOm51bWJlcjtcbiAgICAgICAgbGV0IF9sQ29kZTpzdHJpbmcgPSAnJztcblxuICAgICAgICBmb3IoIGxldCBfaSA9IDA7IF9pIDwgdGhpcy5zdHJpbmdUb0NvbnZlcnQubGVuZ3RoOyBfaSsrICl7XG4gICAgICAgICAgICBfbENoYXJzID0gdGhpcy5zdHJpbmdUb0NvbnZlcnQuY2hhckNvZGVBdCggX2kgKTtcbiAgICAgICAgICAgIHRoaXMuYmluYXJ5Q29kZSArPSB0aGlzLm1hcC5nZXRWYWx1ZSggX2xDaGFycyArICcnICk7XG4gICAgICAgIH1cblxuICAgICAgICBfbENvZGUgPSB0aGlzLmJpbmFyeUNvZGU7XG5cbiAgICAgICAgd2hpbGUoICFfbEVuZCApe1xuXG4gICAgICAgICAgICBsZXQgQnl0ZXNJbmZvOkJ5dGVzSW5mbyA9IHsgYml0czonJywgZmluYWxCeXRlOjAsIG9yaWdpbmFsQnl0ZTowIH07XG5cbiAgICAgICAgICAgIGZvciggbGV0IF9qID0gMDsgX2ogPCA4OyBfaisrICl7XG4gICAgICAgICAgICAgICAgX2xDb2RlQnl0ZXMgKz0gX2xDb2RlLmNoYXJBdCggX2ogKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9sQnl0ZSA9IHBhcnNlSW50KCBfbENvZGVCeXRlcywgMiApO1xuICAgICAgICAgICAgQnl0ZXNJbmZvLm9yaWdpbmFsQnl0ZSA9IF9sQnl0ZTtcblxuICAgICAgICAgICAgd2hpbGUoIHRydWUgKXtcbiAgICAgICAgICAgICAgICBfbEJ5dGUgPSB0aGlzLmJ5dGVOaXZlbGF0b3IoIF9sQnl0ZSApO1xuICAgICAgICAgICAgICAgIGlmKCBfbEJ5dGUgPj0gNjUgJiYgX2xCeXRlIDw9IDkwICl7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEJ5dGVzSW5mby5maW5hbEJ5dGUgPSBfbEJ5dGU7XG4gICAgICAgICAgICBCeXRlc0luZm8uYml0cyA9IF9sQ29kZUJ5dGVzO1xuICAgICAgICAgICAgdGhpcy5maW5hbEJ5dGVzLnB1c2goIEJ5dGVzSW5mbyApO1xuICAgICAgICAgICAgX2xDb2RlQnl0ZXMgPSAnJztcbiAgICAgICAgICAgIF9sQ29kZSA9IF9sQ29kZS5zdWJzdHJpbmcoIDgsIF9sQ29kZS5sZW5ndGggKTtcblxuICAgICAgICAgICAgaWYoIF9sQ29kZS5sZW5ndGggPT0gMCApe1xuICAgICAgICAgICAgICAgIF9sRW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIF9sQ29kZS5sZW5ndGggPCA4ICl7XG4gICAgICAgICAgICAgICAgX2xDb2RlID0gdGhpcy5hZGRTaWduaWZpY2F0aXZlQml0cyggX2xDb2RlICk7XG4gICAgICAgICAgICB9ICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWRkU2lnbmlmaWNhdGl2ZUJpdHMoIF9jb2RlOnN0cmluZyApOnN0cmluZ3tcbiAgICAgICAgd2hpbGUoIF9jb2RlLmxlbmd0aCA8IDggKXtcbiAgICAgICAgICAgIF9jb2RlICs9IFwiMFwiO1xuICAgICAgICAgICAgdGhpcy5zaWduaWZpY2F0aXZlQml0cyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfY29kZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJ5dGVOaXZlbGF0b3IoIF9wQnl0ZTpudW1iZXIgKTpudW1iZXJ7XG4gICAgICAgIGxldCBfbE51bWJlckNvbnZlcnQ6bnVtYmVyID0gMDtcbiAgICAgICAgaWYoIF9wQnl0ZSA8IDY1ICl7XG4gICAgICAgICAgICBfbE51bWJlckNvbnZlcnQgPSBfcEJ5dGUgKyAxMDtcbiAgICAgICAgfSBlbHNlIGlmKCBfcEJ5dGUgPiA5MCApIHtcbiAgICAgICAgICAgIF9sTnVtYmVyQ29udmVydCA9IF9wQnl0ZSAtIDEwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICBfbE51bWJlckNvbnZlcnQgPSBfcEJ5dGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9sTnVtYmVyQ29udmVydDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVFSQ29kZSgpOnZvaWR7XG4gICAgICAgIGxldCBfbFFSQ29kZTpzdHJpbmcgPSAnJztcblxuICAgICAgICB0aGlzLmZpbmFsQnl0ZXMuZm9yRWFjaCggKGJ5dGUpID0+IHtcbiAgICAgICAgICAgIF9sUVJDb2RlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZS5maW5hbEJ5dGUpXG4gICAgICAgIH0pO1xuICAgICAgICBfbFFSQ29kZSArPSAoIHRoaXMuZmluYWxCeXRlc1sgMCBdLmZpbmFsQnl0ZSArICcnICk7XG4gICAgICAgIF9sUVJDb2RlICs9ICggdGhpcy5maW5hbEJ5dGVzWyB0aGlzLmZpbmFsQnl0ZXMubGVuZ3RoIC0gMSBdLmZpbmFsQnl0ZSArICcnICk7XG4gICAgICAgIHRoaXMuUVJDb2RlID0gX2xRUkNvZGU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbmFsQnl0ZXMoKTpCeXRlc0luZm9bXXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluYWxCeXRlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U2lnbmlmaWNhdGl2ZUJpdHMoKTpudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLnNpZ25pZmljYXRpdmVCaXRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRRUkNvZGUoKTpzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLlFSQ29kZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDb2RlR2VuZXJhdG9yIH0gZnJvbSAnLi9RUi9jb2RlR2VuZXJhdG9yJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbCB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3BhcmFtZXRlci5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyUGVuYWx0eSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItcGVuYWx0eS5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyUGVuYWx0aWVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLXBlbmFsdHkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UVIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LXFyLm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRRUnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50TWVkYWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWwubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudE1lZGFscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlIHJhbmRvbSBjb2RlIHdpdGggOSBsZW5ndGggdG8gZXN0YWJsaXNobWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVzdGFibGlzaG1lbnRDb2RlKCk6IHN0cmluZyB7XG4gICAgbGV0IF9sVGV4dCA9ICcnO1xuICAgIGxldCBfbFBvc3NpYmxlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJztcblxuICAgIGZvciAobGV0IF9pID0gMDsgX2kgPCA5OyBfaSsrKSB7XG4gICAgICAgIF9sVGV4dCArPSBfbFBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBfbFBvc3NpYmxlLmxlbmd0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gX2xUZXh0O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlIHJhbmRvbSBjb2RlIHdpdGggNSBsZW5ndGggdG8gZXN0YWJsaXNobWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRhYmxlQ29kZSgpOiBzdHJpbmcge1xuICAgIGxldCBfbFRleHQgPSAnJztcbiAgICBsZXQgX2xQb3NzaWJsZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XG5cbiAgICBmb3IgKGxldCBfaSA9IDA7IF9pIDwgNTsgX2krKykge1xuICAgICAgICBfbFRleHQgKz0gX2xQb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogX2xQb3NzaWJsZS5sZW5ndGgpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9sVGV4dDtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZSByYW5kb20gY29kZSB3aXRoIDE0IGxlbmd0aCB0byBlc3RhYmxpc2htZW50IFFSXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb2RlVG9Fc3RhYmxpc2htZW50UVIoKTogc3RyaW5nIHtcbiAgICBsZXQgX2xUZXh0ID0gJyc7XG4gICAgbGV0IF9sUG9zc2libGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xuXG4gICAgZm9yIChsZXQgX2kgPSAwOyBfaSA8IDE0OyBfaSsrKSB7XG4gICAgICAgIF9sVGV4dCArPSBfbFBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBfbFBvc3NpYmxlLmxlbmd0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gX2xUZXh0O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlIFFSIENvZGVzIHRvIGVzdGFibGlzaG1lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BTdHJpbmdUb0NvZGVcbiAqIEByZXR1cm4ge1RhYmxlfSBnZW5lcmF0ZVFSQ29kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVRUkNvZGUoX3BTdHJpbmdUb0NvZGU6IHN0cmluZyk6IGFueSB7XG4gICAgbGV0IF9sQ29kZUdlbmVyYXRvciA9IG5ldyBDb2RlR2VuZXJhdG9yKF9wU3RyaW5nVG9Db2RlKTtcbiAgICBfbENvZGVHZW5lcmF0b3IuZ2VuZXJhdGVDb2RlKCk7XG4gICAgcmV0dXJuIF9sQ29kZUdlbmVyYXRvcjtcbn1cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWV0ZW9yIG1ldGhvZCB0byB2YWxpZGF0ZSBlc3RhYmxpc2htZW50IFFSIGNvZGVcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9xcmNvZGVcbiAgICAgICAgICovXG4gICAgICAgIHZlcmlmeUVzdGFibGlzaG1lbnRRUkNvZGU6IGZ1bmN0aW9uIChfcXJDb2RlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnRRUjogRXN0YWJsaXNobWVudFFSID0gRXN0YWJsaXNobWVudFFScy5maW5kT25lKHsgUVJfY29kZTogX3FyQ29kZSB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX2xFc3RhYmxpc2htZW50UVIgIT09IHVuZGVmaW5lZCB8fCBfbEVzdGFibGlzaG1lbnRRUiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfbEVzdGFibGlzaG1lbnRRUjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgTWV0ZW9yIE1ldGhvZCByZXR1cm4gZXN0YWJsaXNobWVudCBvYmplY3Qgd2l0aCBRUiBDb2RlIGNvbmRpdGlvblxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gX3FyQ29kZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RXN0YWJsaXNobWVudEJ5UVJDb2RlOiBmdW5jdGlvbiAoX3FyQ29kZTogc3RyaW5nLCBfdXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBfZXN0YWJsaXNobWVudDogRXN0YWJsaXNobWVudDtcbiAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnRRUjogRXN0YWJsaXNobWVudFFSID0gRXN0YWJsaXNobWVudFFScy5maW5kT25lKHsgUVJfY29kZTogX3FyQ29kZSB9KTtcbiAgICAgICAgICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcblxuICAgICAgICAgICAgaWYgKF9sVXNlckRldGFpbC5wZW5hbHRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IF9sVXNlclBlbmFsdHk6IFVzZXJQZW5hbHR5ID0gVXNlclBlbmFsdGllcy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCwgaXNfYWN0aXZlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIGlmIChfbFVzZXJQZW5hbHR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfbFVzZXJQZW5hbHR5RGF5czogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ3BlbmFsdHlfZGF5cycgfSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfbEN1cnJlbnREYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9sRGF0ZVRvQ29tcGFyZTogRGF0ZSA9IG5ldyBEYXRlKF9sVXNlclBlbmFsdHkubGFzdF9kYXRlLnNldERhdGUoKF9sVXNlclBlbmFsdHkubGFzdF9kYXRlLmdldERhdGUoKSArIE51bWJlcihfbFVzZXJQZW5hbHR5RGF5cy52YWx1ZSkpKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfbERhdGVUb0NvbXBhcmUuZ2V0VGltZSgpID49IF9sQ3VycmVudERhdGUuZ2V0VGltZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xEYXk6IG51bWJlciA9IF9sRGF0ZVRvQ29tcGFyZS5nZXREYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xNb250aDogbnVtYmVyID0gX2xEYXRlVG9Db21wYXJlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sWWVhcjogbnVtYmVyID0gX2xEYXRlVG9Db21wYXJlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc1MDAnLCBfbERheSArICcvJyArIF9sTW9udGggKyAnLycgKyBfbFllYXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgVXNlclBlbmFsdGllcy51cGRhdGUoeyBfaWQ6IF9sVXNlclBlbmFsdHkuX2lkIH0sIHsgJHNldDogeyBpc19hY3RpdmU6IGZhbHNlIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfbEVzdGFibGlzaG1lbnRRUikge1xuICAgICAgICAgICAgICAgIF9lc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBfbEVzdGFibGlzaG1lbnRRUi5lc3RhYmxpc2htZW50X2lkIH0pO1xuICAgICAgICAgICAgICAgIGlmIChfZXN0YWJsaXNobWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2VzdGFibGlzaG1lbnQuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnRNZWRhbDogRXN0YWJsaXNobWVudE1lZGFsID0gRXN0YWJsaXNobWVudE1lZGFscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCwgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnQuX2lkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2xFc3RhYmxpc2htZW50TWVkYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xOZXdRdWFudGl0eTogbnVtYmVyID0gX2xFc3RhYmxpc2htZW50TWVkYWwubWVkYWxzICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50TWVkYWxzLnVwZGF0ZSh7IF9pZDogX2xFc3RhYmxpc2htZW50TWVkYWwuX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fdXNlcjogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGFsczogX2xOZXdRdWFudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpb25fdXNlcjogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnQuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2xVc2VyRGV0YWlsLmdyYW50X3N0YXJ0X3BvaW50cyAhPT0gdW5kZWZpbmVkICYmIF9sVXNlckRldGFpbC5ncmFudF9zdGFydF9wb2ludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xFeHBpcmVEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xVc2VyU3RhcnRQb2ludHM6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICd1c2VyX3N0YXJ0X3BvaW50cycgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sQ3VycmVudEVzdGFibGlzaG1lbnRNZWRhbDogRXN0YWJsaXNobWVudE1lZGFsID0gRXN0YWJsaXNobWVudE1lZGFscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCwgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnQuX2lkIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbE5ld1F1YW50aXR5OiBudW1iZXIgPSBfbEN1cnJlbnRFc3RhYmxpc2htZW50TWVkYWwubWVkYWxzICsgTnVtYmVyLnBhcnNlSW50KF9sVXNlclN0YXJ0UG9pbnRzLnZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMudXBkYXRlKHsgX2lkOiBfbEN1cnJlbnRFc3RhYmxpc2htZW50TWVkYWwuX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fdXNlcjogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGFsczogX2xOZXdRdWFudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXNlckRldGFpbHMudXBkYXRlKHsgX2lkOiBfbFVzZXJEZXRhaWwuX2lkIH0sIHsgJHNldDogeyBncmFudF9zdGFydF9wb2ludHM6IGZhbHNlIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VzdGFibGlzaG1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCcyMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzMwMCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNDAwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIGFsbG93IHJlc3RhdXJhbnQgZ2l2ZSBtZWRhbCB0byBzcGVjaWZpYyB1c2VyXG4gICAgICAgICAqL1xuICAgICAgICBnaXZlTWVkYWxUb1VzZXI6IGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcsIF91c2VySWQ6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IF9lc3RhYmxpc2htZW50OiBFc3RhYmxpc2htZW50O1xuICAgICAgICAgICAgbGV0IF9sVXNlckRldGFpbDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuXG4gICAgICAgICAgICBfZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbiAgICAgICAgICAgIGlmIChfZXN0YWJsaXNobWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChfZXN0YWJsaXNobWVudC5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2xFc3RhYmxpc2htZW50TWVkYWw6IEVzdGFibGlzaG1lbnRNZWRhbCA9IEVzdGFibGlzaG1lbnRNZWRhbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQsIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50Ll9pZCB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX2xFc3RhYmxpc2htZW50TWVkYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbE5ld1F1YW50aXR5OiBudW1iZXIgPSBfbEVzdGFibGlzaG1lbnRNZWRhbC5tZWRhbHMgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudE1lZGFscy51cGRhdGUoeyBfaWQ6IF9sRXN0YWJsaXNobWVudE1lZGFsLl9pZCB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX3VzZXI6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGFsczogX2xOZXdRdWFudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudE1lZGFscy5pbnNlcnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW9uX3VzZXI6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiBfdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50Ll9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzE2MCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignMTUwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIHJldHVybiBlc3RhYmxpc2htZW50IGlmIGV4aXN0IG8gbnVsbCBpZiBub3RcbiAgICAgICAgICovXG5cbiAgICAgICAgZ2V0Q3VycmVudEVzdGFibGlzaG1lbnRCeVVzZXI6IGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBlc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBfZXN0YWJsaXNobWVudElkIH0pO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGVzdGFibGlzaG1lbnQgIT0gXCJ1bmRlZmluZWRcIiB8fCBlc3RhYmxpc2htZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXN0YWJsaXNobWVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVFc3RhYmxpc2htZW50SXNBY3RpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICBpZiAodXNlckRldGFpbCkge1xuICAgICAgICAgICAgICAgIGxldCBlc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiB1c2VyRGV0YWlsLmVzdGFibGlzaG1lbnRfd29yayB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXN0YWJsaXNobWVudC5pc0FjdGl2ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgY3JlYXRlQ29sbGFib3JhdG9yVXNlcjogZnVuY3Rpb24gKCBfaW5mbyA6IGFueSApIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBBY2NvdW50cy5jcmVhdGVVc2VyKHtcbiAgICAgICAgICAgICAgICBlbWFpbDogX2luZm8uZW1haWwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IF9pbmZvLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBfaW5mby51c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwcm9maWxlOiBfaW5mby5wcm9maWxlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG4gICAgXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJvbGVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTWVudXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBNZW51IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvbWVudS5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgZ2V0TWVudXM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgbGV0IG1lbnVMaXN0OiBNZW51W10gPSBbXTtcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICBsZXQgcm9sZSA9IFJvbGVzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogdXNlckRldGFpbC5yb2xlX2lkIH0pO1xuICAgICAgICAgICAgTWVudXMuY29sbGVjdGlvbi5maW5kKHsgX2lkOiB7ICRpbjogcm9sZS5tZW51cyB9LCBpc19hY3RpdmU6IHRydWUgfSwgeyBzb3J0OiB7IG9yZGVyOiAxIH0gfSkuZm9yRWFjaChmdW5jdGlvbiA8TWVudT4obWVudSwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgbWVudUxpc3QucHVzaChtZW51KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG1lbnVMaXN0O1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBnZXRSb2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcm9sZTogc3RyaW5nID0gXCJcIjtcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICBpZih1c2VyRGV0YWlsKXtcbiAgICAgICAgICAgICAgICByb2xlID0gdXNlckRldGFpbC5yb2xlX2lkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJvbGU7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQWRtaW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnMTAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlV2FpdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcm9sZTogc3RyaW5nO1xuICAgICAgICAgICAgbGV0IHVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmRPbmUoeyB1c2VyX2lkOiB0aGlzLnVzZXJJZCB9KTtcbiAgICAgICAgICAgIHJvbGUgPSB1c2VyRGV0YWlsLnJvbGVfaWQ7XG4gICAgICAgICAgICBpZiAocm9sZSA9PT0gJzIwMCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0ZUNhc2hpZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnMzAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQ3VzdG9tZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnNDAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQ2hlZjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHJvbGU6IHN0cmluZztcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICByb2xlID0gdXNlckRldGFpbC5yb2xlX2lkO1xuICAgICAgICAgICAgaWYgKHJvbGUgPT09ICc1MDAnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRhdGVBZG1pbk9yU3VwZXJ2aXNvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHJvbGU6IHN0cmluZztcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICByb2xlID0gdXNlckRldGFpbC5yb2xlX2lkO1xuICAgICAgICAgICAgaWYgKHJvbGUgPT09ICcxMDAnIHx8IHJvbGUgPT09ICc2MDAnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RGV0YWlsc0NvdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgY291bnQ6IG51bWJlcjtcbiAgICAgICAgICAgIGNvdW50ID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSkuY291bnQoKTtcbiAgICAgICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFZhbGlkYXRlIHVzZXIgaXMgYWN0aXZlXG4gICAgICAgICAqL1xuICAgICAgICB2YWxpZGF0ZVVzZXJJc0FjdGl2ZSA6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgaWYodXNlckRldGFpbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJEZXRhaWwuaXNfYWN0aXZlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG5cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuLy9pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG4vL2ltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5cbmltcG9ydCB7IFVzZXJEZXZpY2VzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC9kZXZpY2UuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV2aWNlLCBEZXZpY2UgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC9kZXZpY2UubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICB1c2VyRGV2aWNlc1ZhbGlkYXRpb246IGZ1bmN0aW9uICggX2RhdGEgOiBhbnkgKSB7XG4gICAgICAgICAgICB2YXIgX2RldmljZSA9IG5ldyBEZXZpY2UoKTtcbiAgICAgICAgICAgIHZhciBfdXNlckRldmljZSA9IFVzZXJEZXZpY2VzLmNvbGxlY3Rpb24uZmluZCh7dXNlcl9pZDogdGhpcy51c2VySWR9KTtcblxuICAgICAgICAgICAgX2RldmljZS5wbGF5ZXJfaWQgPSBfZGF0YS51c2VySWQ7XG4gICAgICAgICAgICBfZGV2aWNlLmlzX2FjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBfdXNlckRldmljZS5jb3VudCgpID09PSAwICkge1xuXG4gICAgICAgICAgICAgICAgVXNlckRldmljZXMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZCA6IE1ldGVvci51c2VySWQoKSxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlczogWyBfZGV2aWNlIF0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF91c2VyRGV2aWNlLmNvdW50KCkgPiAwICkge1xuICAgICAgICAgICAgICAgIF91c2VyRGV2aWNlLmZldGNoKCkuZm9yRWFjaCggKHVzcl9kZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9kZXZfdmFsID0gVXNlckRldmljZXMuY29sbGVjdGlvbi5maW5kKHsgXCJkZXZpY2VzLnBsYXllcl9pZFwiIDogX2RhdGEudXNlcklkIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV9kZXZfdmFsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJEZXZpY2VzLnVwZGF0ZSh7IF9pZCA6IHVzcl9kZXYuX2lkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAkYWRkVG9TZXQgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXM6ICBfZGV2aWNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJEZXZpY2VzLnVwZGF0ZSh7IFwiZGV2aWNlcy5wbGF5ZXJfaWRcIiA6IF9kYXRhLnVzZXJJZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJHNldCA6IHsgXCJkZXZpY2VzLiQuaXNfYWN0aXZlXCIgOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG4gICAgXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJMb2dpbiDCoH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1sb2dpbi5tb2RlbCc7XG5pbXBvcnQgeyBVc2Vyc0xvZ2luIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWxvZ2luLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSc7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIGluc2VydFVzZXJMb2dpbkluZm86IGZ1bmN0aW9uIChfcFVzZXJMb2dpbjogVXNlckxvZ2luKSB7XG4gICAgICAgICAgICBVc2Vyc0xvZ2luLmluc2VydChfcFVzZXJMb2dpbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hhbmdlVXNlclBhc3N3b3JkOiBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nLCBfbmV3UGFzc3dvcmQ6IHN0cmluZykge1xuICAgICAgICAgICAgQWNjb3VudHMuc2V0UGFzc3dvcmQoX3VzZXJJZCwgX25ld1Bhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXIubW9kZWwnO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsLCBVc2VyRGV0YWlsUGVuYWx0eSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFdhaXRlckNhbGxEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC93YWl0ZXItY2FsbC1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBUYWJsZSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3RhYmxlLm1vZGVsJztcbmltcG9ydCB7IFRhYmxlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyUGVuYWx0aWVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLXBlbmFsdHkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBwZW5hbGl6ZUN1c3RvbWVyOiBmdW5jdGlvbiAoX3BDdXN0b21lclVzZXI6IFVzZXIpIHtcbiAgICAgICAgICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3BDdXN0b21lclVzZXIuX2lkIH0pO1xuICAgICAgICAgICAgbGV0IF9sVXNlckRldGFpbFBlbmFsdHk6IFVzZXJEZXRhaWxQZW5hbHR5ID0geyBkYXRlOiBuZXcgRGF0ZSgpIH07XG4gICAgICAgICAgICBVc2VyRGV0YWlscy51cGRhdGUoeyBfaWQ6IF9sVXNlckRldGFpbC5faWQgfSwgeyAkcHVzaDogeyBwZW5hbHRpZXM6IF9sVXNlckRldGFpbFBlbmFsdHkgfSB9KTtcblxuICAgICAgICAgICAgbGV0IF9sVXNlckRldGFpbEF1eDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyBfaWQ6IF9sVXNlckRldGFpbC5faWQgfSk7XG4gICAgICAgICAgICBsZXQgX2xNYXhVc2VyUGVuYWx0aWVzOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnbWF4X3VzZXJfcGVuYWx0aWVzJyB9KTtcbiAgICAgICAgICAgIGlmIChfbFVzZXJEZXRhaWxBdXgucGVuYWx0aWVzLmxlbmd0aCA+PSBOdW1iZXIoX2xNYXhVc2VyUGVuYWx0aWVzLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGxldCBfbExhc3RfZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKE1hdGgubWF4LmFwcGx5KG51bGwsIF9sVXNlckRldGFpbEF1eC5wZW5hbHRpZXMubWFwKGZ1bmN0aW9uIChwKSB7IHJldHVybiBuZXcgRGF0ZShwLmRhdGUpOyB9KSkpO1xuICAgICAgICAgICAgICAgIFVzZXJQZW5hbHRpZXMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogX3BDdXN0b21lclVzZXIuX2lkLFxuICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfZGF0ZTogX2xMYXN0X2RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHBlbmFsdGllczogX2xVc2VyRGV0YWlsQXV4LnBlbmFsdGllc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFVzZXJEZXRhaWxzLnVwZGF0ZSh7IF9pZDogX2xVc2VyRGV0YWlsLl9pZCB9LCB7ICRzZXQ6IHsgcGVuYWx0aWVzOiBbXSB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRVc2VycyhfcFVzZXJGaWx0ZXI6IHN0cmluZyk6IGFueSB7XG4gICAgICAgICAgICBsZXQgX2xVc2Vyc0lkOiBzdHJpbmdbXSA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgbGV0IF9sVXNlckZpbHRlciA9IFVzZXJzLmNvbGxlY3Rpb24uZmluZCh7XG4gICAgICAgICAgICAgICAgJG9yOiBbeyBcInVzZXJuYW1lXCI6IHsgJHJlZ2V4OiBfcFVzZXJGaWx0ZXIgfSB9LFxuICAgICAgICAgICAgICAgIHsgXCJlbWFpbHMuYWRkcmVzc1wiOiB7ICRyZWdleDogX3BVc2VyRmlsdGVyIH0gfSxcbiAgICAgICAgICAgICAgICB7IFwicHJvZmlsZS5uYW1lXCI6IHsgJHJlZ2V4OiBfcFVzZXJGaWx0ZXIgfSB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoX2xVc2VyRmlsdGVyLmNvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgX2xVc2VyRmlsdGVyLmZvckVhY2goKHVzZXI6IFVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgX2xVc2Vyc0lkLnB1c2godXNlci5faWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9sVXNlcnNJZDtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSc7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLm1vZGVsJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuXG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBhZGRFbWFpbDogZnVuY3Rpb24gKCBuZXdFbWFpbCA6IHN0cmluZyApIHtcbiAgICAgICAgICAgIEFjY291bnRzLmFkZEVtYWlsKE1ldGVvci51c2VySWQoKSwgbmV3RW1haWwsIHRydWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICByZW1vdmVFbWFpbDogZnVuY3Rpb24gKCBvbGRFbWFpbCA6IHN0cmluZyApIHtcbiAgICAgICAgICAgIEFjY291bnRzLnJlbW92ZUVtYWlsKE1ldGVvci51c2VySWQoKSwgb2xkRW1haWwpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvdW50cnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9jb3VudHJ5Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgVGFibGVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC90YWJsZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvdGFibGUubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG5cbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIGdldENvdW50cnlCeUVzdGFibGlzaG1lbnRJZDogZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuXG4gICAgICAgICAgICBsZXQgdGFibGVzX2xlbmd0aDogbnVtYmVyO1xuICAgICAgICAgICAgbGV0IGNvdW50cnk6IENvdW50cnk7XG4gICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudDogRXN0YWJsaXNobWVudDtcblxuICAgICAgICAgICAgZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbiAgICAgICAgICAgIGNvdW50cnkgPSBDb3VudHJpZXMuZmluZE9uZSh7IF9pZDogZXN0YWJsaXNobWVudC5jb3VudHJ5SWQgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjb3VudHJ5Lm5hbWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IEVtYWlsIH0gZnJvbSAnbWV0ZW9yL2VtYWlsJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcbmltcG9ydCB7IExhbmdEaWN0aW9uYXJ5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvZW1haWwtY29udGVudC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFRhYmxlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBUYWJsZSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3RhYmxlLm1vZGVsJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGF5bWVudEhpc3RvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkubW9kZWwnO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci5tb2RlbCc7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuaW1wb3J0IHsgU1NSIH0gZnJvbSAnbWV0ZW9yL21ldGVvcmhhY2tzOnNzcic7XG5pbXBvcnQgeyBSZXdhcmRQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5tb2RlbCc7XG5pbXBvcnQgeyBSZXdhcmRQb2ludHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWwsIFVzZXJSZXdhcmRQb2ludHMgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gY2hhbmdlIHRoZSBmcmVlRGF5cyBmbGFnIHRvIGZhbHNlXG4gICAgICAgICAqICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICovXG5cbiAgICAgICAgY2hhbmdlRnJlZURheXNUb0ZhbHNlOiBmdW5jdGlvbiAoX2NvdW50cnlJZDogc3RyaW5nKSB7XG4gICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLnVwZGF0ZSh7IGNvdW50cnlJZDogX2NvdW50cnlJZCwgZnJlZURheXM6IHRydWUsIGlzX2JldGFfdGVzdGVyOiBmYWxzZSB9LCB7ICRzZXQ6IHsgZnJlZURheXM6IGZhbHNlIH0gfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gc2VuZCB0aGUgZW1haWwgdG8gd2FybiBmb3IgaXVyZXN0IGNoYXJnZSBzb29uXG4gICAgICAgICAqICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICovXG4gICAgICAgIHNlbmRFbWFpbENoYXJnZVNvb246IGZ1bmN0aW9uIChfY291bnRyeUlkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2Zyb21fZW1haWwnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdF91cmw6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2l1cmVzdF91cmwnIH0pO1xuICAgICAgICAgICAgbGV0IGZhY2Vib29rOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmYWNlYm9va19saW5rJyB9KTtcbiAgICAgICAgICAgIGxldCB0d2l0dGVyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICd0d2l0dGVyX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGluc3RhZ3JhbTogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaW5zdGFncmFtX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdEltZ1ZhcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X2ltZ191cmwnIH0pO1xuXG4gICAgICAgICAgICBsZXQgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgbGV0IGxhc3RNb250aERheSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCksIGN1cnJlbnREYXRlLmdldE1vbnRoKCkgKyAxLCAwKTtcbiAgICAgICAgICAgIGxldCBhdXhBcnJheTogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY291bnRyeUlkOiBfY291bnRyeUlkLCBpc0FjdGl2ZTogdHJ1ZSwgaXNfYmV0YV90ZXN0ZXI6IGZhbHNlIH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgIGxldCB1c2VyOiBVc2VyID0gVXNlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBlc3RhYmxpc2htZW50LmNyZWF0aW9uX3VzZXIgfSk7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4b2Z2YXIgPSBhdXhBcnJheS5pbmRleE9mKHVzZXIuX2lkKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleG9mdmFyIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBhdXhBcnJheS5wdXNoKHVzZXIuX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgVXNlcnMuY29sbGVjdGlvbi5maW5kKHsgX2lkOiB7ICRpbjogYXV4QXJyYXkgfSB9KS5mb3JFYWNoKCh1c2VyOiBVc2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGF1eEVzdGFibGlzaG1lbnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IGNyZWF0aW9uX3VzZXI6IHVzZXIuX2lkLCBpc19iZXRhX3Rlc3RlcjogZmFsc2UgfSwgeyBmaWVsZHM6IHsgX2lkOiAwLCBuYW1lOiAxIH0gfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4obmFtZSwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1eEVzdGFibGlzaG1lbnRzLnB1c2gobmFtZS5uYW1lKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGxldCBlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCA9IEVtYWlsQ29udGVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgbGFuZ3VhZ2U6IHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlIH0pO1xuICAgICAgICAgICAgICAgIGxldCBncmVldFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnZ3JlZXRWYXInKTtcbiAgICAgICAgICAgICAgICBsZXQgZ3JlZXRpbmc6IHN0cmluZyA9ICh1c2VyLnByb2ZpbGUgJiYgdXNlci5wcm9maWxlLmZpcnN0X25hbWUpID8gKGdyZWV0VmFyICsgJyAnICsgdXNlci5wcm9maWxlLmZpcnN0X25hbWUgKyBcIixcIikgOiBncmVldFZhcjtcbiAgICAgICAgICAgICAgICBTU1IuY29tcGlsZVRlbXBsYXRlKCdjaGFyZ2VTb29uRW1haWxIdG1sJywgQXNzZXRzLmdldFRleHQoJ2NoYXJnZS1zb29uLWVtYWlsLmh0bWwnKSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZW1haWxEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBncmVldGluZzogZ3JlZXRpbmcsXG4gICAgICAgICAgICAgICAgICAgIHJlbWluZGVyTXNnVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlbWluZGVyQ2hhcmdlU29vbk1zZ1ZhcicpLFxuICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50TGlzdFZhcjogYXV4RXN0YWJsaXNobWVudHMudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgcmVtaW5kZXJNc2dWYXIyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlbWluZGVyQ2hhcmdlU29vbk1zZ1ZhcjInKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVZhcjogTWV0ZW9yLmNhbGwoJ2NvbnZlcnREYXRlVG9TaW1wbGUnLCBsYXN0TW9udGhEYXkpLFxuICAgICAgICAgICAgICAgICAgICByZWdhcmRWYXI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVnYXJkVmFyJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbGxvd01zZ1ZhcjogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdmb2xsb3dNc2dWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgaXVyZXN0VXJsOiBpdXJlc3RfdXJsLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBmYWNlYm9va0xpbms6IGZhY2Vib29rLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTGluazogdHdpdHRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFncmFtTGluazogaW5zdGFncmFtLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpdXJlc3RJbWdWYXI6IGl1cmVzdEltZ1Zhci52YWx1ZVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIEVtYWlsLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICB0bzogdXNlci5lbWFpbHNbMF0uYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgZnJvbTogcGFyYW1ldGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBzdWJqZWN0OiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2NoYXJnZVNvb25FbWFpbFN1YmplY3RWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDogU1NSLnJlbmRlcignY2hhcmdlU29vbkVtYWlsSHRtbCcsIGVtYWlsRGF0YSksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gc2VuZCB0aGUgZW1haWwgdG8gd2FybiBmb3IgaXVyZXN0IGV4cGlyZSBzb29uXG4gICAgICAgICAqICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICovXG4gICAgICAgIHNlbmRFbWFpbEV4cGlyZVNvb246IGZ1bmN0aW9uIChfY291bnRyeUlkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2Zyb21fZW1haWwnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdF91cmw6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2l1cmVzdF91cmwnIH0pO1xuICAgICAgICAgICAgbGV0IGZhY2Vib29rOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmYWNlYm9va19saW5rJyB9KTtcbiAgICAgICAgICAgIGxldCB0d2l0dGVyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICd0d2l0dGVyX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGluc3RhZ3JhbTogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaW5zdGFncmFtX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdEltZ1ZhcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X2ltZ191cmwnIH0pO1xuXG4gICAgICAgICAgICBsZXQgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgbGV0IGZpcnN0TW9udGhEYXkgPSBuZXcgRGF0ZShjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLCBjdXJyZW50RGF0ZS5nZXRNb250aCgpLCAxKTtcbiAgICAgICAgICAgIGxldCBtYXhQYXltZW50RGF5ID0gbmV3IERhdGUoZmlyc3RNb250aERheSk7XG4gICAgICAgICAgICBsZXQgZW5kRGF5ID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZW5kX3BheW1lbnRfZGF5JyB9KTtcbiAgICAgICAgICAgIG1heFBheW1lbnREYXkuc2V0RGF0ZShtYXhQYXltZW50RGF5LmdldERhdGUoKSArIChOdW1iZXIoZW5kRGF5LnZhbHVlKSAtIDEpKTtcbiAgICAgICAgICAgIGxldCBhdXhBcnJheTogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY291bnRyeUlkOiBfY291bnRyeUlkLCBpc0FjdGl2ZTogdHJ1ZSwgZnJlZURheXM6IGZhbHNlLCBpc19iZXRhX3Rlc3RlcjogZmFsc2UgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgbGV0IHVzZXI6IFVzZXIgPSBVc2Vycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnQuY3JlYXRpb25fdXNlciB9KTtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXhvZnZhciA9IGF1eEFycmF5LmluZGV4T2YodXNlci5faWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4b2Z2YXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1eEFycmF5LnB1c2godXNlci5faWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBVc2Vycy5jb2xsZWN0aW9uLmZpbmQoeyBfaWQ6IHsgJGluOiBhdXhBcnJheSB9IH0pLmZvckVhY2goKHVzZXI6IFVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYXV4RXN0YWJsaXNobWVudHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY3JlYXRpb25fdXNlcjogdXNlci5faWQsIGlzQWN0aXZlOiB0cnVlLCBmcmVlRGF5czogZmFsc2UsIGlzX2JldGFfdGVzdGVyOiBmYWxzZSB9LCB7IGZpZWxkczogeyBfaWQ6IDAsIG5hbWU6IDEgfSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50PihuYW1lLCBpbmRleCwgYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV4RXN0YWJsaXNobWVudHMucHVzaChuYW1lLm5hbWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVtYWlsQ29udGVudDogRW1haWxDb250ZW50ID0gRW1haWxDb250ZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBsYW5ndWFnZTogdXNlci5wcm9maWxlLmxhbmd1YWdlX2NvZGUgfSk7XG4gICAgICAgICAgICAgICAgbGV0IGdyZWV0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdncmVldFZhcicpO1xuICAgICAgICAgICAgICAgIGxldCBncmVldGluZzogc3RyaW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSkgPyAoZ3JlZXRWYXIgKyAnICcgKyB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSArIFwiLFwiKSA6IGdyZWV0VmFyO1xuICAgICAgICAgICAgICAgIFNTUi5jb21waWxlVGVtcGxhdGUoJ2V4cGlyZVNvb25FbWFpbEh0bWwnLCBBc3NldHMuZ2V0VGV4dCgnZXhwaXJlLXNvb24tZW1haWwuaHRtbCcpKTtcblxuICAgICAgICAgICAgICAgIHZhciBlbWFpbERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGdyZWV0aW5nOiBncmVldGluZyxcbiAgICAgICAgICAgICAgICAgICAgcmVtaW5kZXJNc2dWYXI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyJyksXG4gICAgICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRMaXN0VmFyOiBhdXhFc3RhYmxpc2htZW50cy50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyMicpLFxuICAgICAgICAgICAgICAgICAgICBkYXRlVmFyOiBNZXRlb3IuY2FsbCgnY29udmVydERhdGVUb1NpbXBsZScsIG1heFBheW1lbnREYXkpLFxuICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjM6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyMycpLFxuICAgICAgICAgICAgICAgICAgICByZWdhcmRWYXI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVnYXJkVmFyJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbGxvd01zZ1ZhcjogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdmb2xsb3dNc2dWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgaXVyZXN0VXJsOiBpdXJlc3RfdXJsLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBmYWNlYm9va0xpbms6IGZhY2Vib29rLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTGluazogdHdpdHRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFncmFtTGluazogaW5zdGFncmFtLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpdXJlc3RJbWdWYXI6IGl1cmVzdEltZ1Zhci52YWx1ZVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIEVtYWlsLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICB0bzogdXNlci5lbWFpbHNbMF0uYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgZnJvbTogcGFyYW1ldGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBzdWJqZWN0OiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2V4cGlyZVNvb25FbWFpbFN1YmplY3RWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDogU1NSLnJlbmRlcignZXhwaXJlU29vbkVtYWlsSHRtbCcsIGVtYWlsRGF0YSksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gdmFsaWRhdGUgdGhlIGVzdGFibGlzaG1lbnQgcmVnaXN0ZXJlZCBpbiBoaXN0b3J5X3BheW1lbnQgYW5kIGNoYW5nZSBpc0FjdGl2ZSB0byBmYWxzZSBpZiBpcyBub3QgXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBfY291bnRyeUlkXG4gICAgICAgICAqL1xuICAgICAgICB2YWxpZGF0ZUFjdGl2ZUVzdGFibGlzaG1lbnRzOiBmdW5jdGlvbiAoX2NvdW50cnlJZDogc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudERhdGU6IERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRNb250aDogc3RyaW5nID0gKGN1cnJlbnREYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRZZWFyOiBzdHJpbmcgPSBjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IGNvdW50cnlJZDogX2NvdW50cnlJZCwgaXNBY3RpdmU6IHRydWUsIGZyZWVEYXlzOiBmYWxzZSwgaXNfYmV0YV90ZXN0ZXI6IGZhbHNlIH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgIGxldCBoaXN0b3J5UGF5bWVudDogUGF5bWVudEhpc3Rvcnk7XG4gICAgICAgICAgICAgICAgbGV0IGF1eEFycmF5OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGF1eEFycmF5LnB1c2goZXN0YWJsaXNobWVudC5faWQpO1xuICAgICAgICAgICAgICAgIC8vaGlzdG9yeVBheW1lbnQgPSBIaXN0b3J5UGF5bWVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgZXN0YWJsaXNobWVudF9pZHM6IGVzdGFibGlzaG1lbnQuX2lkLCBtb250aDogY3VycmVudE1vbnRoLCB5ZWFyOiBjdXJyZW50WWVhciwgc3RhdHVzOiAnQVBQUk9WRUQnIH0pO1xuICAgICAgICAgICAgICAgIGhpc3RvcnlQYXltZW50ID0gUGF5bWVudHNIaXN0b3J5LmNvbGxlY3Rpb24uZmluZE9uZSh7IGVzdGFibGlzaG1lbnRfaWRzOiB7ICRpbjogYXV4QXJyYXkgfSwgbW9udGg6IGN1cnJlbnRNb250aCwgeWVhcjogY3VycmVudFllYXIsIHN0YXR1czogJ1RSQU5TQUNUSU9OX1NUQVRVUy5BUFBST1ZFRCcgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWhpc3RvcnlQYXltZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24udXBkYXRlKHsgX2lkOiBlc3RhYmxpc2htZW50Ll9pZCwgaXNfYmV0YV90ZXN0ZXI6IGZhbHNlIH0sIHsgJHNldDogeyBpc0FjdGl2ZTogZmFsc2UsIGZpcnN0UGF5OiBmYWxzZSB9IH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIFRhYmxlcy5jb2xsZWN0aW9uLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBlc3RhYmxpc2htZW50Ll9pZCB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxUYWJsZT4odGFibGUsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVzLmNvbGxlY3Rpb24udXBkYXRlKHsgX2lkOiB0YWJsZS5faWQgfSwgeyAkc2V0OiB7IGlzX2FjdGl2ZTogZmFsc2UgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIHNlbmQgZW1haWwgdG8gd2FybiB0aGF0IHRoZSBzZXJ2aWNlIGhhcyBleHBpcmVkXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBfY291bnRyeUlkXG4gICAgICAgICAqL1xuICAgICAgICBzZW5kRW1haWxSZXN0RXhwaXJlZDogZnVuY3Rpb24gKF9jb3VudHJ5SWQ6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IHBhcmFtZXRlcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZnJvbV9lbWFpbCcgfSk7XG4gICAgICAgICAgICBsZXQgaXVyZXN0X3VybDogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X3VybCcgfSk7XG4gICAgICAgICAgICBsZXQgZmFjZWJvb2s6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2ZhY2Vib29rX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IHR3aXR0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ3R3aXR0ZXJfbGluaycgfSk7XG4gICAgICAgICAgICBsZXQgaW5zdGFncmFtOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpbnN0YWdyYW1fbGluaycgfSk7XG4gICAgICAgICAgICBsZXQgaXVyZXN0SW1nVmFyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpdXJlc3RfaW1nX3VybCcgfSk7XG5cbiAgICAgICAgICAgIGxldCBhdXhBcnJheTogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY291bnRyeUlkOiBfY291bnRyeUlkLCBpc0FjdGl2ZTogZmFsc2UsIGZyZWVEYXlzOiBmYWxzZSwgZmlyc3RQYXk6IGZhbHNlLCBpc19iZXRhX3Rlc3RlcjogZmFsc2UgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgbGV0IHVzZXI6IFVzZXIgPSBVc2Vycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnQuY3JlYXRpb25fdXNlciB9KTtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXhvZnZhciA9IGF1eEFycmF5LmluZGV4T2YodXNlci5faWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4b2Z2YXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1eEFycmF5LnB1c2godXNlci5faWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBVc2Vycy5jb2xsZWN0aW9uLmZpbmQoeyBfaWQ6IHsgJGluOiBhdXhBcnJheSB9IH0pLmZvckVhY2goKHVzZXI6IFVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYXV4RXN0YWJsaXNobWVudHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY3JlYXRpb25fdXNlcjogdXNlci5faWQsIGlzQWN0aXZlOiBmYWxzZSwgZnJlZURheXM6IGZhbHNlLCBmaXJzdFBheTogZmFsc2UsIGlzX2JldGFfdGVzdGVyOiBmYWxzZSB9LCB7IGZpZWxkczogeyBfaWQ6IDAsIG5hbWU6IDEgfSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50PihuYW1lLCBpbmRleCwgYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV4RXN0YWJsaXNobWVudHMucHVzaChuYW1lLm5hbWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVtYWlsQ29udGVudDogRW1haWxDb250ZW50ID0gRW1haWxDb250ZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBsYW5ndWFnZTogdXNlci5wcm9maWxlLmxhbmd1YWdlX2NvZGUgfSk7XG4gICAgICAgICAgICAgICAgbGV0IGdyZWV0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdncmVldFZhcicpO1xuICAgICAgICAgICAgICAgIGxldCBncmVldGluZzogc3RyaW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSkgPyAoZ3JlZXRWYXIgKyAnICcgKyB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSArIFwiLFwiKSA6IGdyZWV0VmFyO1xuICAgICAgICAgICAgICAgIFNTUi5jb21waWxlVGVtcGxhdGUoJ3Jlc3RFeHBpcmVkRW1haWxIdG1sJywgQXNzZXRzLmdldFRleHQoJ3Jlc3QtZXhwaXJlZC1lbWFpbC5odG1sJykpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGVtYWlsRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZ3JlZXRpbmc6IGdyZWV0aW5nLFxuICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdyZW1pbmRlclJlc3RFeHBpcmVkVmFyJyksXG4gICAgICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRMaXN0VmFyOiBhdXhFc3RhYmxpc2htZW50cy50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJSZXN0RXhwaXJlZFZhcjInKSxcbiAgICAgICAgICAgICAgICAgICAgcmVtaW5kZXJNc2dWYXIzOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlbWluZGVyUmVzdEV4cGlyZWRWYXIzJyksXG4gICAgICAgICAgICAgICAgICAgIHJlZ2FyZFZhcjogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdyZWdhcmRWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgZm9sbG93TXNnVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2ZvbGxvd01zZ1ZhcicpLFxuICAgICAgICAgICAgICAgICAgICBpdXJlc3RVcmw6IGl1cmVzdF91cmwudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGZhY2Vib29rTGluazogZmFjZWJvb2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR3aXR0ZXJMaW5rOiB0d2l0dGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YWdyYW1MaW5rOiBpbnN0YWdyYW0udmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGl1cmVzdEltZ1ZhcjogaXVyZXN0SW1nVmFyLnZhbHVlXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgRW1haWwuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgIHRvOiB1c2VyLmVtYWlsc1swXS5hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBmcm9tOiBwYXJhbWV0ZXIudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHN1YmplY3Q6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVzdEV4cGlyZWRFbWFpbFN1YmplY3RWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgaHRtbDogU1NSLnJlbmRlcigncmVzdEV4cGlyZWRFbWFpbEh0bWwnLCBlbWFpbERhdGEpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGdldHMgdGhlIHZhbHVlIGZyb20gRW1haWxDb250ZW50IGNvbGxlY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RW1haWxDb250ZW50KF9sYW5nRGljdGlvbmFyeTogTGFuZ0RpY3Rpb25hcnlbXSwgX2xhYmVsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gX2xhbmdEaWN0aW9uYXJ5LmZpbHRlcihmdW5jdGlvbiAod29yZFRyYWR1Y2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmRUcmFkdWNlZC5sYWJlbCA9PSBfbGFiZWw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVswXS50cmFkdWN0aW9uO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBjb252ZXJ0IHRoZSBkYXkgYW5kIHJldHVybmluZyBpbiBmb3JtYXQgeXl5eS1tLWRcbiAgICAgICAgICogQHBhcmFtIHtEYXRlfSBfZGF0ZVxuICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBjb252ZXJ0RGF0ZVRvU2ltcGxlOiBmdW5jdGlvbiAoX2RhdGU6IERhdGUpIHtcbiAgICAgICAgICAgIGxldCB5ZWFyID0gX2RhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIGxldCBtb250aCA9IF9kYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgbGV0IGRheSA9IF9kYXRlLmdldERhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBkYXkudG9TdHJpbmcoKSArICcvJyArIG1vbnRoLnRvU3RyaW5nKCkgKyAnLycgKyB5ZWFyLnRvU3RyaW5nKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIHZhbGlkYXRlIHRoZSBkYXRlIG9mIHBvaW50cyB0byBleHBpcmUgXG4gICAgICAgICAqL1xuICAgICAgICBjaGVja1BvaW50c1RvRXhwaXJlKF9jb3VudHJ5SWQ6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY291bnRyeUlkOiBfY291bnRyeUlkIH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgIFJld2FyZFBvaW50cy5jb2xsZWN0aW9uLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBlc3RhYmxpc2htZW50Ll9pZCwgaXNfYWN0aXZlOiB0cnVlIH0pLmZvckVhY2goZnVuY3Rpb24gPFJld2FyZFBvaW50PihyZXdhcmRQb2ludCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXdhcmRQb2ludERheU1vcmUgPSByZXdhcmRQb2ludC5leHBpcmVfZGF0ZS5nZXREYXRlKCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmV3YXJkUG9pbnREYXRlID0gbmV3IERhdGUocmV3YXJkUG9pbnQuZXhwaXJlX2RhdGUuZ2V0RnVsbFllYXIoKSwgcmV3YXJkUG9pbnQuZXhwaXJlX2RhdGUuZ2V0TW9udGgoKSwgcmV3YXJkUG9pbnREYXlNb3JlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoKHJld2FyZFBvaW50RGF0ZS5nZXRGdWxsWWVhcigpID09PSBjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKHJld2FyZFBvaW50RGF0ZS5nZXRNb250aCgpID09PSBjdXJyZW50RGF0ZS5nZXRNb250aCgpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKHJld2FyZFBvaW50RGF0ZS5nZXREYXRlKCkgPT09IGN1cnJlbnREYXRlLmdldERhdGUoKSkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlVG9TdWJ0cmFjdDogbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJld2FyZFBvaW50LmRpZmZlcmVuY2UgPT09IDAgfHwgcmV3YXJkUG9pbnQuZGlmZmVyZW5jZSA9PT0gbnVsbCB8fCByZXdhcmRQb2ludC5kaWZmZXJlbmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVRvU3VidHJhY3QgPSByZXdhcmRQb2ludC5wb2ludHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlVG9TdWJ0cmFjdCA9IHJld2FyZFBvaW50LmRpZmZlcmVuY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFJld2FyZFBvaW50cy5jb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogcmV3YXJkUG9pbnQuX2lkIH0sIHsgJHNldDogeyBpc19hY3RpdmU6IGZhbHNlIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXNlckRldGFpbDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiByZXdhcmRQb2ludC5pZF91c2VyIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVzZXJSZXdhcmRQb2ludHM6IFVzZXJSZXdhcmRQb2ludHMgPSB1c2VyRGV0YWlsLnJld2FyZF9wb2ludHMuZmluZCh1c3JQb2ludHMgPT4gdXNyUG9pbnRzLmVzdGFibGlzaG1lbnRfaWQgPT09IHJld2FyZFBvaW50LmVzdGFibGlzaG1lbnRfaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBVc2VyRGV0YWlscy51cGRhdGUoeyB1c2VyX2lkOiByZXdhcmRQb2ludC5pZF91c2VyLCAncmV3YXJkX3BvaW50cy5lc3RhYmxpc2htZW50X2lkJzogcmV3YXJkUG9pbnQuZXN0YWJsaXNobWVudF9pZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJHNldDogeyAncmV3YXJkX3BvaW50cy4kLnBvaW50cyc6ICh1c2VyUmV3YXJkUG9pbnRzLnBvaW50cyAtIHZhbHVlVG9TdWJ0cmFjdCkgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ291bnRyaWVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSW52b2ljZXNJbmZvIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ3lnSW52b2ljZXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wYXltZW50L2N5Zy1pbnZvaWNlcy5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvbXBhbnlJbmZvLCBDbGllbnRJbmZvLCBFc3RhYmxpc2htZW50SW5mbyB9IGZyb20gJy4uLy4uL21vZGVscy9wYXltZW50L2N5Zy1pbnZvaWNlLm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQmFnUGxhbnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLmNvbGxlY3Rpb24nO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBhbGxvdyBnZW5lcmF0ZSBpdXJlc3QgaW52b2ljZSBmb3IgYWRtaW4gZXN0YWJsaXNobWVudFxuICAgICAgICAgKiBAcGFyYW0geyBzdHJpbmcgfSBfcGF5bWVudEhpc3RvcnlJZFxuICAgICAgICAgKiBAcGFyYW0geyBzdHJpbmcgfSBfdXNlcklkIFxuICAgICAgICAgKi9cbiAgICAgICAgZ2VuZXJhdGVJbnZvaWNlSW5mbzogZnVuY3Rpb24gKF9wYXltZW50SGlzdG9yeUlkOiBzdHJpbmcsIF91c2VySWQ6IHN0cmluZykge1xuXG4gICAgICAgICAgICBsZXQgX2N1cnJlbnREYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGxldCBfZmlyc3RNb250aERheTogRGF0ZSA9IG5ldyBEYXRlKF9jdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLCBfY3VycmVudERhdGUuZ2V0TW9udGgoKSwgMSk7XG4gICAgICAgICAgICBsZXQgX2xhc3RNb250aERheTogRGF0ZSA9IG5ldyBEYXRlKF9jdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLCBfY3VycmVudERhdGUuZ2V0TW9udGgoKSArIDEsIDApO1xuXG4gICAgICAgICAgICBsZXQgbFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcbiAgICAgICAgICAgIGxldCBsQ291bnRyeSA9IENvdW50cmllcy5maW5kT25lKHsgX2lkOiBsVXNlckRldGFpbC5jb3VudHJ5X2lkIH0pO1xuICAgICAgICAgICAgbGV0IGxQYXltZW50SGlzdG9yeSA9IFBheW1lbnRzSGlzdG9yeS5maW5kT25lKHsgX2lkOiBfcGF5bWVudEhpc3RvcnlJZCB9KTtcbiAgICAgICAgICAgIGxldCBpbnZvaWNlSW5mbyA9IEludm9pY2VzSW5mby5maW5kT25lKHsgY291bnRyeV9pZDogbENvdW50cnkuX2lkIH0pO1xuXG4gICAgICAgICAgICBsZXQgdmFyX3Jlc29sdXRpb246IHN0cmluZztcbiAgICAgICAgICAgIGxldCB2YXJfcHJlZml4OiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdmFyX3N0YXJ0X3ZhbHVlOiBudW1iZXI7XG4gICAgICAgICAgICBsZXQgdmFyX2N1cnJlbnRfdmFsdWU6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCB2YXJfZW5kX3ZhbHVlOiBudW1iZXI7XG4gICAgICAgICAgICBsZXQgdmFyX3N0YXJ0X2RhdGU6IERhdGU7XG4gICAgICAgICAgICBsZXQgdmFyX2VuZF9kYXRlOiBEYXRlO1xuICAgICAgICAgICAgbGV0IHZhcl9lbmFibGVfdHdvOiBib29sZWFuO1xuICAgICAgICAgICAgbGV0IHZhcl9zdGFydF9uZXc6IGJvb2xlYW47XG5cbiAgICAgICAgICAgIGxldCBjb21wYW55X25hbWUgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9uYW1lJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X2FkZHJlc3MgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9hZGRyZXNzJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X3Bob25lID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfcGhvbmUnIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfY291bnRyeSA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2NvdW50cnknIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfY2l0eSA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2NpdHknIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfbml0ID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfbml0JyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X3JlZ2ltZSA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X3JlZ2ltZScgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9jb250cmlidXRpb24gPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9jb250cmlidXRpb24nIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfcmV0YWluZXIgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9yZXRhaW5lcicgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9hZ2VudF9yZXRhaW5lciA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2FnZW50X3JldGFpbmVyJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBpbnZvaWNlX2dlbmVyYXRlZF9tc2cgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnaW52b2ljZV9nZW5lcmF0ZWRfbXNnJyB9KS52YWx1ZTtcblxuICAgICAgICAgICAgbGV0IGVzdGFibGlzaG1lbnRzSW5mb0FycmF5OiBFc3RhYmxpc2htZW50SW5mb1tdID0gW107XG5cbiAgICAgICAgICAgIC8vR2VuZXJhdGUgY29uc2VjdXRpdmVcbiAgICAgICAgICAgIGlmIChpbnZvaWNlSW5mby5lbmFibGVfdHdvID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGludm9pY2VJbmZvLnN0YXJ0X25ld192YWx1ZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9jdXJyZW50X3ZhbHVlID0gaW52b2ljZUluZm8uc3RhcnRfdmFsdWVfb25lO1xuICAgICAgICAgICAgICAgICAgICB2YXJfZW5hYmxlX3R3byA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXJfc3RhcnRfbmV3ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyX2N1cnJlbnRfdmFsdWUgPSBpbnZvaWNlSW5mby5jdXJyZW50X3ZhbHVlICsgMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhcl9jdXJyZW50X3ZhbHVlID09IGludm9pY2VJbmZvLmVuZF92YWx1ZV9vbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9lbmFibGVfdHdvID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX2VuYWJsZV90d28gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXJfcmVzb2x1dGlvbiA9IGludm9pY2VJbmZvLnJlc29sdXRpb25fb25lO1xuICAgICAgICAgICAgICAgIHZhcl9wcmVmaXggPSBpbnZvaWNlSW5mby5wcmVmaXhfb25lO1xuICAgICAgICAgICAgICAgIHZhcl9zdGFydF92YWx1ZSA9IGludm9pY2VJbmZvLnN0YXJ0X3ZhbHVlX29uZTtcbiAgICAgICAgICAgICAgICB2YXJfZW5kX3ZhbHVlID0gaW52b2ljZUluZm8uZW5kX3ZhbHVlX29uZTtcbiAgICAgICAgICAgICAgICB2YXJfc3RhcnRfZGF0ZSA9IGludm9pY2VJbmZvLnN0YXJ0X2RhdGVfb25lO1xuICAgICAgICAgICAgICAgIHZhcl9lbmRfZGF0ZSA9IGludm9pY2VJbmZvLmVuZF9kYXRlX29uZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGludm9pY2VJbmZvLnN0YXJ0X25ld192YWx1ZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9jdXJyZW50X3ZhbHVlID0gaW52b2ljZUluZm8uc3RhcnRfdmFsdWVfdHdvO1xuICAgICAgICAgICAgICAgICAgICB2YXJfZW5hYmxlX3R3byA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXJfY3VycmVudF92YWx1ZSA9IGludm9pY2VJbmZvLmN1cnJlbnRfdmFsdWUgKyAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFyX2N1cnJlbnRfdmFsdWUgPT0gaW52b2ljZUluZm8uZW5kX3ZhbHVlX3R3bykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX2VuYWJsZV90d28gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX2VuYWJsZV90d28gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX3N0YXJ0X25ldyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhcl9yZXNvbHV0aW9uID0gaW52b2ljZUluZm8ucmVzb2x1dGlvbl90d287XG4gICAgICAgICAgICAgICAgdmFyX3ByZWZpeCA9IGludm9pY2VJbmZvLnByZWZpeF90d287XG4gICAgICAgICAgICAgICAgdmFyX3N0YXJ0X3ZhbHVlID0gaW52b2ljZUluZm8uc3RhcnRfdmFsdWVfdHdvO1xuICAgICAgICAgICAgICAgIHZhcl9lbmRfdmFsdWUgPSBpbnZvaWNlSW5mby5lbmRfdmFsdWVfdHdvO1xuICAgICAgICAgICAgICAgIHZhcl9zdGFydF9kYXRlID0gaW52b2ljZUluZm8uc3RhcnRfZGF0ZV90d287XG4gICAgICAgICAgICAgICAgdmFyX2VuZF9kYXRlID0gaW52b2ljZUluZm8uZW5kX2RhdGVfdHdvO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBJbnZvaWNlc0luZm8uY29sbGVjdGlvbi51cGRhdGUoeyBfaWQ6IGludm9pY2VJbmZvLl9pZCB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF92YWx1ZTogdmFyX2N1cnJlbnRfdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVfdHdvOiB2YXJfZW5hYmxlX3R3byxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0X25ld192YWx1ZTogdmFyX3N0YXJ0X25ld1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBjb21wYW55X2luZm86IENvbXBhbnlJbmZvID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGNvbXBhbnlfbmFtZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBjb21wYW55X2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgcGhvbmU6IGNvbXBhbnlfcGhvbmUsXG4gICAgICAgICAgICAgICAgY291bnRyeTogY29tcGFueV9jb3VudHJ5LFxuICAgICAgICAgICAgICAgIGNpdHk6IGNvbXBhbnlfY2l0eSxcbiAgICAgICAgICAgICAgICBuaXQ6IGNvbXBhbnlfbml0LFxuICAgICAgICAgICAgICAgIHJlZ2ltZTogY29tcGFueV9yZWdpbWUsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBjb21wYW55X2NvbnRyaWJ1dGlvbixcbiAgICAgICAgICAgICAgICByZXRhaW5lcjogY29tcGFueV9yZXRhaW5lcixcbiAgICAgICAgICAgICAgICBhZ2VudF9yZXRhaW50ZXI6IGNvbXBhbnlfYWdlbnRfcmV0YWluZXIsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9udW1iZXI6IHZhcl9yZXNvbHV0aW9uLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fcHJlZml4OiB2YXJfcHJlZml4LFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fc3RhcnRfZGF0ZTogdmFyX3N0YXJ0X2RhdGUsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9lbmRfZGF0ZTogdmFyX2VuZF9kYXRlLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fc3RhcnRfdmFsdWU6IHZhcl9zdGFydF92YWx1ZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fZW5kX3ZhbHVlOiB2YXJfZW5kX3ZhbHVlLnRvU3RyaW5nKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxldCBjbGllbnRfaW5mbzogQ2xpZW50SW5mbyA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBNZXRlb3IudXNlcigpLnByb2ZpbGUuZnVsbF9uYW1lLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IGxVc2VyRGV0YWlsLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgY291bnRyeTogbENvdW50cnkubmFtZSxcbiAgICAgICAgICAgICAgICBjaXR5OiBsVXNlckRldGFpbC5jaXR5X2lkLFxuICAgICAgICAgICAgICAgIGlkZW50aWZpY2F0aW9uOiBsVXNlckRldGFpbC5kbmlfbnVtYmVyLFxuICAgICAgICAgICAgICAgIHBob25lOiBsVXNlckRldGFpbC5jb250YWN0X3Bob25lLFxuICAgICAgICAgICAgICAgIGVtYWlsOiBNZXRlb3IudXNlcigpLmVtYWlsc1swXS5hZGRyZXNzXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsUGF5bWVudEhpc3RvcnkuZXN0YWJsaXNobWVudF9pZHMuZm9yRWFjaCgoZXN0YWJsaXNobWVudEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudEluZm86IEVzdGFibGlzaG1lbnRJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50X25hbWU6IEVzdGFibGlzaG1lbnRzLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnRFbGVtZW50LmVzdGFibGlzaG1lbnRJZCB9KS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBiYWdfcGxhbl9uYW1lOiBCYWdQbGFucy5maW5kT25lKHsgX2lkOiBlc3RhYmxpc2htZW50RWxlbWVudC5iYWdQbGFuSWQgfSkubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYmFnX3BsYW5fY3VycmVuY3k6IGVzdGFibGlzaG1lbnRFbGVtZW50LmJhZ1BsYW5DdXJyZW5jeSxcbiAgICAgICAgICAgICAgICAgICAgYmFnX3BsYW5fcG9pbnRzOiBlc3RhYmxpc2htZW50RWxlbWVudC5iYWdQbGFuUG9pbnRzLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIGJhZ19wbGFuX3ByaWNlOiBlc3RhYmxpc2htZW50RWxlbWVudC5iYWdQbGFuUHJpY2UudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0X3BvaW50czogZXN0YWJsaXNobWVudEVsZW1lbnQuY3JlZGl0UG9pbnRzLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdF9wcmljZTogZXN0YWJsaXNobWVudEVsZW1lbnQuY3JlZGl0UHJpY2UudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudHNJbmZvQXJyYXkucHVzaChlc3RhYmxpc2htZW50SW5mbyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgQ3lnSW52b2ljZXMuY29sbGVjdGlvbi5pbnNlcnQoe1xuICAgICAgICAgICAgICAgIGNyZWF0aW9uX3VzZXI6IE1ldGVvci51c2VySWQoKSxcbiAgICAgICAgICAgICAgICBjcmVhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIHBheW1lbnRfaGlzdG9yeV9pZDogbFBheW1lbnRIaXN0b3J5Ll9pZCxcbiAgICAgICAgICAgICAgICBjb3VudHJ5X2lkOiBsQ291bnRyeS5faWQsXG4gICAgICAgICAgICAgICAgbnVtYmVyOiB2YXJfY3VycmVudF92YWx1ZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBwYXltZW50X21ldGhvZDogJ1JFU19QQVlNRU5UX0hJU1RPUlkuQ0NfUEFZTUVOVF9NRVRIT0QnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUkVTX1BBWU1FTlRfSElTVE9SWS5ERVNDUklQVElPTicsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBfZmlyc3RNb250aERheS5nZXREYXRlKCkgKyAnLycgKyAoX2ZpcnN0TW9udGhEYXkuZ2V0TW9udGgoKSArIDEpICsgJy8nICsgX2ZpcnN0TW9udGhEYXkuZ2V0RnVsbFllYXIoKSArXG4gICAgICAgICAgICAgICAgICAgICcgLSAnICsgX2xhc3RNb250aERheS5nZXREYXRlKCkgKyAnLycgKyAoX2xhc3RNb250aERheS5nZXRNb250aCgpICsgMSkgKyAnLycgKyBfbGFzdE1vbnRoRGF5LmdldEZ1bGxZZWFyKCksXG4gICAgICAgICAgICAgICAgYW1vdW50X25vX2l2YTogTWV0ZW9yLmNhbGwoJ2dldFJldHVybkJhc2UnLCBsUGF5bWVudEhpc3RvcnkucGF5bWVudFZhbHVlKS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHN1YnRvdGFsOiBcIjBcIixcbiAgICAgICAgICAgICAgICBpdmE6IFwiMFwiLFxuICAgICAgICAgICAgICAgIHRvdGFsOiBsUGF5bWVudEhpc3RvcnkucGF5bWVudFZhbHVlLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgY3VycmVuY3k6IGxQYXltZW50SGlzdG9yeS5jdXJyZW5jeSxcbiAgICAgICAgICAgICAgICBjb21wYW55X2luZm86IGNvbXBhbnlfaW5mbyxcbiAgICAgICAgICAgICAgICBjbGllbnRfaW5mbzogY2xpZW50X2luZm8sXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVkX2NvbXB1dGVyX21zZzogaW52b2ljZV9nZW5lcmF0ZWRfbXNnLFxuICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRzSW5mbzogZXN0YWJsaXNobWVudHNJbmZvQXJyYXlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGdldHMgdGhlIHRheCB2YWx1ZSBhY2NvcmRpbmcgdG8gdGhlIHZhbHVlXG4gICAgICAgICogQHBhcmFtIHtudW1iZXJ9IF9wYXltZW50VmFsdWVcbiAgICAgICAgKi9cbiAgICAgICAgZ2V0VmFsdWVUYXg6IGZ1bmN0aW9uIChfcGF5bWVudFZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICAgICAgbGV0IHBhcmFtZXRlclRheCA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb2xvbWJpYV90YXhfaXZhJyB9KTtcbiAgICAgICAgICAgIGxldCBwZXJjZW50VmFsdWUgPSBOdW1iZXIocGFyYW1ldGVyVGF4LnZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiAoX3BheW1lbnRWYWx1ZSAqIHBlcmNlbnRWYWx1ZSkgLyAxMDA7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAqIFRoaXMgZnVuY3Rpb24gZ2V0cyB0aGUgdGF4IHZhbHVlIGFjY29yZGluZyB0byB0aGUgdmFsdWVcbiAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gX3BheW1lbnRWYWx1ZVxuICAgICAgICAqL1xuICAgICAgICBnZXRSZXR1cm5CYXNlOiBmdW5jdGlvbiAoX3BheW1lbnRWYWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgICAgIGxldCBhbW91bnRQZXJjZW50OiBudW1iZXIgPSBNZXRlb3IuY2FsbCgnZ2V0VmFsdWVUYXgnLCBfcGF5bWVudFZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBfcGF5bWVudFZhbHVlIC0gYW1vdW50UGVyY2VudDtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgRW1haWwgfSBmcm9tICdtZXRlb3IvZW1haWwnO1xuaW1wb3J0IHsgRW1haWxDb250ZW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVtYWlsQ29udGVudCB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLm1vZGVsJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3BhcmFtZXRlci5tb2RlbCc7XG5pbXBvcnQgeyBTU1IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yaGFja3M6c3NyJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gdmFsaWRhdGUgaWYgZXN0YWJsaXNobWVudCB0cmlhbCBwZXJpb2QgaGFzIGVuZGVkXG4gICAgICAgICAqL1xuICAgICAgICB2YWxpZGF0ZVRyaWFsUGVyaW9kOiBmdW5jdGlvbiAoX2NvdW50cnlJZDogc3RyaW5nKSB7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50RGF0ZTogRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudFN0cmluZzogc3RyaW5nID0gTWV0ZW9yLmNhbGwoJ2NvbnZlcnREYXRlJywgY3VycmVudERhdGUpO1xuICAgICAgICAgICAgdmFyIHRyaWFsRGF5czogbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ3RyaWFsX2RheXMnIH0pLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBmaXJzdEFkdmljZURheXM6IG51bWJlciA9IE51bWJlci5wYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmaXJzdF9hZHZpY2VfZGF5cycgfSkudmFsdWUpO1xuICAgICAgICAgICAgdmFyIHNlY29uZEFkdmljZURheXM6IG51bWJlciA9IE51bWJlci5wYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdzZWNvbmRfYWR2aWNlX2RheXMnIH0pLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciB0aGlyZEFkdmljZURheXM6IG51bWJlciA9IE51bWJlci5wYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICd0aGlyZF9hZHZpY2VfZGF5cycgfSkudmFsdWUpO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjb3VudHJ5SWQ6IF9jb3VudHJ5SWQsIGlzQWN0aXZlOiB0cnVlLCB0c3RQZXJpb2Q6IHRydWUgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBNYXRoLnJvdW5kKChjdXJyZW50RGF0ZS52YWx1ZU9mKCkgLSBlc3RhYmxpc2htZW50LmNyZWF0aW9uX2RhdGUudmFsdWVPZigpKSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSk7XG4gICAgICAgICAgICAgICAgbGV0IGZvcndhcmREYXRlOiBEYXRlID0gTWV0ZW9yLmNhbGwoJ2FkZERheXMnLCBlc3RhYmxpc2htZW50LmNyZWF0aW9uX2RhdGUsIHRyaWFsRGF5cyk7XG4gICAgICAgICAgICAgICAgbGV0IGZvcndhcmRTdHJpbmc6IHN0cmluZyA9IE1ldGVvci5jYWxsKCdjb252ZXJ0RGF0ZScsIGZvcndhcmREYXRlKTtcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RBZHZpY2VEYXRlOiBEYXRlID0gTWV0ZW9yLmNhbGwoJ3N1YnN0cmFjdERheXMnLCBmb3J3YXJkRGF0ZSwgZmlyc3RBZHZpY2VEYXlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RBZHZpY2VTdHJpbmc6IHN0cmluZyA9IE1ldGVvci5jYWxsKCdjb252ZXJ0RGF0ZScsIGZpcnN0QWR2aWNlRGF0ZSk7XG4gICAgICAgICAgICAgICAgbGV0IHNlY29uZEFkdmljZURhdGU6IERhdGUgPSBNZXRlb3IuY2FsbCgnc3Vic3RyYWN0RGF5cycsIGZvcndhcmREYXRlLCBzZWNvbmRBZHZpY2VEYXlzKTtcbiAgICAgICAgICAgICAgICBsZXQgc2Vjb25kQWR2aWNlU3RyaW5nOiBzdHJpbmcgPSBNZXRlb3IuY2FsbCgnY29udmVydERhdGUnLCBzZWNvbmRBZHZpY2VEYXRlKTtcbiAgICAgICAgICAgICAgICBsZXQgdGhpcmRBZHZpY2VEYXRlOiBEYXRlID0gTWV0ZW9yLmNhbGwoJ3N1YnN0cmFjdERheXMnLCBmb3J3YXJkRGF0ZSwgdGhpcmRBZHZpY2VEYXlzKTtcbiAgICAgICAgICAgICAgICBsZXQgdGhpcmRBZHZpY2VTdHJpbmc6IHN0cmluZyA9IE1ldGVvci5jYWxsKCdjb252ZXJ0RGF0ZScsIHRoaXJkQWR2aWNlRGF0ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGlmZiA+IHRyaWFsRGF5cykge1xuICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogZXN0YWJsaXNobWVudC5faWQgfSwgeyAkc2V0OiB7IGlzQWN0aXZlOiBmYWxzZSwgdHN0UGVyaW9kOiBmYWxzZSB9IH0pXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTdHJpbmcgPT0gZmlyc3RBZHZpY2VTdHJpbmcgfHwgY3VycmVudFN0cmluZyA9PSBzZWNvbmRBZHZpY2VTdHJpbmcgfHwgY3VycmVudFN0cmluZyA9PSB0aGlyZEFkdmljZVN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ3NlbmRUcmlhbEVtYWlsJywgZXN0YWJsaXNobWVudC5jcmVhdGlvbl91c2VyLCBmb3J3YXJkU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gXCJlbWFpbFNlbmRcIjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gY29udmVydCB0aGUgZGF5IGFuZCByZXR1cm5pbmcgaW4gZm9ybWF0IHl5eXktbS1kXG4gICAgICAgICAqL1xuICAgICAgICBjb252ZXJ0RGF0ZTogZnVuY3Rpb24gKF9kYXRlOiBEYXRlKSB7XG4gICAgICAgICAgICBsZXQgeWVhciA9IF9kYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICBsZXQgbW9udGggPSBfZGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgIGxldCBkYXkgPSBfZGF0ZS5nZXREYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB5ZWFyLnRvU3RyaW5nKCkgKyAnLScgKyBtb250aC50b1N0cmluZygpICsgJy0nICsgZGF5LnRvU3RyaW5nKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFkZCBkYXlzIHRvIHRoZSBwYXNzZWQgZGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkRGF5czogZnVuY3Rpb24gKF9kYXRlOiBEYXRlLCBfZGF5czogbnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IERhdGUoX2RhdGUpO1xuICAgICAgICAgICAgcmVzdWx0LnNldERhdGUocmVzdWx0LmdldERhdGUoKSArIF9kYXlzKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIHN1YnN0cmFjdCBkYXlzIHRvIHRoZSBwYXNzZWQgZGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgc3Vic3RyYWN0RGF5czogZnVuY3Rpb24gKF9kYXRlOiBEYXRlLCBfZGF5czogbnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IERhdGUoX2RhdGUpO1xuICAgICAgICAgICAgcmVzdWx0LnNldERhdGUocmVzdWx0LmdldERhdGUoKSAtIF9kYXlzKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIHNlbmQgZGUgZW1haWwgdG8gdGhlIGFjY291bnQgYWRtaW4gcmVnaXN0ZXJlZCBpZiB0cmlhbCBwZXJpb2QgaXMgZ29pbmcgdG8gZW5kXG4gICAgICAgICAqL1xuICAgICAgICBzZW5kVHJpYWxFbWFpbDogZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZywgX2ZvcndhcmREYXRlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCB1c2VyOiBVc2VyID0gVXNlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBfdXNlcklkIH0pO1xuICAgICAgICAgICAgbGV0IHBhcmFtZXRlcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZnJvbV9lbWFpbCcgfSk7XG4gICAgICAgICAgICBsZXQgZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQgPSBFbWFpbENvbnRlbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IGxhbmd1YWdlOiB1c2VyLnByb2ZpbGUubGFuZ3VhZ2VfY29kZSB9KTtcbiAgICAgICAgICAgIHZhciB0cmlhbF9lbWFpbF9zdWJqZWN0OiBzdHJpbmcgPSBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5WzBdLnRyYWR1Y3Rpb247XG4gICAgICAgICAgICB2YXIgZ3JlZXRpbmc6IHN0cmluZyA9ICh1c2VyLnByb2ZpbGUgJiYgdXNlci5wcm9maWxlLmZpcnN0X25hbWUpID8gKGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnlbMV0udHJhZHVjdGlvbiArICcgJyArIHVzZXIucHJvZmlsZS5maXJzdF9uYW1lICsgXCIsXCIpIDogZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeVsxXS50cmFkdWN0aW9uO1xuXG4gICAgICAgICAgICBTU1IuY29tcGlsZVRlbXBsYXRlKCdodG1sRW1haWwnLCBBc3NldHMuZ2V0VGV4dCgnaHRtbC1lbWFpbC5odG1sJykpO1xuXG4gICAgICAgICAgICB2YXIgZW1haWxEYXRhID0ge1xuICAgICAgICAgICAgICAgIGdyZWV0aW5nOiBncmVldGluZyxcbiAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjogZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeVs3XS50cmFkdWN0aW9uLFxuICAgICAgICAgICAgICAgIGRhdGVWYXI6IF9mb3J3YXJkRGF0ZSxcbiAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbk1zZ1ZhcjogZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeVs4XS50cmFkdWN0aW9uLFxuICAgICAgICAgICAgICAgIHJlZ2FyZFZhcjogZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeVs1XS50cmFkdWN0aW9uLFxuICAgICAgICAgICAgICAgIGZvbGxvd01zZ1ZhcjogZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeVs2XS50cmFkdWN0aW9uXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEVtYWlsLnNlbmQoe1xuICAgICAgICAgICAgICAgIHRvOiB1c2VyLmVtYWlsc1swXS5hZGRyZXNzLFxuICAgICAgICAgICAgICAgIGZyb206IHBhcmFtZXRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICBzdWJqZWN0OiB0cmlhbF9lbWFpbF9zdWJqZWN0LFxuICAgICAgICAgICAgICAgIGh0bWw6IFNTUi5yZW5kZXIoJ2h0bWxFbWFpbCcsIGVtYWlsRGF0YSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgT25lU2lnbmFsIH0gZnJvbSAnbWV0ZW9yL2FzdHJvY29kZXJzOm9uZS1zaWduYWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMgKHtcbiAgICAgICAgc2VuZFB1c2g6IGZ1bmN0aW9uICggX3VzZXJEZXZpY2VJZCA6IHN0cmluZ1tdLCBjb250ZW50IDogc3RyaW5nICl7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGVuOiBjb250ZW50LCAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIE9uZVNpZ25hbC5Ob3RpZmljYXRpb25zLmNyZWF0ZSggX3VzZXJEZXZpY2VJZCwgZGF0YSApO1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL21lbnUvaXRlbS5jb2xsZWN0aW9uJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICBNZXRlb3IubWV0aG9kcyh7XG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gdXBkYXRlIGl0ZW0gYXZhaWxhYmxlIGZvciBzdXBlcnZpc29yXG4gICAgICogQHBhcmFtIHtVc2VyRGV0YWlsfSBfdXNlckRldGFpbFxuICAgICAqIEBwYXJhbSB7SXRlbX0gX2l0ZW1cbiAgICAgKi9cbiAgICB1cGRhdGVJdGVtQXZhaWxhYmxlOiBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nLCBfaXRlbUlkOiBzdHJpbmcpIHtcbiAgICAgIGxldCBfaXRlbUVzdGFibGlzaG1lbnQgPSBJdGVtcy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IF9pdGVtSWQgfSwgeyBmaWVsZHM6IHsgX2lkOiAwLCBlc3RhYmxpc2htZW50czogMSB9IH0pO1xuICAgICAgbGV0IGF1eCA9IF9pdGVtRXN0YWJsaXNobWVudC5lc3RhYmxpc2htZW50cy5maW5kKGVsZW1lbnQgPT4gZWxlbWVudC5lc3RhYmxpc2htZW50X2lkID09PSBfZXN0YWJsaXNobWVudElkKTtcbiAgICAgIEl0ZW1zLnVwZGF0ZSh7IF9pZDogX2l0ZW1JZCwgXCJlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkXCI6IF9lc3RhYmxpc2htZW50SWQgfSwgeyAkc2V0OiB7ICdlc3RhYmxpc2htZW50cy4kLmlzQXZhaWxhYmxlJzogIWF1eC5pc0F2YWlsYWJsZSwgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksIG1vZGlmaWNhdGlvbl91c2VyOiBNZXRlb3IudXNlcklkKCkgfSB9KTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIHVwZGF0ZSBpdGVtIHJlY29tbWVuZGVkXG4gICAgICogQHBhcmFtIHtVc2VyRGV0YWlsfSBfdXNlckRldGFpbFxuICAgICAqIEBwYXJhbSB7SXRlbX0gX2l0ZW1cbiAgICAgKi9cbiAgICB1cGRhdGVSZWNvbW1lbmRlZDogZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZywgX2l0ZW1JZDogc3RyaW5nKSB7XG4gICAgICBsZXQgX2l0ZW1Fc3RhYmxpc2htZW50ID0gSXRlbXMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBfaXRlbUlkIH0sIHsgZmllbGRzOiB7IF9pZDogMCwgZXN0YWJsaXNobWVudHM6IDEgfSB9KTtcbiAgICAgIGxldCBhdXggPSBfaXRlbUVzdGFibGlzaG1lbnQuZXN0YWJsaXNobWVudHMuZmluZChlbGVtZW50ID0+IGVsZW1lbnQuZXN0YWJsaXNobWVudF9pZCA9PT0gX2VzdGFibGlzaG1lbnRJZCk7XG4gICAgICBJdGVtcy51cGRhdGUoeyBfaWQ6IF9pdGVtSWQsIFwiZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZFwiOiBfZXN0YWJsaXNobWVudElkIH0sIHsgJHNldDogeyAnZXN0YWJsaXNobWVudHMuJC5yZWNvbW1lbmRlZCc6ICFhdXgucmVjb21tZW5kZWQsIG1vZGlmaWNhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLCBtb2RpZmljYXRpb25fdXNlcjogTWV0ZW9yLnVzZXJJZCgpIH0gfSk7XG4gICAgfVxuICB9KVxufVxuXG5cblxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBSZXdhcmRIaXN0b3J5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9yZXdhcmQtaGlzdG9yeS5tb2RlbCc7XG5pbXBvcnQgeyBSZXdhcmRIaXN0b3JpZXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvcmV3YXJkLWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEl0ZW0gfSBmcm9tICcuLi8uLi9tb2RlbHMvbWVudS9pdGVtLm1vZGVsJztcbmltcG9ydCB7IEl0ZW1zIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUmV3YXJkIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvcmV3YXJkLm1vZGVsJztcbmltcG9ydCB7IFJld2FyZHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRNZWRhbCB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50TWVkYWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSZXdhcmRDb25maXJtYXRpb24gfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24ubW9kZWwnO1xuaW1wb3J0IHsgUmV3YXJkc0NvbmZpcm1hdGlvbnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UG9pbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnRzLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTmVnYXRpdmVQb2ludHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnRzLmNvbGxlY3Rpb24nO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdG9uIGFsbG93IGdlbmVyYXRlIHJld2FyZCBoaXN0b3J5XG4gICAgICAgICAqIEBwYXJhbSB7UmV3YXJkQ29uZmlybWF0aW9ufSBfcFJld2FyZENvbmZpcm1hdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgZ2VuZXJhdGVSZXdhcmRIaXN0b3J5OiBmdW5jdGlvbiAoX3BSZXdhcmRDb25maXJtYXRpb246IFJld2FyZENvbmZpcm1hdGlvbikge1xuICAgICAgICAgICAgbGV0IF9sRXN0YWJsaXNobWVudDogRXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmZpbmRPbmUoeyBfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLmVzdGFibGlzaG1lbnRfaWQgfSk7XG4gICAgICAgICAgICBsZXQgX2xSZXdhcmQ6IFJld2FyZCA9IFJld2FyZHMuZmluZE9uZSh7IF9pZDogX3BSZXdhcmRDb25maXJtYXRpb24ucmV3YXJkX2lkIH0pO1xuICAgICAgICAgICAgbGV0IF9sSXRlbTogSXRlbSA9IEl0ZW1zLmZpbmRPbmUoeyBfaWQ6IF9sUmV3YXJkLml0ZW1faWQgfSk7XG5cbiAgICAgICAgICAgIFJld2FyZEhpc3Rvcmllcy5pbnNlcnQoe1xuICAgICAgICAgICAgICAgIGNyZWF0aW9uX3VzZXI6IF9wUmV3YXJkQ29uZmlybWF0aW9uLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgY3JlYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50X2lkOiBfbEVzdGFibGlzaG1lbnQuX2lkLFxuICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfbmFtZTogX2xFc3RhYmxpc2htZW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudF9hZGRyZXNzOiBfbEVzdGFibGlzaG1lbnQuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBpdGVtX25hbWU6IF9sSXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgIGl0ZW1fcXVhbnRpdHk6IF9sUmV3YXJkLml0ZW1fcXVhbnRpdHksXG4gICAgICAgICAgICAgICAgcmVkZWVtZWRfbWVkYWxzOiBfcFJld2FyZENvbmZpcm1hdGlvbi5tZWRhbHNfdG9fcmVkZWVtXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRnVuY3Rpb24gdG8gcmVkZWVtIHVzZXIgbWVkYWxzXG4gICAgICAgICAqIEBwYXJhbSB7UmV3YXJkQ29uZmlybWF0aW9ufSBfcFJld2FyZENvbmZpcm1hdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgcmVkZWVtVXNlck1lZGFsczogZnVuY3Rpb24gKF9wUmV3YXJkQ29uZmlybWF0aW9uOiBSZXdhcmRDb25maXJtYXRpb24pIHtcbiAgICAgICAgICAgIGxldCBfZXN0YWJsaXNobWVudFBvaW50czogRXN0YWJsaXNobWVudFBvaW50ID0gRXN0YWJsaXNobWVudFBvaW50cy5maW5kT25lKHsgZXN0YWJsaXNobWVudF9pZDogX3BSZXdhcmRDb25maXJtYXRpb24uZXN0YWJsaXNobWVudF9pZCB9KTtcbiAgICAgICAgICAgIGxldCBfcG9pbnRzUmVzdWx0OiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoX2VzdGFibGlzaG1lbnRQb2ludHMuY3VycmVudF9wb2ludHMudG9TdHJpbmcoKSkgLSBOdW1iZXIucGFyc2VJbnQoX3BSZXdhcmRDb25maXJtYXRpb24ubWVkYWxzX3RvX3JlZGVlbS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnRNZWRhbDogRXN0YWJsaXNobWVudE1lZGFsID0gRXN0YWJsaXNobWVudE1lZGFscy5maW5kT25lKHsgdXNlcl9pZDogX3BSZXdhcmRDb25maXJtYXRpb24udXNlcl9pZCwgZXN0YWJsaXNobWVudF9pZDogX3BSZXdhcmRDb25maXJtYXRpb24uZXN0YWJsaXNobWVudF9pZCB9KTtcblxuICAgICAgICAgICAgaWYgKF9wb2ludHNSZXN1bHQgPj0gMCkge1xuICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRQb2ludHMudXBkYXRlKHsgX2lkOiBfZXN0YWJsaXNobWVudFBvaW50cy5faWQgfSwgeyAkc2V0OiB7IGN1cnJlbnRfcG9pbnRzOiBfcG9pbnRzUmVzdWx0IH0gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBfbmVnYXRpdmVQb2ludHM6IG51bWJlcjtcbiAgICAgICAgICAgICAgICBpZiAoX2VzdGFibGlzaG1lbnRQb2ludHMuY3VycmVudF9wb2ludHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIF9uZWdhdGl2ZVBvaW50cyA9IE51bWJlci5wYXJzZUludChfcFJld2FyZENvbmZpcm1hdGlvbi5tZWRhbHNfdG9fcmVkZWVtLnRvU3RyaW5nKCkpIC0gTnVtYmVyLnBhcnNlSW50KF9lc3RhYmxpc2htZW50UG9pbnRzLmN1cnJlbnRfcG9pbnRzLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX25lZ2F0aXZlUG9pbnRzIDwgMCkgeyBfbmVnYXRpdmVQb2ludHMgPSAoX25lZ2F0aXZlUG9pbnRzICogKC0xKSk7IH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfbmVnYXRpdmVQb2ludHMgPSBOdW1iZXIucGFyc2VJbnQoX3BSZXdhcmRDb25maXJtYXRpb24ubWVkYWxzX3RvX3JlZGVlbS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgTmVnYXRpdmVQb2ludHMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudF9pZDogX3BSZXdhcmRDb25maXJtYXRpb24uZXN0YWJsaXNobWVudF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogX3BSZXdhcmRDb25maXJtYXRpb24udXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzOiBfbmVnYXRpdmVQb2ludHMsXG4gICAgICAgICAgICAgICAgICAgIHBhaWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudFBvaW50cy51cGRhdGUoeyBfaWQ6IF9lc3RhYmxpc2htZW50UG9pbnRzLl9pZCB9LCB7ICRzZXQ6IHsgY3VycmVudF9wb2ludHM6IF9wb2ludHNSZXN1bHQsIG5lZ2F0aXZlX2JhbGFuY2U6IHRydWUgfSB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IF9sTmV3TWVkYWxzOiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoX2xFc3RhYmxpc2htZW50TWVkYWwubWVkYWxzLnRvU3RyaW5nKCkpIC0gTnVtYmVyLnBhcnNlSW50KF9wUmV3YXJkQ29uZmlybWF0aW9uLm1lZGFsc190b19yZWRlZW0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBFc3RhYmxpc2htZW50TWVkYWxzLnVwZGF0ZSh7IF9pZDogX2xFc3RhYmxpc2htZW50TWVkYWwuX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWNhdGlvbl91c2VyOiBfbEVzdGFibGlzaG1lbnRNZWRhbC51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgbWVkYWxzOiBfbE5ld01lZGFsc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ2dlbmVyYXRlUmV3YXJkSGlzdG9yeScsIF9wUmV3YXJkQ29uZmlybWF0aW9uKTtcbiAgICAgICAgICAgIFJld2FyZHNDb25maXJtYXRpb25zLnVwZGF0ZSh7IF9pZDogX3BSZXdhcmRDb25maXJtYXRpb24uX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWNhdGlvbl91c2VyOiBfbEVzdGFibGlzaG1lbnRNZWRhbC51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgaXNfY29uZmlybWVkOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBVc2VyRGV2aWNlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvZGV2aWNlLm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IFVzZXJEZXZpY2VzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFVzZXJEZXZpY2U+KCd1c2VyX2RldmljZXMnKTtcblxuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG5Vc2VyRGV2aWNlcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW4sXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZW51IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvbWVudS5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBNZW51cyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxNZW51PignbWVudXMnKTtcbiIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC9yb2xlLm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IFJvbGVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFJvbGU+KCdyb2xlcycpO1xuIiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgVXNlckRldGFpbCB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IFVzZXJEZXRhaWxzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFVzZXJEZXRhaWw+KCd1c2VyX2RldGFpbHMnKTtcblxuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG5Vc2VyRGV0YWlscy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW4sXG59KTtcbiIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZcKgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3LCoH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VyTG9naW4gfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWxvZ2luLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogVXNlciBMb2dpbiBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBVc2Vyc0xvZ2luID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFVzZXJMb2dpbj4oJ3VzZXJzX2xvZ2luJyk7XG5cblVzZXJzTG9naW4uYWxsb3coe1xuICAgIGluc2VydDpsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJQZW5hbHR5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1wZW5hbHR5Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogVXNlciBQZW5hbHRpZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgVXNlclBlbmFsdGllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxVc2VyUGVuYWx0eT4oJ3VzZXJfcGVuYWx0aWVzJyk7XG5cbi8qKlxuICogQWxsb3cgVXNlciBQZW5hbHRpZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuVXNlclBlbmFsdGllcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTtcbiIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBVc2VycyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBVc2VycyA9IE1vbmdvT2JzZXJ2YWJsZS5mcm9tRXhpc3RpbmcoTWV0ZW9yLnVzZXJzKTtcblxuLyoqXG4gKiBBbGxvdyBVc2VycyBjb2xsZWN0aW9uIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuVXNlcnMuYWxsb3coe1xuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFFSIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC1xci5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50UVJzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEVzdGFibGlzaG1lbnRRUnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248RXN0YWJsaXNobWVudFFSPignZXN0YWJsaXNobWVudF9xcnMnKTtcblxuLyoqXG4gKiBBbGxvdyBFc3RhYmxpc2htZW50UVJzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkVzdGFibGlzaG1lbnRRUnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCwgRXN0YWJsaXNobWVudFR1cm4sIEVzdGFibGlzaG1lbnRQcm9maWxlLCBFc3RhYmxpc2htZW50UHJvZmlsZUltYWdlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEVzdGFibGlzaG1lbnRzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEVzdGFibGlzaG1lbnQ+KCdlc3RhYmxpc2htZW50cycpO1xuXG4vKipcbiAqIEFsbG93IEVzdGFibGlzaG1lbnQgY29sbGVjaW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Fc3RhYmxpc2htZW50cy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTtcblxuLyoqXG4gKiBFc3RhYmxpc2htZW50IFR1cm5zIENvbGxlY3Rpb25cbiAqL1xuXG5leHBvcnQgY29uc3QgRXN0YWJsaXNobWVudFR1cm5zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEVzdGFibGlzaG1lbnRUdXJuPignZXN0YWJsaXNobWVudF90dXJucycpO1xuXG4vKipcbiAqIEFsbG93IEVzdGFibGlzaG1lbnQgVHVybnMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuRXN0YWJsaXNobWVudFR1cm5zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7XG5cbi8qKlxuICogRXN0YWJsaXNobWVudCBQcm9maWxlIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEVzdGFibGlzaG1lbnRzUHJvZmlsZSA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxFc3RhYmxpc2htZW50UHJvZmlsZT4oJ2VzdGFibGlzaG1lbnRfcHJvZmlsZScpO1xuXG4vKipcbiAqIEFsbG93IEVzdGFibGlzaG1lbnQgUHJvZmlsZSBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Fc3RhYmxpc2htZW50c1Byb2ZpbGUuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7XG4iLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE9yZGVySGlzdG9yeSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L29yZGVyLWhpc3RvcnkubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBPcmRlckhpc3RvcmllcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBPcmRlckhpc3RvcmllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxPcmRlckhpc3Rvcnk+KCdvcmRlcl9oaXN0b3JpZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBPcmRlckhpc3RvcmllcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5PcmRlckhpc3Rvcmllcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBPcmRlciB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L29yZGVyLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogT3JkZXJzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IE9yZGVycyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxPcmRlcj4oJ29yZGVycycpO1xuXG4vKipcbiAqIEFsbG93IE9yZGVycyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5PcmRlcnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOmxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJld2FyZFBvaW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvcmV3YXJkLXBvaW50Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogUmV3YXJkUG9pbnRzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFJld2FyZFBvaW50cyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxSZXdhcmRQb2ludD4oJ3Jld2FyZF9wb2ludHMnKTtcblxuLyoqXG4gKiBBbGxvdyBSZXdhcmRQb2ludHMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuUmV3YXJkUG9pbnRzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTpsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBSZXdhcmQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9yZXdhcmQubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogUmV3YXJkIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFJld2FyZHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UmV3YXJkPigncmV3YXJkcycpO1xuXG4vKipcbiAqIEFsbG93IFJld2FyZCBjb2xsZWN0aW9uIGluc2VydCwgdXBkYXRlIGFuZCByZW1vdmUgZnVuY3Rpb25zXG4gKi9cblJld2FyZHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBUYWJsZSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3RhYmxlLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBUYWJsZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgVGFibGVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFRhYmxlPigndGFibGVzJyk7XG5cbi8qKlxuICogQWxsb3cgVGFibGVzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblRhYmxlcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBXYWl0ZXJDYWxsRGV0YWlsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvd2FpdGVyLWNhbGwtZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBXYWl0ZXJDYWxsRGV0YWlscyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBXYWl0ZXJDYWxsRGV0YWlscyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxXYWl0ZXJDYWxsRGV0YWlsPignd2FpdGVyX2NhbGxfZGV0YWlscycpO1xuXG4vKipcbiAqIEFsbG93IFdhaXRlckNhbGxEZXRhaWxzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbldhaXRlckNhbGxEZXRhaWxzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJ1xuaW1wb3J0IHsgQ291bnRyeSB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL2NvdW50cnkubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIENvdW50cmllcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBDb3VudHJpZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248Q291bnRyeT4oJ2NvdW50cmllcycpO1xuXG4vKipcbiAqIEFsbG93IENvdW50cmllcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Db3VudHJpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgQ3VycmVuY3kgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9jdXJyZW5jeS5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuZXhwb3J0IGNvbnN0IEN1cnJlbmNpZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248Q3VycmVuY3k+KCdjdXJyZW5jaWVzJyk7XG5cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuQ3VycmVuY2llcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5leHBvcnQgY29uc3QgRW1haWxDb250ZW50cyA9ICBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248RW1haWxDb250ZW50PignZW1haWxfY29udGVudHMnKTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQWxsb3cgRW1haWxDb250ZW50cyBjb2xsZWNpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkVtYWlsQ29udGVudHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgSG91ciB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL2hvdXIubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmV4cG9ydCBjb25zdCBIb3VycyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxIb3VyPignaG91cnMnKTtcblxuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG5Ib3Vycy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBMYW5ndWFnZSB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL2xhbmd1YWdlLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBMYW5ndWFnZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgTGFuZ3VhZ2VzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPExhbmd1YWdlPignbGFuZ3VhZ2VzJyk7XG5cbi8qKlxuICogQWxsb3cgTGFuZ3VhZ2VzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkxhbmd1YWdlcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmV4cG9ydCBjb25zdCBQYXJhbWV0ZXJzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFBhcmFtZXRlcj4oJ3BhcmFtZXRlcnMnKTtcblxuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG5QYXJhbWV0ZXJzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFBheW1lbnRNZXRob2QgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5leHBvcnQgY29uc3QgUGF5bWVudE1ldGhvZHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UGF5bWVudE1ldGhvZD4oJ3BheW1lbnRNZXRob2RzJyk7XG5cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuUGF5bWVudE1ldGhvZHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wb2ludC5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogUG9pbnRzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFBvaW50cyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxQb2ludD4oJ3BvaW50cycpO1xuXG4vKipcbiAqIEFsbG93IHBvaW50cyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Qb2ludHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnXG5pbXBvcnQgeyBRdWV1ZSB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3F1ZXVlLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBRdWV1ZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgUXVldWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFF1ZXVlPigncXVldWVzJyk7XG5cbi8qKlxuICogQWxsb3cgUXVldWVzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblF1ZXVlcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBUeXBlT2ZGb29kIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvdHlwZS1vZi1mb29kLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogVHlwZXNPZkZvb2QgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgVHlwZXNPZkZvb2QgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248VHlwZU9mRm9vZD4oJ3R5cGVzX29mX2Zvb2QnKTtcblxuLyoqXG4gKiBBbGxvdyBUeXBlc09mRm9vZCBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5UeXBlc09mRm9vZC5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBBZGRpdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscy9tZW51L2FkZGl0aW9uLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQWRkaXRpb24gQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgQWRkaXRpb25zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEFkZGl0aW9uPignYWRkaXRpb25zJyk7XG5cbi8qKlxuICogQWxsb3cgQWRkaXRpb24gY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuQWRkaXRpb25zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvbWVudS9jYXRlZ29yeS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIENhdGVnb3JpZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgQ2F0ZWdvcmllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxDYXRlZ29yeT4oJ2NhdGVnb3JpZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBDYXRlZ29yeSBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5DYXRlZ29yaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgSXRlbSwgSXRlbUltYWdlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvaXRlbS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBJdGVtcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBJdGVtcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxJdGVtPignaXRlbXMnKTtcblxuLyoqXG4gKiBBbGxvdyBJdGVtcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5JdGVtcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE9wdGlvblZhbHVlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvb3B0aW9uLXZhbHVlLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIE9wdGlvbiBWYWx1ZSBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBPcHRpb25WYWx1ZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248T3B0aW9uVmFsdWU+KCdvcHRpb25fdmFsdWVzJyk7XG5cbi8qKlxuICogQWxsb3cgT3B0aW9uVmFsdWVzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbk9wdGlvblZhbHVlcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscy9tZW51L29wdGlvbi5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgT3B0aW9ucyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxPcHRpb24+KCdvcHRpb25zJyk7XG5cbi8qKlxuICogQWxsb3cgT3B0aW9ucyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5PcHRpb25zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgU2VjdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscy9tZW51L3NlY3Rpb24ubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBTZWN0aW9uIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFNlY3Rpb25zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFNlY3Rpb24+KCdzZWN0aW9ucycpO1xuXG4vKipcbiAqIEFsbG93IFNlY3Rpb24gY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuU2VjdGlvbnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBTdWJjYXRlZ29yeSB9IGZyb20gJy4uLy4uL21vZGVscy9tZW51L3N1YmNhdGVnb3J5Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogU3ViY2F0ZWdvcnkgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgU3ViY2F0ZWdvcmllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxTdWJjYXRlZ29yeT4oJ3N1YmNhdGVnb3JpZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBTdWJjYXRlZ29yeSBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5TdWJjYXRlZ29yaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDY1BheW1lbnRNZXRob2QgfSBmcm9tICcuLi8uLi9tb2RlbHMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZC5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBDY1BheW1lbnRNZXRob2RzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPENjUGF5bWVudE1ldGhvZD4oJ2NjX3BheW1lbnRfbWV0aG9kcycpO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBBbGxvdyBIaXN0b3J5UGF5bWVudENvbGxlY3Rpb24gY29sbGVjaW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5DY1BheW1lbnRNZXRob2RzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ3lnSW52b2ljZSB9IGZyb20gJy4uLy4uL21vZGVscy9wYXltZW50L2N5Zy1pbnZvaWNlLm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IEN5Z0ludm9pY2VzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEN5Z0ludm9pY2U+KCdjeWdfaW52b2ljZXMnKTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEFsbG93IEhpc3RvcnlQYXltZW50Q29sbGVjdGlvbiBjb2xsZWNpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkN5Z0ludm9pY2VzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pO1xuIiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBJbnZvaWNlSW5mbyB9IGZyb20gJy4uLy4uL21vZGVscy9wYXltZW50L2ludm9pY2UtaW5mby5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBJbnZvaWNlc0luZm8gPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248SW52b2ljZUluZm8+KCdpbnZvaWNlc19pbmZvJyk7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEFsbG93IEhpc3RvcnlQYXltZW50Q29sbGVjdGlvbiBjb2xsZWNpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkludm9pY2VzSW5mby5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBheW1lbnRIaXN0b3J5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5Lm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IFBheW1lbnRzSGlzdG9yeSA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxQYXltZW50SGlzdG9yeT4oJ3BheW1lbnRzX2hpc3RvcnknKTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQWxsb3cgSGlzdG9yeVBheW1lbnRDb2xsZWN0aW9uIGNvbGxlY2lvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuUGF5bWVudHNIaXN0b3J5LmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUGF5bWVudFRyYW5zYWN0aW9uIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BheW1lbnQvcGF5bWVudC10cmFuc2FjdGlvbi5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBQYXltZW50VHJhbnNhY3Rpb25zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFBheW1lbnRUcmFuc2FjdGlvbj4oJ3BheW1lbnRfdHJhbnNhY3Rpb24nKTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQWxsb3cgSGlzdG9yeVBheW1lbnRDb2xsZWN0aW9uIGNvbGxlY2lvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuUGF5bWVudFRyYW5zYWN0aW9ucy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBCYWdQbGFuSGlzdG9yeSB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvYmFnLXBsYW4taGlzdG9yeS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEJhZ1BsYW5IaXN0b3JpZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgQmFnUGxhbkhpc3RvcmllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxCYWdQbGFuSGlzdG9yeT4oJ2JhZ19wbGFuX2hpc3RvcmllcycpO1xuXG5CYWdQbGFuSGlzdG9yaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJbixcbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEJhZ1BsYW4gfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2JhZy1wbGFuLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQmFnUGxhbnMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgQmFnUGxhbnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248QmFnUGxhbj4oJ2JhZ19wbGFucycpO1xuXG5CYWdQbGFucy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW4sXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50TWVkYWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWwubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudE1lZGFscyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBFc3RhYmxpc2htZW50TWVkYWxzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEVzdGFibGlzaG1lbnRNZWRhbD4oJ2VzdGFibGlzaG1lbnRfbWVkYWxzJyk7XG5cbi8qKlxuICogQWxsb3cgRXN0YWJsaXNobWVudE1lZGFscyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Fc3RhYmxpc2htZW50TWVkYWxzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludC5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRQb2ludHMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgRXN0YWJsaXNobWVudFBvaW50cyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxFc3RhYmxpc2htZW50UG9pbnQ+KCdlc3RhYmxpc2htZW50X3BvaW50cycpO1xuXG4vKipcbiAqIEFsbG93IEVzdGFibGlzaG1lbnRQb2ludHMgY29sbGVjdGlvbiBpbnNlcnQsIHVwZGF0ZSBhbmQgcmVtb3ZlIGZ1bmN0aW9uc1xuICovXG5Fc3RhYmxpc2htZW50UG9pbnRzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJbixcbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE5lZ2F0aXZlUG9pbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL25lZ2F0aXZlLXBvaW50Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogTmVnYXRpdmVQb2ludHMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgTmVnYXRpdmVQb2ludHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248TmVnYXRpdmVQb2ludD4oJ25lZ2F0aXZlX3BvaW50cycpO1xuXG5OZWdhdGl2ZVBvaW50cy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW4sXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBSZXdhcmRDb25maXJtYXRpb24gfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24ubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogUmV3YXJkc0NvbmZpcm1hdGlvbnMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgUmV3YXJkc0NvbmZpcm1hdGlvbnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UmV3YXJkQ29uZmlybWF0aW9uPigncmV3YXJkc19jb25maXJtYXRpb25zJyk7XG5cbi8qKlxuICogQWxsb3cgUmV3YXJkc0NvbmZpcm1hdGlvbnMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuUmV3YXJkc0NvbmZpcm1hdGlvbnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBSZXdhcmRIaXN0b3J5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9yZXdhcmQtaGlzdG9yeS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBSZXdhcmRIaXN0b3JpZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgUmV3YXJkSGlzdG9yaWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFJld2FyZEhpc3Rvcnk+KCdyZXdhcmRzX2hpc3RvcmllcycpO1xuXG4vKipcbiAqIEFsbG93IFJld2FyZEhpc3RvcmllcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5SZXdhcmRIaXN0b3JpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgQ29sbGVjdGlvbk9iamVjdCB9IGZyb20gJy4uL2NvbGxlY3Rpb24tb2JqZWN0Lm1vZGVsJztcblxuZXhwb3J0IGludGVyZmFjZSBVc2VyRGV2aWNlIGV4dGVuZHMgQ29sbGVjdGlvbk9iamVjdCB7XG4gICAgdXNlcl9pZDogc3RyaW5nO1xuICAgIGRldmljZXMgOiBEZXZpY2VbXTtcbn1cblxuZXhwb3J0IGNsYXNzIERldmljZSB7XG4gICAgcGxheWVyX2lkOiBzdHJpbmc7XG4gICAgaXNfYWN0aXZlIDogYm9vbGVhbjtcbn1cblxuIiwiaW1wb3J0IHsgQ29sbGVjdGlvbk9iamVjdCB9IGZyb20gJy4uL2NvbGxlY3Rpb24tb2JqZWN0Lm1vZGVsJztcblxuZXhwb3J0IGludGVyZmFjZSBVc2VyRGV0YWlsIGV4dGVuZHMgQ29sbGVjdGlvbk9iamVjdCB7XG4gICAgdXNlcl9pZDogc3RyaW5nO1xuICAgIHJvbGVfaWQ6IHN0cmluZztcbiAgICBpc19hY3RpdmU6IGJvb2xlYW47XG5cbiAgICAvL2ZpZWxkcyBmb3IgYWRtaW4gcmVnaXN0ZXJcbiAgICBjb250YWN0X3Bob25lPzogc3RyaW5nO1xuICAgIGRuaV9udW1iZXI/OiBzdHJpbmc7XG4gICAgYWRkcmVzcz86IHN0cmluZztcbiAgICBjb3VudHJ5X2lkPzogc3RyaW5nO1xuICAgIGNpdHlfaWQ/OiBzdHJpbmc7XG4gICAgb3RoZXJfY2l0eT86IHN0cmluZztcbiAgICBzaG93X2FmdGVyX3Jlc3RfY3JlYXRpb24/OiBib29sZWFuO1xuICAgIC8vXG5cbiAgICBlc3RhYmxpc2htZW50X3dvcms/OiBzdHJpbmc7XG4gICAgcGVuYWx0aWVzPzogVXNlckRldGFpbFBlbmFsdHlbXTtcbiAgICBncmFudF9zdGFydF9wb2ludHM/OiBib29sZWFuO1xuICAgIGJpcnRoZGF0ZT86IERhdGU7XG4gICAgcGhvbmU/OiBzdHJpbmc7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47XG4gICAgaW1hZ2U/OiBVc2VyRGV0YWlsSW1hZ2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXNlckRldGFpbFBlbmFsdHkge1xuICAgIGRhdGU6IERhdGU7XG59XG5cbi8qKlxuICogVXNlciBEZXRhaWwgSW1hZ2UgTW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIFVzZXJEZXRhaWxJbWFnZSB7XG4gICAgX2lkPzogc3RyaW5nO1xuICAgIGZpbGVuYW1lOiBzdHJpbmc7XG4gICAgaGFuZGxlOiBzdHJpbmc7XG4gICAgbWltZXR5cGU6IHN0cmluZztcbiAgICBvcmlnaW5hbFBhdGg6IHN0cmluZztcbiAgICBzaXplOiBzdHJpbmc7XG4gICAgc291cmNlOiBzdHJpbmc7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgb3JpZ2luYWxGaWxlPzogT2JqZWN0O1xuICAgIHN0YXR1cz86IHN0cmluZztcbiAgICBrZXk/OiBzdHJpbmc7XG4gICAgY29udGFpbmVyPzogc3RyaW5nO1xuICAgIHVwbG9hZElkOiBzdHJpbmc7XG59IiwiLyoqXG4gKiBVc2VyIExvZ2luIE1vZGVsXG4gKi9cbmV4cG9ydCBjbGFzcyBVc2VyTG9naW4ge1xuICAgIHVzZXJfaWQ6IHN0cmluZztcbiAgICBsb2dpbl9kYXRlOiBEYXRlO1xuICAgIGFwcF9jb2RlX25hbWU6IHN0cmluZztcbiAgICBhcHBfbmFtZTogc3RyaW5nO1xuICAgIGFwcF92ZXJzaW9uOiBzdHJpbmc7XG4gICAgY29va2llX2VuYWJsZWQ6IGJvb2xlYW47XG4gICAgbGFuZ3VhZ2U6IHN0cmluZztcbiAgICBwbGF0Zm9ybTogc3RyaW5nO1xuICAgIGNvcmRvdmFfdmVyc2lvbj86IHN0cmluZztcbiAgICBtb2RlbD86IHN0cmluZztcbiAgICBwbGF0Zm9ybV9kZXZpY2U/OiBzdHJpbmc7XG4gICAgdmVyc2lvbj86IHN0cmluZztcbn0iLCJpbXBvcnQgeyBDb2xsZWN0aW9uT2JqZWN0IH0gZnJvbSAnLi4vY29sbGVjdGlvbi1vYmplY3QubW9kZWwnO1xuXG4vKipcbiAqIFVzZXIgUHJvZmlsZSBNb2RlbFxuICovXG5leHBvcnQgY2xhc3MgVXNlclByb2ZpbGUge1xuICAgIGZpcnN0X25hbWU/OiBzdHJpbmc7XG4gICAgbGFzdF9uYW1lPzogc3RyaW5nO1xuICAgIGxhbmd1YWdlX2NvZGU/OiBzdHJpbmc7XG4gICAgZ2VuZGVyPzogc3RyaW5nO1xuICAgIGZ1bGxfbmFtZTogc3RyaW5nO1xufSIsImltcG9ydCB7IENvbGxlY3Rpb25PYmplY3QgfSBmcm9tICcuLi9jb2xsZWN0aW9uLW9iamVjdC5tb2RlbCc7XG5cbi8qKlxuICogRXN0YWJsaXNobWVudCBtb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnQgZXh0ZW5kcyBDb2xsZWN0aW9uT2JqZWN0IHtcbiAgICBjb3VudHJ5SWQ6IHN0cmluZztcbiAgICBjaXR5OiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGN1cnJlbmN5SWQ6IHN0cmluZztcbiAgICBhZGRyZXNzOiBzdHJpbmc7XG4gICAgaW5kaWNhdGl2ZTogc3RyaW5nO1xuICAgIHBob25lOiBzdHJpbmc7XG4gICAgZXN0YWJsaXNobWVudF9jb2RlOiBzdHJpbmc7XG4gICAgcGF5bWVudE1ldGhvZHM6IHN0cmluZ1tdO1xuICAgIHRhYmxlc19xdWFudGl0eTogbnVtYmVyO1xuICAgIGltYWdlPzogRXN0YWJsaXNobWVudEltYWdlO1xuICAgIGlzQWN0aXZlOiBib29sZWFuO1xuICAgIGZpcnN0UGF5OiBib29sZWFuO1xuICAgIGZyZWVEYXlzPzogYm9vbGVhbjtcbiAgICBpc19wcmVtaXVtPzogYm9vbGVhbjtcbiAgICBpc19iZXRhX3Rlc3RlcjogYm9vbGVhbjtcbiAgICBiYWdfcGxhbnNfaWQ6IHN0cmluZztcbiAgICBpc19mcmVlbWl1bTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50SW1hZ2UgbW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50SW1hZ2Uge1xuICAgIF9pZD86IHN0cmluZztcbiAgICBmaWxlbmFtZTogc3RyaW5nO1xuICAgIGhhbmRsZTogc3RyaW5nO1xuICAgIG1pbWV0eXBlOiBzdHJpbmc7XG4gICAgb3JpZ2luYWxQYXRoOiBzdHJpbmc7XG4gICAgc2l6ZTogc3RyaW5nO1xuICAgIHNvdXJjZTogc3RyaW5nO1xuICAgIHVybDogc3RyaW5nO1xuICAgIG9yaWdpbmFsRmlsZT86IE9iamVjdDtcbiAgICBzdGF0dXM/OiBzdHJpbmc7XG4gICAga2V5Pzogc3RyaW5nO1xuICAgIGNvbnRhaW5lcj86IHN0cmluZztcbiAgICB1cGxvYWRJZDogc3RyaW5nO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRMb2NhdGlvbiBtb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnRMb2NhdGlvbiB7XG4gICAgbGF0OiBudW1iZXI7XG4gICAgbG5nOiBudW1iZXI7XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudFNjaGVkdWxlIG1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudFNjaGVkdWxlIHtcbiAgICBtb25kYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIHR1ZXNkYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIHdlZG5lc2RheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgdGh1cnNkYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIGZyaWRheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgc2F0dXJkYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIHN1bmRheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgaG9saWRheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH1cbn07XG5cbi8qKlxuICogRXN0YWJsaXNobWVudFR1cm4gbW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50VHVybiBleHRlbmRzIENvbGxlY3Rpb25PYmplY3Qge1xuICAgIGVzdGFibGlzaG1lbnRfaWQ6IHN0cmluZyxcbiAgICB0dXJuOiBudW1iZXIsXG4gICAgbGFzdF93YWl0ZXJfaWQ6IHN0cmluZyxcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50U29jaWFsTmV0d29yayBNb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnRTb2NpYWxOZXR3b3JrIHtcbiAgICBmYWNlYm9vaz86IHN0cmluZztcbiAgICB0d2l0dGVyPzogc3RyaW5nO1xuICAgIGluc3RhZ3JhbT86IHN0cmluZztcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50IFByb2ZpbGUgTW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50UHJvZmlsZSBleHRlbmRzIENvbGxlY3Rpb25PYmplY3Qge1xuICAgIF9pZD86IHN0cmluZztcbiAgICBlc3RhYmxpc2htZW50X2lkOiBzdHJpbmc7XG4gICAgZXN0YWJsaXNobWVudF9kZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHdlYl9wYWdlPzogc3RyaW5nO1xuICAgIGVtYWlsPzogc3RyaW5nO1xuICAgIHNvY2lhbF9uZXR3b3Jrcz86IEVzdGFibGlzaG1lbnRTb2NpYWxOZXR3b3JrO1xuICAgIGltYWdlcz86RXN0YWJsaXNobWVudFByb2ZpbGVJbWFnZVtdO1xuICAgIHNjaGVkdWxlOiBFc3RhYmxpc2htZW50U2NoZWR1bGU7XG4gICAgbG9jYXRpb246IEVzdGFibGlzaG1lbnRMb2NhdGlvbjtcbiAgICB0eXBlc19vZl9mb29kPzogc3RyaW5nW107XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudFByb2ZpbGVJbWFnZSBtb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnRQcm9maWxlSW1hZ2Uge1xuICAgIF9pZD86IHN0cmluZztcbiAgICBmaWxlbmFtZTogc3RyaW5nO1xuICAgIGhhbmRsZTogc3RyaW5nO1xuICAgIG1pbWV0eXBlOiBzdHJpbmc7XG4gICAgb3JpZ2luYWxQYXRoOiBzdHJpbmc7XG4gICAgc2l6ZTogc3RyaW5nO1xuICAgIHNvdXJjZTogc3RyaW5nO1xuICAgIHVybDogc3RyaW5nO1xuICAgIG9yaWdpbmFsRmlsZT86IE9iamVjdDtcbiAgICBzdGF0dXM/OiBzdHJpbmc7XG4gICAga2V5Pzogc3RyaW5nO1xuICAgIGNvbnRhaW5lcj86IHN0cmluZztcbiAgICB1cGxvYWRJZDogc3RyaW5nO1xufSIsImV4cG9ydCBjbGFzcyBOb2RlIHtcbiAgICBwcml2YXRlIGZyZWN1ZW5jeTpudW1iZXI7XG4gICAgcHJpdmF0ZSBjaGFyczpudW1iZXI7XG4gICAgcHJpdmF0ZSBub2RlTGVmdDpOb2RlO1xuICAgIHByaXZhdGUgbm9kZVJpZ2h0Ok5vZGU7XG5cbiAgICBjcmVhdGVOb2RlKCBfcENoYXJzOm51bWJlciApOnZvaWR7XG4gICAgICAgIHRoaXMuZnJlY3VlbmN5ID0gMTtcbiAgICAgICAgdGhpcy5jaGFycyA9IF9wQ2hhcnM7XG4gICAgfVxuXG4gICAgY3JlYXRlTm9kZUV4dGVuZCggX3BGcmVjdWVuY3k6bnVtYmVyLCBfcENoYXJzOm51bWJlciwgX3BMZWZ0Ok5vZGUsIF9wUmlnaHQ6Tm9kZSApe1xuICAgICAgICB0aGlzLmZyZWN1ZW5jeSA9IF9wRnJlY3VlbmN5O1xuICAgICAgICB0aGlzLmNoYXJzID0gX3BDaGFycztcbiAgICAgICAgdGhpcy5ub2RlTGVmdCA9IF9wTGVmdDtcbiAgICAgICAgdGhpcy5ub2RlUmlnaHQgPSBfcFJpZ2h0O1xuICAgIH1cblxuICAgIGdldENoYXIoKTpudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJzO1xuICAgIH1cblxuICAgIHNldENoYXIoIF9wQ2hhcjpudW1iZXIgKTp2b2lke1xuICAgICAgICB0aGlzLmNoYXJzID0gX3BDaGFyO1xuICAgIH1cblxuICAgIGdldEZyZWN1ZW5jeSgpOm51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJlY3VlbmN5O1xuICAgIH1cblxuICAgIHNldEZyZWN1ZW5jeSggX3BGcmVjdWVuY3k6bnVtYmVyICk6dm9pZHtcbiAgICAgICAgdGhpcy5mcmVjdWVuY3kgPSBfcEZyZWN1ZW5jeTtcbiAgICB9XG5cbiAgICBnZXROb2RlTGVmdCgpOk5vZGV7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVMZWZ0O1xuICAgIH1cblxuICAgIHNldE5vZGVMZWZ0KCBfcExlZnQ6Tm9kZSApOnZvaWR7XG4gICAgICAgIHRoaXMubm9kZUxlZnQgPSBfcExlZnQ7XG4gICAgfVxuXG4gICAgZ2V0Tm9kZVJpZ2h0KCk6Tm9kZXtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZVJpZ2h0O1xuICAgIH1cblxuICAgIHNldE5vZGVSaWdodCggX3BOb2RlUmlnaHQ6Tm9kZSApOnZvaWR7XG4gICAgICAgIHRoaXMubm9kZVJpZ2h0ID0gX3BOb2RlUmlnaHQ7XG4gICAgfSAgXG59IiwiLyoqXG4gKiBSZXNwb25zZVF1ZXJ5IG1vZGVsXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNwb25zZVF1ZXJ5IHtcbiAgICBsYW5ndWFnZTogc3RyaW5nO1xuICAgIGNvbW1hbmQ6IHN0cmluZztcbiAgICBtZXJjaGFudDogTWVyY2hhbnQ7XG4gICAgZGV0YWlsczogRGV0YWlscztcbiAgICB0ZXN0OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE1lcmNoYW50IG1vZGVsXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXJjaGFudCB7XG4gICAgYXBpS2V5OiBzdHJpbmc7XG4gICAgYXBpTG9naW46IHN0cmluZztcbn1cblxuLyoqXG4gKiBEZXRhaWxzIG1vZGVsXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXRhaWxzIHtcbiAgICB0cmFuc2FjdGlvbklkOiBzdHJpbmc7XG59IiwiaW1wb3J0IHsgQWJzdHJhY3RDb250cm9sIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5cbmV4cG9ydCBjbGFzcyBDdXN0b21WYWxpZGF0b3JzIHtcblxuICBwdWJsaWMgc3RhdGljIGVtYWlsVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlLm1hdGNoKC9bYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKD86XFwuW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKykqQCg/OlthLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT9cXC4pK1thLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKSs/LykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZEVtYWlsQWRkcmVzcyc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICAvKlxuICBwdWJsaWMgc3RhdGljIG51bWVyaWNWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUubWF0Y2goL14oMHxbMS05XVswLTldKikkLykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZE51bWVyaWNGaWVsZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cbiAgKi9cbiAgcHVibGljIHN0YXRpYyBudW1lcmljVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlLm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkTnVtZXJpY0ZpZWxkJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbGV0dGVyVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlLm1hdGNoKC9eW0Etel0rJC8pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWRMZXR0ZXJGaWVsZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGxldHRlclNwYWNlVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlLm1hdGNoKC9eW2EtekEtWlxcc10qJC8pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWRMZXR0ZXJTcGFjZUZpZWxkJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZGF5T2ZEYXRlVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlID49IDEgJiYgY29udHJvbC52YWx1ZSA8PSAzMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkRGF5RmllbGQnOiB0cnVlIH07XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtb250aE9mRGF0ZVZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZSA+PSAxICYmIGNvbnRyb2wudmFsdWUgPD0gMTIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZE1vbnRoRmllbGQnOiB0cnVlIH07XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyB5ZWFyT2ZEYXRlVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlID49IDE5NzApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZFllYXJGaWVsZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vU3BhY2VzVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmKGNvbnRyb2wudmFsdWUgIT09IG51bGwgJiYgY29udHJvbC52YWx1ZSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIGlmIChjb250cm9sLnZhbHVlLm1hdGNoKC9eXFxTKiQvKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7ICdpbnZhbGlkTm9TcGFjZXNWYWxpZGF0b3InOiB0cnVlIH07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLypQYXNzd29yZCBjb25zdHJhaW50c1xuICAgIG1pbiA2IGNoYXJhY3RlcnNcbiAgICBtYXggMjAgY2hhcmFjdGVyc1xuICAgIGxvd2VyIGFuZCB1cHBlciBsZXR0ZXJzXG4gICAgbnVtYmVyc1xuICAgIGFsbG93ZWQgY2hhcmFjdGVycyAhQCMkJV4mKlxuICAqL1xuICAvKnB1YmxpYyBzdGF0aWMgcGFzc3dvcmRWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG5cdCAgICBpZiAoY29udHJvbC52YWx1ZS5tYXRjaCgvXig/PS4qWzAtOV0pW2EtekEtWjAtOSFAIyQlXiYqXXs2LDIwfSQvKSkge1xuXHQgICAgICByZXR1cm4gbnVsbDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIHJldHVybiB7J2ludmFsaWRQYXNzd29yZCc6IHRydWUgfTtcblx0ICAgIH1cbiAgfSovXG59ICIsImltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xuXG5BY2NvdW50cy5vbkNyZWF0ZVVzZXIoZnVuY3Rpb24gKG9wdGlvbnMsIHVzZXIpIHtcblxuICAgIHVzZXIucHJvZmlsZSA9IG9wdGlvbnMucHJvZmlsZSB8fCB7fTtcbiAgICB1c2VyLnByb2ZpbGUuZnVsbF9uYW1lID0gb3B0aW9ucy5wcm9maWxlLmZ1bGxfbmFtZTtcbiAgICB1c2VyLnByb2ZpbGUubGFuZ3VhZ2VfY29kZSA9IG9wdGlvbnMucHJvZmlsZS5sYW5ndWFnZV9jb2RlO1xuICAgIHVzZXIucHJvZmlsZS5nZW5kZXIgPSBvcHRpb25zLnByb2ZpbGUuZ2VuZGVyO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdXNlciBvYmplY3RcbiAgICByZXR1cm4gdXNlcjtcbn0pOyIsImltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL3BhcmFtZXRlci5tb2RlbCc7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVtYWlsQ29udGVudCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2dlbmVyYWwvZW1haWwtY29udGVudC5tb2RlbCc7XG5cbkFjY291bnRzLnVybHMucmVzZXRQYXNzd29yZCA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgIHJldHVybiBNZXRlb3IuYWJzb2x1dGVVcmwoJ3Jlc2V0LXBhc3N3b3JkLycgKyB0b2tlbik7XG59O1xuXG5mdW5jdGlvbiBncmVldCgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHVzZXIsIHVybCkge1xuXG4gICAgICAgIGxldCBlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCA9IEVtYWlsQ29udGVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgbGFuZ3VhZ2U6IHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlIH0pO1xuICAgICAgICBsZXQgZ3JlZXRWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2dyZWV0VmFyJyk7XG4gICAgICAgIGxldCB3ZWxjb21lTXNnVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICd3ZWxjb21lTXNnVmFyJyk7XG4gICAgICAgIGxldCBidG5UZXh0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdidG5UZXh0VmFyJyk7XG4gICAgICAgIGxldCBiZWZvcmVNc2dWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2JlZm9yZU1zZ1ZhcicpO1xuICAgICAgICBsZXQgcmVnYXJkVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdyZWdhcmRWYXInKTtcbiAgICAgICAgbGV0IGZvbGxvd01zZ1ZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnZm9sbG93TXNnVmFyJyk7XG5cbiAgICAgICAgbGV0IGZhY2Vib29rVmFyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZmFjZWJvb2tfbGluaycgfSkudmFsdWU7XG4gICAgICAgIGxldCB0d2l0dGVyVmFyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAndHdpdHRlcl9saW5rJyB9KS52YWx1ZTtcbiAgICAgICAgbGV0IGluc3RhZ3JhbVZhciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2luc3RhZ3JhbV9saW5rJyB9KS52YWx1ZTtcbiAgICAgICAgbGV0IGl1cmVzdFZhciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2l1cmVzdF91cmwnIH0pLnZhbHVlO1xuICAgICAgICBsZXQgaXVyZXN0SW1nVmFyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X2ltZ191cmwnIH0pLnZhbHVlO1xuXG4gICAgICAgIHZhciBncmVldGluZyA9ICh1c2VyLnByb2ZpbGUgJiYgdXNlci5wcm9maWxlLmZpcnN0X25hbWUpID8gKGdyZWV0VmFyICsgJyAnICsgdXNlci5wcm9maWxlLmZpcnN0X25hbWUgKyBcIixcIikgOiBncmVldFZhcjtcblxuICAgICAgICByZXR1cm4gYFxuICAgICAgICA8dGFibGUgYm9yZGVyPVwiMFwiIHdpZHRoPVwiMTAwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiIGJnY29sb3I9XCIjZjVmNWY1XCI+XG4gICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAyMHB4IDAgMzBweCAwO1wiPlxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9XCJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyBib3gtc2hhZG93OiAwIDJweCAycHggMCByZ2JhKDAsIDAsIDAsIDAuMTQpLCAwIDFweCA1cHggMCByZ2JhKDAsIDAsIDAsIDAuMTIpLCAwIDNweCAxcHggLTJweCByZ2JhKDAsIDAsIDAsIDAuMik7XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcj1cIjBcIiB3aWR0aD1cIjYwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiIGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAxMHB4IDAgMTBweCAwO1wiIGFsaWduPVwiY2VudGVyXCIgYmdjb2xvcj1cIiMzYzQxNDZcIj48aW1nIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7XCIgc3JjPSR7aXVyZXN0SW1nVmFyfWxvZ29faXVyZXN0X3doaXRlLnBuZyBhbHQ9XCJSZXNldCBwYXNzd2RcIiAvPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDEwcHggMzBweCAxMHB4IDMwcHg7XCIgYmdjb2xvcj1cIiNmZmZmZmZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBib3JkZXI9XCIwXCIgd2lkdGg9XCIxMDAlXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAxNXB4IDAgMCAwOyBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7IGZvbnQtc2l6ZTogMjRweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JHtncmVldGluZ308L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAxNXB4IDAgMTBweCAwOyBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7XCI+JHt3ZWxjb21lTXNnVmFyfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDIwcHggMCAyMHB4IDA7IGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGFsaWduPVwiY2VudGVyXCI+PGEgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTsgYm9yZGVyLXN0eWxlOiBzb2xpZDsgYm9yZGVyLXdpZHRoOiAycHg7IGNvbG9yOiAjRUY1MzUwOyB0ZXh0LWFsaWduOiBjZW50ZXI7IHBhZGRpbmc6IDEwcHggMzBweDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBmb250LXdlaWdodDogYm9sZCBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj1cIiR7dXJsfVwiPiR7YnRuVGV4dFZhcn08L2E+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAwIDAgMCAwOyBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtiZWZvcmVNc2dWYXJ9IDxiciAvPiAke3JlZ2FyZFZhcn08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAwcHggMzBweCAxMHB4IDMwcHg7XCIgYmdjb2xvcj1cIiNmZmZmZmZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxociAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGJvcmRlcj1cIjBcIiB3aWR0aD1cIjEwMCVcIiBjZWxsc3BhY2luZz1cIjBcIiBjZWxscGFkZGluZz1cIjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjtcIj4ke2ZvbGxvd01zZ1Zhcn08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGFsaWduPVwicmlnaHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgYm9yZGVyPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPjxhIGhyZWY9JHtmYWNlYm9va1Zhcn0+IDxpbWcgc3R5bGU9XCJkaXNwbGF5OiBibG9jaztcIiBzcmM9JHtpdXJlc3RJbWdWYXJ9ZmFjZWJvb2tfcmVkLnBuZyBhbHQ9XCJGYWNlYm9va1wiIC8+IDwvYT48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cImZvbnQtc2l6ZTogMDsgbGluZS1oZWlnaHQ6IDA7XCIgd2lkdGg9XCIyMFwiPiZuYnNwOzwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPjxhIGhyZWY9JHt0d2l0dGVyVmFyfT4gPGltZyBzdHlsZT1cImRpc3BsYXk6IGJsb2NrO1wiIHNyYz0ke2l1cmVzdEltZ1Zhcn10d2l0dGVyX3JlZC5wbmcgYWx0PVwiVHdpdHRlclwiIC8+IDwvYT48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cImZvbnQtc2l6ZTogMDsgbGluZS1oZWlnaHQ6IDA7XCIgd2lkdGg9XCIyMFwiPiZuYnNwOzwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPjxhIGhyZWY9JHtpbnN0YWdyYW1WYXJ9PiA8aW1nIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7XCIgc3JjPSR7aXVyZXN0SW1nVmFyfWluc3RhZ3JhbV9yZWQucG5nIGFsdD1cIkluc3RhZ3JhbVwiIC8+IDwvYT48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwiZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOyBwYWRkaW5nOiAxMHB4IDAgMTBweCAwO1wiPjxhIHN0eWxlPVwiZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGZsb2F0OiBsZWZ0O1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9JHtpdXJlc3RWYXJ9Pml1cmVzdC5jb208L2E+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgPC90Ym9keT5cbiAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgYDtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBncmVldFRleHQoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh1c2VyLCB1cmwpIHtcblxuICAgICAgICBsZXQgZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQgPSBFbWFpbENvbnRlbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IGxhbmd1YWdlOiB1c2VyLnByb2ZpbGUubGFuZ3VhZ2VfY29kZSB9KTtcbiAgICAgICAgbGV0IGdyZWV0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdncmVldFZhcicpO1xuICAgICAgICBsZXQgd2VsY29tZU1zZ1ZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnd2VsY29tZU1zZ1ZhcicpO1xuICAgICAgICBsZXQgYnRuVGV4dFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnYnRuVGV4dFZhcicpO1xuICAgICAgICBsZXQgYmVmb3JlTXNnVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdiZWZvcmVNc2dWYXInKTtcbiAgICAgICAgbGV0IHJlZ2FyZFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVnYXJkVmFyJyk7XG4gICAgICAgIGxldCBmb2xsb3dNc2dWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2ZvbGxvd01zZ1ZhcicpO1xuXG4gICAgICAgIHZhciBncmVldGluZyA9ICh1c2VyLnByb2ZpbGUgJiYgdXNlci5wcm9maWxlLmZpcnN0X25hbWUpID8gKGdyZWV0VmFyICsgdXNlci5wcm9maWxlLmZpcnN0X25hbWUgKyBcIixcIikgOiBncmVldFZhcjtcblxuICAgICAgICByZXR1cm4gYCAgICAke2dyZWV0aW5nfVxuICAgICAgICAgICAgICAgICAgICAke3dlbGNvbWVNc2dWYXJ9XG4gICAgICAgICAgICAgICAgICAgICR7dXJsfVxuICAgICAgICAgICAgICAgICAgICAke2JlZm9yZU1zZ1Zhcn1cbiAgICAgICAgICAgICAgICAgICAgJHtyZWdhcmRWYXJ9XG4gICAgICAgICAgICAgICBgO1xuICAgIH1cbn1cblxuQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMgPSB7XG4gICAgZnJvbTogJycsXG4gICAgc2l0ZU5hbWU6IE1ldGVvci5hYnNvbHV0ZVVybCgpLnJlcGxhY2UoL15odHRwcz86XFwvXFwvLywgJycpLnJlcGxhY2UoL1xcLyQvLCAnJyksXG4gICAgcmVzZXRQYXNzd29yZDoge1xuICAgICAgICBzdWJqZWN0OiBmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgbGV0IGVtYWlsQ29udGVudDogRW1haWxDb250ZW50ID0gRW1haWxDb250ZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBsYW5ndWFnZTogdXNlci5wcm9maWxlLmxhbmd1YWdlX2NvZGUgfSk7XG4gICAgICAgICAgICBsZXQgc3ViamVjdFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVzZXRQYXNzd29yZFN1YmplY3RWYXInKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN1YmplY3RWYXIgKyAnICcgKyBBY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5zaXRlTmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgaHRtbDogZ3JlZXQoKSxcbiAgICAgICAgdGV4dDogZ3JlZXRUZXh0KCksXG4gICAgfSxcbiAgICB2ZXJpZnlFbWFpbDoge1xuICAgICAgICBzdWJqZWN0OiBmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgcmV0dXJuIFwiSG93IHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzIG9uIFwiICsgQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuc2l0ZU5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IGdyZWV0KClcbiAgICB9LFxuICAgIGVucm9sbEFjY291bnQ6IHtcbiAgICAgICAgc3ViamVjdDogZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkFuIGFjY291bnQgaGFzIGJlZW4gY3JlYXRlZCBmb3IgeW91IG9uIFwiICsgQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuc2l0ZU5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IGdyZWV0KClcbiAgICB9XG59O1xuXG5cbkFjY291bnRzLmVtYWlsVGVtcGxhdGVzLnJlc2V0UGFzc3dvcmQuZnJvbSA9ICgpID0+IHtcbiAgICBsZXQgZnJvbVZhciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2Zyb21fZW1haWwnIH0pLnZhbHVlO1xuICAgIHJldHVybiBmcm9tVmFyO1xufTtcbiIsImltcG9ydCB7IE1lbnVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBNZW51IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC9tZW51Lm1vZGVsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRNZW51cygpIHtcblxuICAgIGlmIChNZW51cy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDApIHtcblxuICAgICAgICBjb25zdCBtZW51czogTWVudVtdID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCI5MDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5EQVNIQk9BUkQuREFTSEJPQVJEXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvZGFzaGJvYXJkXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInRyZW5kaW5nIHVwXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDkwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiOTEwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuREFTSEJPQVJELkRBU0hCT0FSRFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2Rhc2hib2FyZHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwidHJlbmRpbmcgdXBcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogOTEwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMDAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlJFV0FSRFNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9yZXdhcmRzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImdyYWRlXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEwMDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxNTAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFQUFJPVkVfUkVXQVJEU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2FwcHJvdmUtcmV3YXJkc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJhc3NpZ25tZW50XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDE1MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxNjAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkdJVkVfTUVEQUxcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9naXZlLW1lZGFsc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJjYXJkX2dpZnRjYXJkXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDE2MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uTUFOQUdFTUVOVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwic3VwZXJ2aXNvciBhY2NvdW50XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEwMDAsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46XG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLlJFU1RBVVJBTlRTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAxMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLk1ZX1JFU1RBVVJBTlRTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvZXN0YWJsaXNobWVudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwMTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5QUk9GSUxFXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvZXN0YWJsaXNobWVudC1wcm9maWxlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAxMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS8qLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDEzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uTU9OVEhMWV9DT05GSUdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9lc3RhYmxpc2htZW50LWxpc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDEzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfS8qLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5UQUJMRVNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDIxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uVEFCTEVTX1NFQVJDSFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3RhYmxlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwMjFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMjJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5UQUJMRV9DT05UUk9MXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvZXN0YWJsaXNobWVudC10YWJsZS1jb250cm9sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAyMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9Ki8sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwM1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLkNPTExBQk9SQVRPUlNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9jb2xsYWJvcmF0b3JzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjExMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BUFBST1ZFX1JFV0FSRFNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9zdXBlcnZpc29yLWFwcHJvdmUtcmV3YXJkc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJhc3NpZ25tZW50XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDExMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjEyMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5HSVZFX01FREFMXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc3VwZXJ2aXNvci1naXZlLW1lZGFsc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJjYXJkX2dpZnRjYXJkXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKntcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTIwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLlRBQkxFU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3N1cGVydmlzb3ItdGFibGVzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInJlc3RhdXJhbnRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTMwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLlRBQkxFX0NPTlRST0xcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9zdXBlcnZpc29yLWVzdGFibGlzaG1lbnQtdGFibGUtY29udHJvbFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEzMDBcbiAgICAgICAgICAgIH0sKi9cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMjAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlBBWU1FTlRTLkJBR1NcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInBheW1lbnRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMjAwMCxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjpcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIyMDAxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuUEFZTUVOVFMuUFVSQ0hBU0VfQkFHU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2JhZ3MtcGF5bWVudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMjAwMVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMjAwMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlBBWU1FTlRTLlBBWU1FTlRfSElTVE9SWVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3BheW1lbnQtaGlzdG9yeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMjAwMlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIzMDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLk1FTlVfREVGSU5JVElPTlwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwibGlzdFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAzMDAwLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOlxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjMwMDFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uU0VDVElPTlNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9zZWN0aW9uc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwMVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIzMDAyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLkNBVEVHT1JJRVNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9jYXRlZ29yaWVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAzMDAyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjMwMDNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uU1VCQ0FURUdPUklFU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3N1YmNhdGVnb3JpZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDMwMDNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwNFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5BRERJVElPTlNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9hZGRpdGlvbnNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDMwMDRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwNVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5PUFRJT05TX1ZBTFVFU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDMwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjMwMDUxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5PUFRJT05TXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9vcHRpb25zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwNTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjMwMDUyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5WQUxVRVNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL29wdGlvbi12YWx1ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAzMDA1MlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIzMDA2XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLklURU1TXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvaXRlbXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDMwMDZcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qe1xuICAgICAgICAgICAgICAgIF9pZDogXCIzMTAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLklURU1TX0VOQUJMRVwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2l0ZW1zLWVuYWJsZS1zdXBcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiZG9uZSBhbGxcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMzEwMFxuICAgICAgICAgICAgfSwqL1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCI0MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuT1JERVJTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvb3JkZXJzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImRuc1wiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA0MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCI2MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuV0FJVEVSX0NBTExcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC93YWl0ZXItY2FsbFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJyZWNvcmRfdm9pY2Vfb3ZlclwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA2MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCI3MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLk9SREVSU19DSEVGXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvY2hlZi1vcmRlcnNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwibGlzdFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA3MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCI4MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQ0FMTFNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9jYWxsc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJwYW5fdG9vbFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA4MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCI5MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLk1FTlVfREVGSU5JVElPTlwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL21lbnUtbGlzdFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJyZXN0YXVyYW50X21lbnVcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogOTAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMjAwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5TRVRUSU5HU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3NldHRpbmdzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInNldHRpbmdzXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDIwMDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMTAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlRBQkxFU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3RhYmxlLWNoYW5nZVwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJjb21wYXJlX2Fycm93c1wiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMTAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTIwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5SRVNUQVVSQU5UX0VYSVRcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9lc3RhYmxpc2htZW50LWV4aXRcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiZXhpdF90b19hcHBcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTIwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjE5MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuUE9JTlRTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvcG9pbnRzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInBheW1lbnRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTkwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjEzMDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uT1JERVJTX1RPREFZXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvY2FzaGllci1vcmRlcnMtdG9kYXlcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiYXNzaWdubWVudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMzAwMFxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICBtZW51cy5mb3JFYWNoKChtZW51OiBNZW51KSA9PiBNZW51cy5pbnNlcnQobWVudSkpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFJvbGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3JvbGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC9yb2xlLm1vZGVsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRSb2xlcygpIHtcblxuICAgIGlmIChSb2xlcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDApIHtcblxuICAgICAgICBjb25zdCByb2xlczogUm9sZVtdID0gW3tcbiAgICAgICAgICAgIF9pZDogXCIxMDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IFwiUk9MRS5BRE1JTklTVFJBVE9SXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJlc3RhYmxpc2htZW50IGFkbWluaXN0cmF0b3JcIixcbiAgICAgICAgICAgIG1lbnVzOiBbXCI5MDBcIiwgXCIxMDAwXCIsIFwiMjAwMFwiLCBcIjMwMDBcIiwgXCIxMDAwMFwiLCBcIjE1MDAwXCIsIFwiMTYwMDBcIiwgXCIyMDAwMFwiXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBfaWQ6IFwiNDAwXCIsXG4gICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiBcIlJPTEUuQ1VTVE9NRVJcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImVzdGFibGlzaG1lbnQgY3VzdG9tZXJcIixcbiAgICAgICAgICAgIG1lbnVzOiBbXCI0MDAwXCIsIFwiNjAwMFwiLCBcIjExMDAwXCIsIFwiMTIwMDBcIiwgXCIyMDAwMFwiLCBcIjE5MDAwXCJdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIF9pZDogXCI2MDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IFwiUk9MRS5TVVBFUlZJU09SXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJlc3RhYmxpc2htZW50IHN1cGVydmlzb3JcIixcbiAgICAgICAgICAgIG1lbnVzOiBbXCI5MTBcIiwgXCIxMTAwXCIsIFwiMTIwMFwiLCBcIjIwMDAwXCJdLFxuICAgICAgICAgICAgdXNlcl9wcmVmaXg6ICdzcCdcbiAgICAgICAgfV07XG5cbiAgICAgICAgcm9sZXMuZm9yRWFjaCgocm9sZTogUm9sZSkgPT4gUm9sZXMuaW5zZXJ0KHJvbGUpKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ291bnRyaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2NvdW50cnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDb3VudHJ5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9jb3VudHJ5Lm1vZGVsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRDb3VudHJpZXMoKSB7XG4gICAgaWYgKENvdW50cmllcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDApIHtcbiAgICAgICAgY29uc3QgY291bnRyaWVzOiBDb3VudHJ5W10gPSBbXG4gICAgICAgICAgICB7IF9pZDogJzEwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQUxCQU5JQScsIGFsZmFDb2RlMjogJ0FMJywgYWxmYUNvZGUzOiAnQUxCJywgbnVtZXJpY0NvZGU6ICcwMDgnLCBpbmRpY2F0aXZlOiAnKCsgMzU1KScsIGN1cnJlbmN5SWQ6ICcyNzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR0VSTUFOWScsIGFsZmFDb2RlMjogJ0RFJywgYWxmYUNvZGUzOiAnREVVJywgbnVtZXJpY0NvZGU6ICcyNzYnLCBpbmRpY2F0aXZlOiAnKCsgNDkpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BTkRPUlJBJywgYWxmYUNvZGUyOiAnQUQnLCBhbGZhQ29kZTM6ICdBTkQnLCBudW1lcmljQ29kZTogJzAyMCcsIGluZGljYXRpdmU6ICcoKyAzNzYpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BUkdFTlRJTkEnLCBhbGZhQ29kZTI6ICdBUicsIGFsZmFDb2RlMzogJ0FSRycsIG51bWVyaWNDb2RlOiAnMDMyJywgaW5kaWNhdGl2ZTogJygrIDU0KScsIGN1cnJlbmN5SWQ6ICczNzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAxMTcsIHRhYmxlUHJpY2U6IDMsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJzEgMCA2ICogKicsIGNyb25DaGFuZ2VGcmVlRGF5czogJzAgMCAxICogKicsIGNyb25FbWFpbENoYXJnZVNvb246ICczMCAxNyAyOCAqIConLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnMzAgMTcgMyAqIConLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJzEwIDAgNiAqIConLCBtYXhfbnVtYmVyX3RhYmxlczogMTAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFSTUVOSUEnLCBhbGZhQ29kZTI6ICdBTScsIGFsZmFDb2RlMzogJ0FSTScsIG51bWVyaWNDb2RlOiAnMDUxJywgaW5kaWNhdGl2ZTogJygrIDM3NCknLCBjdXJyZW5jeUlkOiAnMTkwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFVU1RSSUEnLCBhbGZhQ29kZTI6ICdBVCcsIGFsZmFDb2RlMzogJ0FVVCcsIG51bWVyaWNDb2RlOiAnMDQwJywgaW5kaWNhdGl2ZTogJygrIDQzKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzcwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQVpFUkJBSUpBTicsIGFsZmFDb2RlMjogJ0FaJywgYWxmYUNvZGUzOiAnQVpFJywgbnVtZXJpY0NvZGU6ICcwMzEnLCBpbmRpY2F0aXZlOiAnKCsgOTk0KScsIGN1cnJlbmN5SWQ6ICczNTAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQkVMR0lVTScsIGFsZmFDb2RlMjogJ0JFJywgYWxmYUNvZGUzOiAnQkVMJywgbnVtZXJpY0NvZGU6ICcwNTYnLCBpbmRpY2F0aXZlOiAnKCsgMzIpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnOTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5CRUxJWkUnLCBhbGZhQ29kZTI6ICdCWicsIGFsZmFDb2RlMzogJ0JMWicsIG51bWVyaWNDb2RlOiAnMDg0JywgaW5kaWNhdGl2ZTogJygrIDUwMSknLCBjdXJyZW5jeUlkOiAnMTMwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5CRVJNVURBUycsIGFsZmFDb2RlMjogJ0JNJywgYWxmYUNvZGUzOiAnQk1VJywgbnVtZXJpY0NvZGU6ICcwNjAnLCBpbmRpY2F0aXZlOiAnKCsgMTAwNCknLCBjdXJyZW5jeUlkOiAnMTQwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5CRUxBUlVTJywgYWxmYUNvZGUyOiAnQlknLCBhbGZhQ29kZTM6ICdCTFInLCBudW1lcmljQ29kZTogJzExMicsIGluZGljYXRpdmU6ICcoKyAzNzUpJywgY3VycmVuY3lJZDogJzQ0MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQk9MSVZJQScsIGFsZmFDb2RlMjogJ0JPJywgYWxmYUNvZGUzOiAnQk9MJywgbnVtZXJpY0NvZGU6ICcwNjgnLCBpbmRpY2F0aXZlOiAnKCsgNTkxKScsIGN1cnJlbmN5SWQ6ICczMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTMwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQk9TTklBX0hFUlpFR09WSU5BJywgYWxmYUNvZGUyOiAnQkEnLCBhbGZhQ29kZTM6ICdCSUgnLCBudW1lcmljQ29kZTogJzA3MCcsIGluZGljYXRpdmU6ICcoKyAzODcpJywgY3VycmVuY3lJZDogJzM2MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQlJBWklMJywgYWxmYUNvZGUyOiAnQlInLCBhbGZhQ29kZTM6ICdCUkEnLCBudW1lcmljQ29kZTogJzA3NicsIGluZGljYXRpdmU6ICcoKyA1NSknLCBjdXJyZW5jeUlkOiAnNDMwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5CVUxHQVJJQScsIGFsZmFDb2RlMjogJ0JHJywgYWxmYUNvZGUzOiAnQkdSJywgbnVtZXJpY0NvZGU6ICcxMDAnLCBpbmRpY2F0aXZlOiAnKCsgMzU5KScsIGN1cnJlbmN5SWQ6ICczMTAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE2MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNBTkFEQScsIGFsZmFDb2RlMjogJ0NBJywgYWxmYUNvZGUzOiAnQ0FOJywgbnVtZXJpY0NvZGU6ICcxMjQnLCBpbmRpY2F0aXZlOiAnKCsgMDAxKScsIGN1cnJlbmN5SWQ6ICcxNTAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE3MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNISUxFJywgYWxmYUNvZGUyOiAnQ0wnLCBhbGZhQ29kZTM6ICdDSEwnLCBudW1lcmljQ29kZTogJzE1MicsIGluZGljYXRpdmU6ICcoKyA1NiknLCBjdXJyZW5jeUlkOiAnMzgwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogNDMwMCwgdGFibGVQcmljZTogMTA2LCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcxIDAgNiAqIConLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcwIDAgMSAqIConLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnMzAgMTcgMjggKiAqJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJzMwIDE3IDMgKiAqJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcxMCAwIDYgKiAqJywgbWF4X251bWJlcl90YWJsZXM6IDEwMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQ1lQUlVTJywgYWxmYUNvZGUyOiAnQ1knLCBhbGZhQ29kZTM6ICdDWVAnLCBudW1lcmljQ29kZTogJzE5NicsIGluZGljYXRpdmU6ICcoKzM1NyknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxOTAwJywgaXNfYWN0aXZlOiB0cnVlLCBuYW1lOiAnQ09VTlRSSUVTLkNPTE9NQklBJywgYWxmYUNvZGUyOiAnQ08nLCBhbGZhQ29kZTM6ICdDT0wnLCBudW1lcmljQ29kZTogJzE3MCcsIGluZGljYXRpdmU6ICcoKyA1NyknLCBjdXJyZW5jeUlkOiAnMzkwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMjIwMDAsIHRhYmxlUHJpY2U6IDIwMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnMSAwIDYgKiAqJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnMCAwIDEgKiAqJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJzMwIDE3IDI4ICogKicsIGNyb25FbWFpbEV4cGlyZVNvb246ICczMCAxNyAzICogKicsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnMTAgMCA2ICogKicsIG1heF9udW1iZXJfdGFibGVzOiAxMDAsIGNyb25Qb2ludHNFeHBpcmU6ICcxNSAwICogKiAqJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5DT1NUQV9SSUNBJywgYWxmYUNvZGUyOiAnQ1InLCBhbGZhQ29kZTM6ICdDUkknLCBudW1lcmljQ29kZTogJzE4OCcsIGluZGljYXRpdmU6ICcoKyA1MDYpJywgY3VycmVuY3lJZDogJzQwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5DUk9BVElBJywgYWxmYUNvZGUyOiAnSFInLCBhbGZhQ29kZTM6ICdIUlYnLCBudW1lcmljQ29kZTogJzE5MScsIGluZGljYXRpdmU6ICcoKyAzODUpJywgY3VycmVuY3lJZDogJzI1MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuREVOTUFSSycsIGFsZmFDb2RlMjogJ0RLJywgYWxmYUNvZGUzOiAnRE5LJywgbnVtZXJpY0NvZGU6ICcyMDgnLCBpbmRpY2F0aXZlOiAnKCsgNDUpJywgY3VycmVuY3lJZDogJzcwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5FQ1VBRE9SJywgYWxmYUNvZGUyOiAnRUMnLCBhbGZhQ29kZTM6ICdFQ1UnLCBudW1lcmljQ29kZTogJzIxOCcsIGluZGljYXRpdmU6ICcoKyA1OTMpJywgY3VycmVuY3lJZDogJzE2MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuRUxfU0FMVkFET1InLCBhbGZhQ29kZTI6ICdTVicsIGFsZmFDb2RlMzogJ1NMVicsIG51bWVyaWNDb2RlOiAnMjIyJywgaW5kaWNhdGl2ZTogJygrIDUwMyknLCBjdXJyZW5jeUlkOiAnMTYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TTE9WQUtJQScsIGFsZmFDb2RlMjogJ1NLJywgYWxmYUNvZGUzOiAnU1ZLJywgbnVtZXJpY0NvZGU6ICc3MDMnLCBpbmRpY2F0aXZlOiAnKCsgNDIxKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI2MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlNMT1ZFTklBJywgYWxmYUNvZGUyOiAnU0knLCBhbGZhQ29kZTM6ICdTVk4nLCBudW1lcmljQ29kZTogJzcwNScsIGluZGljYXRpdmU6ICcoKyAzODYpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjcwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU1BBSU4nLCBhbGZhQ29kZTI6ICdFUycsIGFsZmFDb2RlMzogJ0VTUCcsIG51bWVyaWNDb2RlOiAnNzI0JywgaW5kaWNhdGl2ZTogJygrIDM0KScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlVOSVRFRF9TVEFURVMnLCBhbGZhQ29kZTI6ICdVUycsIGFsZmFDb2RlMzogJ1VTQScsIG51bWVyaWNDb2RlOiAnODQwJywgaW5kaWNhdGl2ZTogJygrIDEpJywgY3VycmVuY3lJZDogJzE2MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuRVNUT05JQScsIGFsZmFDb2RlMjogJ0VFJywgYWxmYUNvZGUzOiAnRVNUJywgbnVtZXJpY0NvZGU6ICcyMzMnLCBpbmRpY2F0aXZlOiAnKCsgMzcyKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMwMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkZJTkxBTkQnLCBhbGZhQ29kZTI6ICdGSScsIGFsZmFDb2RlMzogJ0ZJTicsIG51bWVyaWNDb2RlOiAnMjQ2JywgaW5kaWNhdGl2ZTogJygrIDM1OCknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5GUkFOQ0UnLCBhbGZhQ29kZTI6ICdGUicsIGFsZmFDb2RlMzogJ0ZSQScsIG51bWVyaWNDb2RlOiAnMjUwJywgaW5kaWNhdGl2ZTogJygrIDMzKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkdFT1JHSUEnLCBhbGZhQ29kZTI6ICdHRScsIGFsZmFDb2RlMzogJ0dFTycsIG51bWVyaWNDb2RlOiAnMjY4JywgaW5kaWNhdGl2ZTogJygrIDk5NSknLCBjdXJyZW5jeUlkOiAnMjYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5HUkVFQ0UnLCBhbGZhQ29kZTI6ICdHUicsIGFsZmFDb2RlMzogJ0dSQycsIG51bWVyaWNDb2RlOiAnMzAwJywgaW5kaWNhdGl2ZTogJygrIDMwKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzM0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkdSRUVOTEFORCcsIGFsZmFDb2RlMjogJ0dMJywgYWxmYUNvZGUzOiAnR1JMJywgbnVtZXJpY0NvZGU6ICczMDQnLCBpbmRpY2F0aXZlOiAnKCsgMjk5KScsIGN1cnJlbmN5SWQ6ICc3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzUwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR1VBVEVNQUxBJywgYWxmYUNvZGUyOiAnR1QnLCBhbGZhQ29kZTM6ICdHVE0nLCBudW1lcmljQ29kZTogJzMyMCcsIGluZGljYXRpdmU6ICcoKyA1MDIpJywgY3VycmVuY3lJZDogJzQyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzYwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuRlJFTkNIX0dVSUFOQScsIGFsZmFDb2RlMjogJ0dGJywgYWxmYUNvZGUzOiAnR1VGJywgbnVtZXJpY0NvZGU6ICcyNTQnLCBpbmRpY2F0aXZlOiAnKCsgNTk0KScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzM3MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkdVWUFOQScsIGFsZmFDb2RlMjogJ0dZJywgYWxmYUNvZGUzOiAnR1VZJywgbnVtZXJpY0NvZGU6ICczMjgnLCBpbmRpY2F0aXZlOiAnKCsgNTkyKScsIGN1cnJlbmN5SWQ6ICcxNzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzM4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkhPTkRVUkFTJywgYWxmYUNvZGUyOiAnSE4nLCBhbGZhQ29kZTM6ICdITkQnLCBudW1lcmljQ29kZTogJzM0MCcsIGluZGljYXRpdmU6ICcoKyA1MDQpJywgY3VycmVuY3lJZDogJzI4MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuSFVOR0FSWScsIGFsZmFDb2RlMjogJ0hVJywgYWxmYUNvZGUzOiAnSFVOJywgbnVtZXJpY0NvZGU6ICczNDgnLCBpbmRpY2F0aXZlOiAnKCsgMzYpJywgY3VycmVuY3lJZDogJzIxMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuSVJFTEFORCcsIGFsZmFDb2RlMjogJ0lFJywgYWxmYUNvZGUzOiAnSVJMJywgbnVtZXJpY0NvZGU6ICczNzInLCBpbmRpY2F0aXZlOiAnKCsgMzUzKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQxMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLklDRUxBTkQnLCBhbGZhQ29kZTI6ICdJUycsIGFsZmFDb2RlMzogJ0lTTCcsIG51bWVyaWNDb2RlOiAnMzUyJywgaW5kaWNhdGl2ZTogJygrIDM1NCknLCBjdXJyZW5jeUlkOiAnODAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkZBTEtMQU5EX0lTTEFORFMnLCBhbGZhQ29kZTI6ICdGSycsIGFsZmFDb2RlMzogJ0ZMSycsIG51bWVyaWNDb2RlOiAnMjM4JywgaW5kaWNhdGl2ZTogJygrIDUwMCknLCBjdXJyZW5jeUlkOiAnMzMwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0MzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5JVEFMWScsIGFsZmFDb2RlMjogJ0lUJywgYWxmYUNvZGUzOiAnSVRBJywgbnVtZXJpY0NvZGU6ICczODAnLCBpbmRpY2F0aXZlOiAnKCsgMzkpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuS0FaQUtIU1RBTicsIGFsZmFDb2RlMjogJ0taJywgYWxmYUNvZGUzOiAnS0FaJywgbnVtZXJpY0NvZGU6ICczOTgnLCBpbmRpY2F0aXZlOiAnKCsgNzMxKScsIGN1cnJlbmN5SWQ6ICc0NzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkxBVFZJQScsIGFsZmFDb2RlMjogJ0xWJywgYWxmYUNvZGUzOiAnTFZBJywgbnVtZXJpY0NvZGU6ICc0MjgnLCBpbmRpY2F0aXZlOiAnKCsgMzcxKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ2MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkxJRUNIVEVOU1RFSU4nLCBhbGZhQ29kZTI6ICdMSScsIGFsZmFDb2RlMzogJ0xJRScsIG51bWVyaWNDb2RlOiAnNDM4JywgaW5kaWNhdGl2ZTogJygrIDQxNyknLCBjdXJyZW5jeUlkOiAnMjIwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5MSVRIVUFOSUEnLCBhbGZhQ29kZTI6ICdMVCcsIGFsZmFDb2RlMzogJ0xUVScsIG51bWVyaWNDb2RlOiAnNDQwJywgaW5kaWNhdGl2ZTogJygrIDM3MCknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0ODAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5MVVhFTUJPVVJHJywgYWxmYUNvZGUyOiAnTFUnLCBhbGZhQ29kZTM6ICdMVVgnLCBudW1lcmljQ29kZTogJzQ0MicsIGluZGljYXRpdmU6ICcoKyAzNTIpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTUFDRURPTklBJywgYWxmYUNvZGUyOiAnTUsnLCBhbGZhQ29kZTM6ICdNS0QnLCBudW1lcmljQ29kZTogJzgwNycsIGluZGljYXRpdmU6ICcoKyAzODkpJywgY3VycmVuY3lJZDogJzExMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTUFMVEEnLCBhbGZhQ29kZTI6ICdNVCcsIGFsZmFDb2RlMzogJ01MVCcsIG51bWVyaWNDb2RlOiAnNDcwJywgaW5kaWNhdGl2ZTogJygrIDM1NiknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1MTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NRVhJQ08nLCBhbGZhQ29kZTI6ICdNWCcsIGFsZmFDb2RlMzogJ01FWCcsIG51bWVyaWNDb2RlOiAnNDg0JywgaW5kaWNhdGl2ZTogJygrIDUyKScsIGN1cnJlbmN5SWQ6ICc0MDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLk1PTERBVklBJywgYWxmYUNvZGUyOiAnTUQnLCBhbGZhQ29kZTM6ICdNREEnLCBudW1lcmljQ29kZTogJzQ5OCcsIGluZGljYXRpdmU6ICcoKyAzNzMpJywgY3VycmVuY3lJZDogJzI5MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTMwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTU9OQUNPJywgYWxmYUNvZGUyOiAnTUMnLCBhbGZhQ29kZTM6ICdNQ08nLCBudW1lcmljQ29kZTogJzQ5MicsIGluZGljYXRpdmU6ICcoKyAzNzcpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTU9OVEVORUdSTycsIGFsZmFDb2RlMjogJ01FJywgYWxmYUNvZGUzOiAnTU5FJywgbnVtZXJpY0NvZGU6ICc0OTknLCBpbmRpY2F0aXZlOiAnKCsgMzgyKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzU1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLk5JQ0FSQUdVQScsIGFsZmFDb2RlMjogJ05JJywgYWxmYUNvZGUzOiAnTklDJywgbnVtZXJpY0NvZGU6ICc1NTgnLCBpbmRpY2F0aXZlOiAnKCsgNTA1KScsIGN1cnJlbmN5SWQ6ICc1MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTYwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTk9SV0FZJywgYWxmYUNvZGUyOiAnTk8nLCBhbGZhQ29kZTM6ICdOT1InLCBudW1lcmljQ29kZTogJzU3OCcsIGluZGljYXRpdmU6ICcoKyA0NyknLCBjdXJyZW5jeUlkOiAnOTAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzU3MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLk5FVEhFUkxBTkRTJywgYWxmYUNvZGUyOiAnTkwnLCBhbGZhQ29kZTM6ICdOTEQnLCBudW1lcmljQ29kZTogJzUyOCcsIGluZGljYXRpdmU6ICcoKyAzMSknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1ODAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5QQU5BTUEnLCBhbGZhQ29kZTI6ICdQQScsIGFsZmFDb2RlMzogJ1BBTicsIG51bWVyaWNDb2RlOiAnNTkxJywgaW5kaWNhdGl2ZTogJygrIDUwNyknLCBjdXJyZW5jeUlkOiAnMTAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzU5MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlBBUkFHVUFZJywgYWxmYUNvZGUyOiAnUFknLCBhbGZhQ29kZTM6ICdQUlknLCBudW1lcmljQ29kZTogJzYwMCcsIGluZGljYXRpdmU6ICcoKyA1OTUpJywgY3VycmVuY3lJZDogJzI0MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuUEVSVScsIGFsZmFDb2RlMjogJ1BFJywgYWxmYUNvZGUzOiAnUEVSJywgbnVtZXJpY0NvZGU6ICc2MDQnLCBpbmRpY2F0aXZlOiAnKCsgNTEpJywgY3VycmVuY3lJZDogJzQ2MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDIyLCB0YWJsZVByaWNlOiAwLjYsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJzEgMCA2ICogKicsIGNyb25DaGFuZ2VGcmVlRGF5czogJzAgMCAxICogKicsIGNyb25FbWFpbENoYXJnZVNvb246ICczMCAxNyAyOCAqIConLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnMzAgMTcgMyAqIConLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJzEwIDAgNiAqIConLCBtYXhfbnVtYmVyX3RhYmxlczogMTAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5QT0xBTkQnLCBhbGZhQ29kZTI6ICdQTCcsIGFsZmFDb2RlMzogJ1BPTCcsIG51bWVyaWNDb2RlOiAnNjE2JywgaW5kaWNhdGl2ZTogJygrIDQ4KScsIGN1cnJlbmN5SWQ6ICc0ODAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzYyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlBPUlRVR0FMJywgYWxmYUNvZGUyOiAnUFQnLCBhbGZhQ29kZTM6ICdQUlQnLCBudW1lcmljQ29kZTogJzYyMCcsIGluZGljYXRpdmU6ICcoKyAzNTEpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjMwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVU5JVEVEX0tJTkdET00nLCBhbGZhQ29kZTI6ICdHQicsIGFsZmFDb2RlMzogJ0dCUicsIG51bWVyaWNDb2RlOiAnODI2JywgaW5kaWNhdGl2ZTogJygrIDQ0KScsIGN1cnJlbmN5SWQ6ICczMjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNaRUNIX1JFUFVCTElDJywgYWxmYUNvZGUyOiAnQ1onLCBhbGZhQ29kZTM6ICdDWkUnLCBudW1lcmljQ29kZTogJzIwMycsIGluZGljYXRpdmU6ICcoKyA0MiknLCBjdXJyZW5jeUlkOiAnNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlJPTUFOSUEnLCBhbGZhQ29kZTI6ICdSTycsIGFsZmFDb2RlMzogJ1JPVScsIG51bWVyaWNDb2RlOiAnNjQyJywgaW5kaWNhdGl2ZTogJygrIDQwKScsIGN1cnJlbmN5SWQ6ICczMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY2MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlJVU1NJQScsIGFsZmFDb2RlMjogJ1JVJywgYWxmYUNvZGUzOiAnUlVTJywgbnVtZXJpY0NvZGU6ICc2NDMnLCBpbmRpY2F0aXZlOiAnKCsgNyknLCBjdXJyZW5jeUlkOiAnNDUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2NzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TQU5fTUFSSU5PJywgYWxmYUNvZGUyOiAnU00nLCBhbGZhQ29kZTM6ICdTTVInLCBudW1lcmljQ29kZTogJzY3NCcsIGluZGljYXRpdmU6ICcoKyAzNzgpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0FJTlRfUElFUlJFX01JUVVFTE9OJywgYWxmYUNvZGUyOiAnUE0nLCBhbGZhQ29kZTM6ICdTUE0nLCBudW1lcmljQ29kZTogJzY2NicsIGluZGljYXRpdmU6ICcoKyA1MDgpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0VSQklBJywgYWxmYUNvZGUyOiAnUlMnLCBhbGZhQ29kZTM6ICdTUkInLCBudW1lcmljQ29kZTogJzY4OCcsIGluZGljYXRpdmU6ICcoKyAzODEpJywgY3VycmVuY3lJZDogJzEyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU1dFREVOJywgYWxmYUNvZGUyOiAnU0UnLCBhbGZhQ29kZTM6ICdTV0UnLCBudW1lcmljQ29kZTogJzc1MicsIGluZGljYXRpdmU6ICcoKyA0NiknLCBjdXJyZW5jeUlkOiAnMTAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3MTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TV0lUWkVSTEFORCcsIGFsZmFDb2RlMjogJ0NIJywgYWxmYUNvZGUzOiAnQ0hFJywgbnVtZXJpY0NvZGU6ICc3NTYnLCBpbmRpY2F0aXZlOiAnKCsgNDEpJywgY3VycmVuY3lJZDogJzIyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU1VSSU5BTScsIGFsZmFDb2RlMjogJ1NSJywgYWxmYUNvZGUzOiAnU1VSJywgbnVtZXJpY0NvZGU6ICc3NDAnLCBpbmRpY2F0aXZlOiAnKCsgNTk3KScsIGN1cnJlbmN5SWQ6ICcxODAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzczMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlRVUktFWScsIGFsZmFDb2RlMjogJ1RSJywgYWxmYUNvZGUzOiAnVFVSJywgbnVtZXJpY0NvZGU6ICc3OTInLCBpbmRpY2F0aXZlOiAnKCsgOTApJywgY3VycmVuY3lJZDogJzM0MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVUtSQUlORScsIGFsZmFDb2RlMjogJ1VBJywgYWxmYUNvZGUzOiAnVUtSJywgbnVtZXJpY0NvZGU6ICc4MDQnLCBpbmRpY2F0aXZlOiAnKCsgMzgwKScsIGN1cnJlbmN5SWQ6ICcyMzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBlc3RhYmxpc2htZW50X3ByaWNlOiAwLCB0YWJsZVByaWNlOiAwLCBjcm9uVmFsaWRhdGVBY3RpdmU6ICcnLCBjcm9uQ2hhbmdlRnJlZURheXM6ICcnLCBjcm9uRW1haWxDaGFyZ2VTb29uOiAnJywgY3JvbkVtYWlsRXhwaXJlU29vbjogJycsIGNyb25FbWFpbFJlc3RFeHBpcmVkOiAnJywgbWF4X251bWJlcl90YWJsZXM6IDAsIGNyb25Qb2ludHNFeHBpcmU6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzc1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlVSVUdVQVknLCBhbGZhQ29kZTI6ICdVWScsIGFsZmFDb2RlMzogJ1VSWScsIG51bWVyaWNDb2RlOiAnODU4JywgaW5kaWNhdGl2ZTogJygrIDU5OCknLCBjdXJyZW5jeUlkOiAnNDEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgZXN0YWJsaXNobWVudF9wcmljZTogMCwgdGFibGVQcmljZTogMCwgY3JvblZhbGlkYXRlQWN0aXZlOiAnJywgY3JvbkNoYW5nZUZyZWVEYXlzOiAnJywgY3JvbkVtYWlsQ2hhcmdlU29vbjogJycsIGNyb25FbWFpbEV4cGlyZVNvb246ICcnLCBjcm9uRW1haWxSZXN0RXhwaXJlZDogJycsIG1heF9udW1iZXJfdGFibGVzOiAwLCBjcm9uUG9pbnRzRXhwaXJlOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3NjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5WRU5FWlVFTEEnLCBhbGZhQ29kZTI6ICdWRScsIGFsZmFDb2RlMzogJ1ZFTicsIG51bWVyaWNDb2RlOiAnODYyJywgaW5kaWNhdGl2ZTogJygrIDU4KScsIGN1cnJlbmN5SWQ6ICcyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGVzdGFibGlzaG1lbnRfcHJpY2U6IDAsIHRhYmxlUHJpY2U6IDAsIGNyb25WYWxpZGF0ZUFjdGl2ZTogJycsIGNyb25DaGFuZ2VGcmVlRGF5czogJycsIGNyb25FbWFpbENoYXJnZVNvb246ICcnLCBjcm9uRW1haWxFeHBpcmVTb29uOiAnJywgY3JvbkVtYWlsUmVzdEV4cGlyZWQ6ICcnLCBtYXhfbnVtYmVyX3RhYmxlczogMCwgY3JvblBvaW50c0V4cGlyZTogJycgfVxuICAgICAgICBdO1xuICAgICAgICBjb3VudHJpZXMuZm9yRWFjaCgoY291bnRyeTogQ291bnRyeSkgPT4gQ291bnRyaWVzLmluc2VydChjb3VudHJ5KSk7XG4gICAgfVxufSIsImltcG9ydCB7IEN1cnJlbmN5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9jdXJyZW5jeS5tb2RlbCc7XG5pbXBvcnQgeyBDdXJyZW5jaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEN1cnJlbmNpZXMoKXtcbiAgICBpZiggQ3VycmVuY2llcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDAgKXtcbiAgICAgICAgY29uc3QgY3VycmVuY2llczogQ3VycmVuY3lbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQkFMQk9BJywgY29kZTogJ1BBQicsIG51bWVyaWNDb2RlOiAnNTkwJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CT0xJVkFSJywgY29kZTogJ1ZFRicsIG51bWVyaWNDb2RlOiAnOTM3JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CT0xJVklBTk8nLCBjb2RlOiAnQk9CJywgbnVtZXJpY0NvZGU6ICcwNjgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPU1RBX1JJQ0FfQ09MT04nLCBjb2RlOiAnQ1JDJywgbnVtZXJpY0NvZGU6ICcxODgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPUkRPQkEnLCBjb2RlOiAnTklPJywgbnVtZXJpY0NvZGU6ICc1NTgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzYwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNaRUNIX1JFUFVCTElDX0tPUlVOQScsIGNvZGU6ICdDWksnLCBudW1lcmljQ29kZTogJzIwMycsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuREVOTUFSS19LUk9ORScsIGNvZGU6ICdES0snLCBudW1lcmljQ29kZTogJzIwOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnODAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuSUNFTEFORF9LUk9OQScsIGNvZGU6ICdJU0snLCBudW1lcmljQ29kZTogJzM1MicsIGRlY2ltYWw6IDAgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnOTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuTk9SV0FZX0tST05FJywgY29kZTogJ05PSycsIG51bWVyaWNDb2RlOiAnNTc4JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMDAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuU1dFREVOX0tST05BJywgY29kZTogJ1NFSycsIG51bWVyaWNDb2RlOiAnNzUyJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuREVOQVInLCBjb2RlOiAnTUtEJywgbnVtZXJpY0NvZGU6ICc4MDcnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5TRVJCSUFfRElOQVInLCBjb2RlOiAnUlNEJywgbnVtZXJpY0NvZGU6ICc5NDEnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEzMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CRUxJWkVfRE9MTEFSJywgY29kZTogJ0JaRCcsIG51bWVyaWNDb2RlOiAnMDg0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNDAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQkVSTVVESUFOX0RPTExBUicsIGNvZGU6ICdCTUQnLCBudW1lcmljQ29kZTogJzA2MCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNBTkFESUFOX0RPTExBUicsIGNvZGU6ICdDQUQnLCBudW1lcmljQ29kZTogJzEyNCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTYwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVOSVRFRF9TVEFURVNfRE9MTEFSJywgY29kZTogJ1VTRCcsIG51bWVyaWNDb2RlOiAnODQwJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuR1VZQU5BX0RPTExBUicsIGNvZGU6ICdHWUQnLCBudW1lcmljQ29kZTogJzMyOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTgwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlNVUklOQU1FX0RPTExBUicsIGNvZGU6ICdTUkQnLCBudW1lcmljQ29kZTogJzk2OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTkwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFSTUVOSUFNX0RSQU0nLCBjb2RlOiAnQU1EJywgbnVtZXJpY0NvZGU6ICcwNTEnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5FVVJPJywgY29kZTogJ0VVUicsIG51bWVyaWNDb2RlOiAnOTc4JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuSFVOR0FSWV9GT1JJTlQnLCBjb2RlOiAnSFVGJywgbnVtZXJpY0NvZGU6ICczNDgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5GUkFOQycsIGNvZGU6ICdDSEYnLCBudW1lcmljQ29kZTogJzc1NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjMwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVLUkFJTkVfSFJZVk5JQScsIGNvZGU6ICdVQUgnLCBudW1lcmljQ29kZTogJzk4MCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkdVQVJBTkknLCBjb2RlOiAnUFlHJywgbnVtZXJpY0NvZGU6ICc2MDAnLCBkZWNpbWFsOiAwIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI1MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5LVU5BJywgY29kZTogJ0hSSycsIG51bWVyaWNDb2RlOiAnMTkxJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuTEFSSScsIGNvZGU6ICdHRUwnLCBudW1lcmljQ29kZTogJzk4MScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjcwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkxFSycsIGNvZGU6ICdBTEwnLCBudW1lcmljQ29kZTogJzAwOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjgwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkxFTVBJUkEnLCBjb2RlOiAnSE5MJywgbnVtZXJpY0NvZGU6ICczNDAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI5MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5NT0xET1ZBX0xFVScsIGNvZGU6ICdNREwnLCBudW1lcmljQ29kZTogJzQ5OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlJPTUFOSUFOX0xFVScsIGNvZGU6ICdST04nLCBudW1lcmljQ29kZTogJzk0NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzEwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkJVTEdBUklBX0xFVicsIGNvZGU6ICdCR04nLCBudW1lcmljQ29kZTogJzk3NScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzIwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlBPVU5EX1NURVJMSU5HJywgY29kZTogJ0dCUCcsIG51bWVyaWNDb2RlOiAnODI2JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuRkFMS0xBTkRfSVNMQU5EU19QT1VORCcsIGNvZGU6ICdGS1AnLCBudW1lcmljQ29kZTogJzIzOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlRVUktJU0hfTElSQScsIGNvZGU6ICdUUlknLCBudW1lcmljQ29kZTogJzk0OScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFaRVJCQUlKQU5JX01BTkFUJywgY29kZTogJ0FaTicsIG51bWVyaWNDb2RlOiAnOTQ0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczNjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQ09OVkVSVElCTEVfTUFSSycsIGNvZGU6ICdCQU0nLCBudW1lcmljQ29kZTogJzk3NycsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzcwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFSR0VOVElOQV9QRVNPJywgY29kZTogJ0FSUycsIG51bWVyaWNDb2RlOiAnMDMyJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczODAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQ0hJTEVfUEVTTycsIGNvZGU6ICdDTFAnLCBudW1lcmljQ29kZTogJzE1MicsIGRlY2ltYWw6IDAgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzkwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPTE9NQklBX1BFU08nLCBjb2RlOiAnQ09QJywgbnVtZXJpY0NvZGU6ICcxNzAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5NRVhJQ09fUEVTTycsIGNvZGU6ICdNWE4nLCBudW1lcmljQ29kZTogJzQ4NCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDEwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVSVUdVQVlfUEVTTycsIGNvZGU6ICdVWVUnLCBudW1lcmljQ29kZTogJzg1OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDIwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlFVRVRaQUwnLCBjb2RlOiAnR1RRJywgbnVtZXJpY0NvZGU6ICczMjAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQzMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CUkFaSUxJQU5fUkVBTCcsIGNvZGU6ICdCUkwnLCBudW1lcmljQ29kZTogJzk4NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkJFTEFSVVNJQU5fUlVCTEUnLCBjb2RlOiAnQllSJywgbnVtZXJpY0NvZGU6ICc5NzQnLCBkZWNpbWFsOiAwIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ1MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5SVVNTSUFOX1JVQkxFJywgY29kZTogJ1JVQicsIG51bWVyaWNDb2RlOiAnNjQzJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuU09MJywgY29kZTogJ1BFTicsIG51bWVyaWNDb2RlOiAnNjA0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuVEVOR0UnLCBjb2RlOiAnS1pUJywgbnVtZXJpY0NvZGU6ICczOTgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ4MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5aTE9UWScsIGNvZGU6ICdQTE4nLCBudW1lcmljQ29kZTogJzk4NScsIGRlY2ltYWw6IDAuMDEgfVxuICAgICAgICBdOyAgICAgICAgXG4gICAgICAgIGN1cnJlbmNpZXMuZm9yRWFjaCggKCBjdXI6Q3VycmVuY3kgKSA9PiBDdXJyZW5jaWVzLmluc2VydCggY3VyICkgKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgRW1haWxDb250ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFbWFpbENvbnRlbnRzKCkge1xuICAgIGlmIChFbWFpbENvbnRlbnRzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBlbWFpbENvbnRlbnRzOiBFbWFpbENvbnRlbnRbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcxMDAnLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgICAgICAgICAgIGxhbmdfZGljdGlvbmFyeTogW1xuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnY2hhcmdlU29vbkVtYWlsU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdZb3VyIG1vbnRobHkgY29tZXlnYW5hIHNlcnZpY2Ugd2lsbCBlbmRzIHNvb24nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdncmVldFZhcicsIHRyYWR1Y3Rpb246ICdIZWxsbycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3dlbGNvbWVNc2dWYXInLCB0cmFkdWN0aW9uOiAnV2UgZ290IGEgcmVxdWVzdCB0byByZXNldCB5b3UgcGFzc3dvcmQsIGlmIGl0IHdhcyB5b3UgY2xpY2sgdGhlIGJ1dHRvbiBhYm92ZS4nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdidG5UZXh0VmFyJywgdHJhZHVjdGlvbjogJ1Jlc2V0JyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnYmVmb3JlTXNnVmFyJywgdHJhZHVjdGlvbjogJ0lmIHlvdSBkbyBub3Qgd2FudCB0byBjaGFuZ2UgdGhlIHBhc3N3b3JkLCBpZ25vcmUgdGhpcyBtZXNzYWdlLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlZ2FyZFZhcicsIHRyYWR1Y3Rpb246ICdUaGFua3MsIGNvbWV5Z2FuYSB0ZWFtLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2ZvbGxvd01zZ1ZhcicsIHRyYWR1Y3Rpb246ICdGb2xsb3cgdXMgb24gc29jaWFsIG5ldHdvcmtzJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyJywgdHJhZHVjdGlvbjogJ1JlbWVtYmVyIHRoYXQgeW91ciBtb250aGx5IGNvbWV5Z2FuYSBzZXJ2aWNlIGZvcjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyMicsIHRyYWR1Y3Rpb246ICdFbmRzIG9uOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdpbnN0cnVjdGlvbmNoYXJnZVNvb25Nc2dWYXInLCB0cmFkdWN0aW9uOiAnSWYgeW91IHdhbnQgdG8gY29udGludWUgdXNpbmcgYWxsIHRoZSBzeXN0ZW0gZmVhdHVyZXMsIGVudGVyaW5nIHdpdGggeW91ciBlbWFpbCBvciB1c2VybmFtZSBhbmQgc2VsZWN0IHRoZSBtZW51IEVzdGFibGlzaG1lbnRzID4gQWRtaW5pc3RyYXRpb24gPiBFZGl0IGVzdGFibGlzaG1lbnQgPiAjIFRhYmxlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyRXhwaXJlU29vbk1zZ1ZhcicsIHRyYWR1Y3Rpb246ICdSZW1lbWJlciB0aGF0IHlvdXIgbW9udGhseSBjb21leWdhbmEgc2VydmljZSBmb3I6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyRXhwaXJlU29vbk1zZ1ZhcjInLCB0cmFkdWN0aW9uOiAnRXhwaXJlcyBvbjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyMycsIHRyYWR1Y3Rpb246ICdJZiB5b3Ugd2FudCB0byBjb250aW51ZSB1c2luZyBhbGwgdGhlIHN5c3RlbSBmZWF0dXJlcywgZW50ZXJpbmcgd2l0aCB5b3VyIGVtYWlsIG9yIHVzZXJuYW1lIGFuZCBzZWxlY3QgdGhlIG1lbnUgUGF5bWVudHMgPiBNb250aGx5IHBheW1lbnQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdleHBpcmVTb29uRW1haWxTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1lvdXIgY29tZXlnYW5hIHNlcnZpY2Ugd2lsbCBleHBpcmUgc29vbicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyUmVzdEV4cGlyZWRWYXInLCB0cmFkdWN0aW9uOiAnWW91ciBtb250aGx5IGNvbWV5Z2FuYSBzZXJ2aWNlIGZvcjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJSZXN0RXhwaXJlZFZhcjInLCB0cmFkdWN0aW9uOiAnSGFzIGV4cGlyZWQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlclJlc3RFeHBpcmVkVmFyMycsIHRyYWR1Y3Rpb246ICdJZiB5b3Ugd2FudCB0byBjb250aW51ZSB1c2luZyBhbGwgdGhlIHN5c3RlbSBmZWF0dXJlcywgZW50ZXJpbmcgd2l0aCB5b3VyIGVtYWlsIG9yIHVzZXJuYW1lIGFuZCBzZWxlY3QgdGhlIG1lbnUgUGF5bWVudHMgPiBSZWFjdGl2YXRlICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3Jlc3RFeHBpcmVkRW1haWxTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1lvdXIgY29tZXlnYW5hIHNlcnZpY2UgaGFzIGV4cGlyZWQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZXNldFBhc3N3b3JkU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdSZXNldCB5b3VyIHBhc3N3b3JkIG9uJyB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcyMDAnLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZXMnLFxuICAgICAgICAgICAgICAgIGxhbmdfZGljdGlvbmFyeTogW1xuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnY2hhcmdlU29vbkVtYWlsU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdUdSBzZXJ2aWNpbyBtZW5zdWFsIGRlIGNvbWV5Z2FuYSB0ZXJtaW5hcsOhIHByb250bycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2dyZWV0VmFyJywgdHJhZHVjdGlvbjogJ0hvbGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICd3ZWxjb21lTXNnVmFyJywgdHJhZHVjdGlvbjogJ0hlbW9zIHJlY2liaWRvIHVuYSBwZXRpY2nDs24gcGFyYSBjYW1iaWFyIHR1IGNvbnRyYXNlw7FhLCBzaSBmdWlzdGUgdHUgaGF6IGNsaWNrIGVuIGVsIGJvdMOzbiBhYmFqbycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2J0blRleHRWYXInLCB0cmFkdWN0aW9uOiAnQ2FtYmlhcicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2JlZm9yZU1zZ1ZhcicsIHRyYWR1Y3Rpb246ICdTaSBubyBxdWllcmVzIGNhbWJpYXIgbGEgY29udHJhc2XDsWEsIGlnbm9yYSBlc3RlIG1lbnNhamUuJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVnYXJkVmFyJywgdHJhZHVjdGlvbjogJ0dyYWNpYXMsIGVxdWlwbyBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdmb2xsb3dNc2dWYXInLCB0cmFkdWN0aW9uOiAnU2lndWVub3MgZW4gcmVkZXMgc29jaWFsZXMnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckNoYXJnZVNvb25Nc2dWYXInLCB0cmFkdWN0aW9uOiAnUmVjdWVyZGEgcXVlIHR1IHNlcnZpY2lvIG1lbnN1YWwgZGUgY29tZXlnYW5hIHBhcmE6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyQ2hhcmdlU29vbk1zZ1ZhcjInLCB0cmFkdWN0aW9uOiAnRmluYWxpemEgZWw6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2luc3RydWN0aW9uY2hhcmdlU29vbk1zZ1ZhcicsIHRyYWR1Y3Rpb246ICdTaSBkZXNlYXMgc2VndWlyIHVzYW5kbyB0b2RhcyBsYXMgZnVuY2lvbmFsaWRhZGVzIGRlbCBzaXN0ZW1hLCBpbmdyZXNhIGNvbiB0dSB1c3VhcmlvIG8gY29ycmVvIHkgc2VsZWNjaW9uYSBlbCBtZW7DuiBFc3RhYmxlY2ltaWVudG9zID4gQWRtaW5pc3RyYWNpw7NuID4gRWRpdGFyIGVzdGFibGVjaW1pZW50byA+ICMgTWVzYXMnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckV4cGlyZVNvb25Nc2dWYXInLCB0cmFkdWN0aW9uOiAnUmVjdWVyZGEgcXVlIHR1IHNlcnZpY2lvIG1lbnN1YWwgZGUgY29tZXlnYW5hIHBhcmE6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyRXhwaXJlU29vbk1zZ1ZhcjInLCB0cmFkdWN0aW9uOiAnRXhwaXJhIGVsOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckV4cGlyZVNvb25Nc2dWYXIzJywgdHJhZHVjdGlvbjogJ1NpIGRlc2VhcyBzZWd1aXIgdXNhbmRvIHRvZGFzIGxhcyBmdW5jaW9uYWxpZGFkZXMgZGVsIHNpc3RlbWEsIGluZ3Jlc2EgY29uIHR1IHVzdWFyaW8gbyBjb3JyZW8geSBzZWxlY2Npb25hIGVsIG1lbsO6IFBhZ29zID4gUGFnbyBtZW5zdWFsJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnZXhwaXJlU29vbkVtYWlsU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdUdSBzZXJ2aWNpbyBjb21leWdhbmEgZXhwaXJhcsOhIHByb250bycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyUmVzdEV4cGlyZWRWYXInLCB0cmFkdWN0aW9uOiAnVHUgc2VydmljaW8gbWVuc3VhbCBkZSBjb21leWdhbmEgcGFyYTogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJSZXN0RXhwaXJlZFZhcjInLCB0cmFkdWN0aW9uOiAnaGEgZXhwaXJhZG8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlclJlc3RFeHBpcmVkVmFyMycsIHRyYWR1Y3Rpb246ICdTaSBkZXNlYXMgc2VndWlyIHVzYW5kbyB0b2RhcyBsYXMgZnVuY2lvbmFsaWRhZGVzIGRlbCBzaXN0ZW1hLCBpbmdyZXNhIGNvbiB0dSB1c3VhcmlvIG8gY29ycmVvIHkgc2VsZWNjaW9uYSBsYSBvcGNpw7NuIFBhZ29zID4gUmVhY3RpdmFyICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3Jlc3RFeHBpcmVkRW1haWxTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1R1IHNlcnZpY2lvIGRlIGNvbWV5Z2FuYSBoYSBleHBpcmFkbycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3Jlc2V0UGFzc3dvcmRTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ0NhbWJpbyBkZSBjb250cmFzZcOxYSBlbicgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICAgICAgZW1haWxDb250ZW50cy5mb3JFYWNoKChlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCkgPT4gRW1haWxDb250ZW50cy5pbnNlcnQoZW1haWxDb250ZW50KSk7XG4gICAgfVxufSIsImltcG9ydCB7IEhvdXIgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL2hvdXIubW9kZWwnO1xuaW1wb3J0IHsgSG91cnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvaG91cnMuY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkSG91cnMoKSB7XG5cbiAgICBpZihIb3Vycy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDAgKXtcbiAgICAgICAgY29uc3QgaG91cnM6IEhvdXJbXSA9IFtcbiAgICAgICAgICAgIHsgaG91cjonMDA6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzAwOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMTowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDE6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzAyOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMjozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDM6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzAzOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwNDowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDQ6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA1OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwNTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDY6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA2OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwNzowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDc6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA4OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwODozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDk6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA5OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxMDowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTA6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzExOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxMTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTI6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzEyOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxMzowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTM6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE0OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNDozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTU6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE1OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNjowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTY6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE3OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNzozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTg6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE4OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxOTowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTk6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzIwOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMDozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjE6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzIxOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMjowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjI6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzIzOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMzozMCcgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGhvdXJzLmZvckVhY2goKGhvdXI6SG91cikgPT4gSG91cnMuaW5zZXJ0KGhvdXIpKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgTGFuZ3VhZ2VzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2xhbmd1YWdlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTGFuZ3VhZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL2xhbmd1YWdlLm1vZGVsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRMYW5ndWFnZXMoKXtcbiAgICBpZihMYW5ndWFnZXMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwKXtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2VzOiBMYW5ndWFnZVtdID0gW3tcbiAgICAgICAgICAgIF9pZDogXCIxMDAwXCIsXG4gICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBsYW5ndWFnZV9jb2RlOiAnZXMnLFxuICAgICAgICAgICAgbmFtZTogJ0VzcGHDsW9sJyxcbiAgICAgICAgICAgIGltYWdlOiBudWxsXG4gICAgICAgIH0se1xuICAgICAgICAgICAgX2lkOiBcIjIwMDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdlbicsXG4gICAgICAgICAgICBuYW1lOiAnRW5nbGlzaCcsXG4gICAgICAgICAgICBpbWFnZTogbnVsbFxuICAgICAgICB9LHtcbiAgICAgICAgICAgIF9pZDogXCIzMDAwXCIsXG4gICAgICAgICAgICBpc19hY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbGFuZ3VhZ2VfY29kZTogJ2ZyJyxcbiAgICAgICAgICAgIG5hbWU6ICdGcmFuw6dhaXMnLFxuICAgICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICAgICAgfSx7XG4gICAgICAgICAgICBfaWQ6IFwiNDAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdwdCcsXG4gICAgICAgICAgICBuYW1lOiAnUG9ydHVndWVzZScsXG4gICAgICAgICAgICBpbWFnZTogbnVsbFxuICAgICAgICB9LHtcbiAgICAgICAgICAgIF9pZDogXCI1MDAwXCIsXG4gICAgICAgICAgICBpc19hY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbGFuZ3VhZ2VfY29kZTogJ2l0JyxcbiAgICAgICAgICAgIG5hbWU6ICdJdGFsaWFubycsXG4gICAgICAgICAgICBpbWFnZTogbnVsbFxuICAgIH0vKix7XG4gICAgICAgICAgICBfaWQ6IFwiNjAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbGFuZ3VhZ2VfY29kZTogJ2FsJyxcbiAgICAgICAgICAgIG5hbWU6ICdEZXV0c2NoJyxcbiAgICAgICAgICAgIGltYWdlOiBudWxsXG4gICAgICAgIH0qL1xuICAgICAgICBdO1xuXG4gICAgICAgIGxhbmd1YWdlcy5mb3JFYWNoKChsYW5ndWFnZSA6IExhbmd1YWdlKSA9PiBMYW5ndWFnZXMuaW5zZXJ0KGxhbmd1YWdlKSk7XG4gICAgfVxufSIsImltcG9ydCB7IFBhcmFtZXRlciB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2dlbmVyYWwvcGFyYW1ldGVyLm1vZGVsJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFBhcmFtZXRlcnMoKSB7XG4gICAgaWYgKFBhcmFtZXRlcnMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnM6IFBhcmFtZXRlcltdID0gW1xuICAgICAgICAgICAgeyBfaWQ6ICcxMDAnLCBuYW1lOiAnc3RhcnRfcGF5bWVudF9kYXknLCB2YWx1ZTogJzEnLCBkZXNjcmlwdGlvbjogJ2luaXRpYWwgZGF5IG9mIG1vbnRoIHRvIHZhbGlkYXRlIGNsaWVudCBwYXltZW50JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMDAnLCBuYW1lOiAnZW5kX3BheW1lbnRfZGF5JywgdmFsdWU6ICc1JywgZGVzY3JpcHRpb246ICdmaW5hbCBkYXkgb2YgbW9udGggdG8gdmFsaWRhdGUgY2xpZW50IHBheW1lbnQnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMwMCcsIG5hbWU6ICdmcm9tX2VtYWlsJywgdmFsdWU6ICdjb21leWdhbmEgPG5vLXJlcGx5QGNvbWV5Z2FuYS5jb20+JywgZGVzY3JpcHRpb246ICdkZWZhdWx0IGZyb20gYWNjb3VudCBlbWFpbCB0byBzZW5kIG1lc3NhZ2VzJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0MDAnLCBuYW1lOiAnZmlyc3RfcGF5X2Rpc2NvdW50JywgdmFsdWU6ICc1MCcsIGRlc2NyaXB0aW9uOiAnZGlzY291bnQgaW4gcGVyY2VudCB0byBzZXJ2aWNlIGZpcnN0IHBheScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTAwJywgbmFtZTogJ2NvbG9tYmlhX3RheF9pdmEnLCB2YWx1ZTogJzE5JywgZGVzY3JpcHRpb246ICdDb2xvbWJpYSB0YXggaXZhIHRvIG1vbnRobHkgY29tZXlnYW5hIHBheW1lbnQnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzYwMCcsIG5hbWU6ICdwYXl1X3NjcmlwdF90YWcnLCB2YWx1ZTogJ2h0dHBzOi8vbWFmLnBhZ29zb25saW5lLm5ldC93cy9mcC90YWdzLmpzP2lkPScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBzZWN1cml0eSBzY3JpcHQgZm9yIHBheXUgZm9ybSBpbiA8c2NyaXB0PiB0YWcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzcwMCcsIG5hbWU6ICdwYXl1X25vc2NyaXB0X3RhZycsIHZhbHVlOiAnaHR0cHM6Ly9tYWYucGFnb3NvbmxpbmUubmV0L3dzL2ZwL3RhZ3MuanM/aWQ9JywgZGVzY3JpcHRpb246ICd1cmwgZm9yIHNlY3VyaXR5IHNjcmlwdCBmb3IgcGF5dSBmb3JtIGluIDxub3NjcmlwdD4gdGFnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc4MDAnLCBuYW1lOiAncGF5dV9zY3JpcHRfY29kZScsIHZhbHVlOiAnODAyMDAnLCBkZXNjcmlwdGlvbjogJ3VybCBlbmRlZCBjb2RlIGZvciBzZWN1cml0eSB0YWcgZm9yIHBheXUgZm9ybSBpbiA8c2NyaXB0PiBhbmQgPG5vc2NyaXB0PiB0YWcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzkwMCcsIG5hbWU6ICdwYXl1X3NjcmlwdF9vYmplY3RfdGFnJywgdmFsdWU6ICdodHRwczovL21hZi5wYWdvc29ubGluZS5uZXQvd3MvZnAvZnAuc3dmP2lkPScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBzZWN1cml0eSBzY3JpcHQgZm9yIHBheXUgZm9ybSBpbiA8b2JqZWN0PiB0YWcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEwMDAnLCBuYW1lOiAncGF5dV9wYXltZW50c191cmxfdGVzdCcsIHZhbHVlOiAnaHR0cHM6Ly9zYW5kYm94LmFwaS5wYXl1bGF0YW0uY29tL3BheW1lbnRzLWFwaS80LjAvc2VydmljZS5jZ2knLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgY29ubmVjdCB0ZXN0IHBheXUgcGF5bWVudHMgQVBJJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMDAwJywgbmFtZTogJ3BheXVfcmVwb3J0c191cmxfdGVzdCcsIHZhbHVlOiAnaHR0cHM6Ly9zYW5kYm94LmFwaS5wYXl1bGF0YW0uY29tL3JlcG9ydHMtYXBpLzQuMC9zZXJ2aWNlLmNnaScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBjb25uZWN0IHRlc3QgcGF5dSByZXBvcnRzIEFQSScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwMCcsIG5hbWU6ICdpcF9wdWJsaWNfc2VydmljZV91cmwnLCB2YWx1ZTogJ2h0dHBzOi8vYXBpLmlwaWZ5Lm9yZz9mb3JtYXQ9anNvbicsIGRlc2NyaXB0aW9uOiAndXJsIGZvciByZXRyaWV2ZSB0aGUgY2xpZW50IHB1YmxpYyBpcCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTEwMCcsIG5hbWU6ICdjb21wYW55X25hbWUnLCB2YWx1ZTogJ1JlYWxiaW5kIFMuQS5TJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBjb21wYW55IG5hbWUgZm9yIGludm9pY2UnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzExNTAnLCBuYW1lOiAnY29tcGFueV9waG9uZScsIHZhbHVlOiAnVGVsOiAoNTcgMSkgNjk1OTUzNycsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgcGhvbmUnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEyMDAnLCBuYW1lOiAnY29tcGFueV9hZGRyZXNzJywgdmFsdWU6ICdDcmEgNiAjIDU4LTQzIE9mIDIwMScsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgY29tcGFueSBhZGRyZXNzJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMzAwJywgbmFtZTogJ2NvbXBhbnlfY291bnRyeScsIHZhbHVlOiAnQ29sb21iaWEnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIGNvdW50cnkgbG9jYXRpb24nIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE0MDAnLCBuYW1lOiAnY29tcGFueV9jaXR5JywgdmFsdWU6ICdCb2dvdMOhJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBjaXR5IGxvY2F0aW9uJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNTAwJywgbmFtZTogJ2NvbXBhbnlfbml0JywgdmFsdWU6ICdOSVQ6IDkwMS4wMzYuNTg1LTAnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIE5JVCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUxMCcsIG5hbWU6ICdjb21wYW55X3JlZ2ltZScsIHZhbHVlOiAnUsOpZ2ltZW4gY29tw7puJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCByZWdpbWUgaW4gQ29sb21iaWEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE1MjAnLCBuYW1lOiAnY29tcGFueV9jb250cmlidXRpb24nLCB2YWx1ZTogJ05vIHNvbW9zIGdyYW5kZXMgY29udHJpYnV5ZW50ZXMnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIGNvbnRyaWJ1dGlvbiBpbiBDb2xvbWJpYScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUzMCcsIG5hbWU6ICdjb21wYW55X3JldGFpbmVyJywgdmFsdWU6ICdObyBzb21vcyBhdXRvcmV0ZW5lZG9yZXMgcG9yIHZlbnRhcyBuaSBzZXJ2aWNpb3MnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIHJldGVudGlvbiBpbiBDb2xvbWJpYScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTU0MCcsIG5hbWU6ICdjb21wYW55X2FnZW50X3JldGFpbmVyJywgdmFsdWU6ICdObyBzb21vcyBhZ2VudGVzIHJldGVuZWRvcmVzIGRlIElWQSBlIElDQScsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgaXZhIGFuZCBpY2EgYWdlbnQgcmV0ZW50aW9uIGluIENvbG9tYmlhJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNTUwJywgbmFtZTogJ2ludm9pY2VfZ2VuZXJhdGVkX21zZycsIHZhbHVlOiAnRmFjdHVyYSBlbWl0aWRhIHBvciBjb21wdXRhZG9yJywgZGVzY3JpcHRpb246ICdJbnZvaWNlIG1lc3NhZ2UgZm9yIGludm9pY2UnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE2MDAnLCBuYW1lOiAnaXVyZXN0X3VybCcsIHZhbHVlOiAnaHR0cHM6Ly93d3cuY29tZXlnYW5hLmNvbScsIGRlc2NyaXB0aW9uOiAnY29tZXlnYW5hIHVybCBwYWdlJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNjUwJywgbmFtZTogJ2l1cmVzdF91cmxfc2hvcnQnLCB2YWx1ZTogJ3d3dy5jb21leWdhbmEuY29tJywgZGVzY3JpcHRpb246ICdjb21leWdhbmEgdXJsIHBhZ2Ugc2hvcnQnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE3MDAnLCBuYW1lOiAnZmFjZWJvb2tfbGluaycsIHZhbHVlOiAnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tJywgZGVzY3JpcHRpb246ICdmYWNlYm9vayBsaW5rIGZvciBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE4MDAnLCBuYW1lOiAndHdpdHRlcl9saW5rJywgdmFsdWU6ICdodHRwczovL3d3dy50d2l0dGVyLmNvbScsIGRlc2NyaXB0aW9uOiAndHdpdHRlciBsaW5rIGZvciBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE5MDAnLCBuYW1lOiAnaW5zdGFncmFtX2xpbmsnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3Lmluc3RhZ3JhbS5jb20nLCBkZXNjcmlwdGlvbjogJ2luc3RhZ3JhbSBsaW5rIGZvciBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE2MTAnLCBuYW1lOiAnaXVyZXN0X2ltZ191cmwnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3LmNvbWV5Z2FuYS5jb20vaW1hZ2VzLycsIGRlc2NyaXB0aW9uOiAnY29tZXlnYW5hIGltYWdlcyB1cmwnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMxMDAnLCBuYW1lOiAnaXBfcHVibGljX3NlcnZpY2VfdXJsMicsIHZhbHVlOiAnaHR0cHM6Ly9pcGluZm8uaW8vanNvbicsIGRlc2NyaXB0aW9uOiAndXJsIGZvciByZXRyaWV2ZSB0aGUgY2xpZW50IHB1YmxpYyBpcCAjMicgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzIwMCcsIG5hbWU6ICdpcF9wdWJsaWNfc2VydmljZV91cmwzJywgdmFsdWU6ICdodHRwczovL2lmY29uZmlnLmNvL2pzb24nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgcmV0cmlldmUgdGhlIGNsaWVudCBwdWJsaWMgaXAgIzMnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzkwMDAnLCBuYW1lOiAncGF5dV9pc19wcm9kJywgdmFsdWU6ICdmYWxzZScsIGRlc2NyaXB0aW9uOiAnRmxhZyB0byBlbmFibGUgdG8gcHJvZCBwYXl1IHBheW1lbnQnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzkxMDAnLCBuYW1lOiAncGF5dV90ZXN0X3N0YXRlJywgdmFsdWU6ICdBUFBST1ZFRCcsIGRlc2NyaXB0aW9uOiAnVGVzdCBzdGF0ZSBmb3IgcGF5dSBwYXltZW50IHRyYW5zYWN0aW9uJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc5MjAwJywgbmFtZTogJ3BheXVfcmVmZXJlbmNlX2NvZGUnLCB2YWx1ZTogJ0NZR19QXycsIGRlc2NyaXB0aW9uOiAnUHJlZml4IGZvciByZWZlcmVuY2UgY29kZSBvbiBwYXl1IHRyYW5zYWN0aW9ucycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjEwMCcsIG5hbWU6ICdtYXhfdXNlcl9wZW5hbHRpZXMnLCB2YWx1ZTogJzMnLCBkZXNjcmlwdGlvbjogJ01heCBudW1iZXIgb2YgdXNlciBwZW5hbHRpZXMnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIyMDAnLCBuYW1lOiAncGVuYWx0eV9kYXlzJywgdmFsdWU6ICczMCcsIGRlc2NyaXB0aW9uOiAnVXNlciBwZW5hbHR5IGRheXMnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzgwMDAnLCBuYW1lOiAnZGF0ZV90ZXN0X21vbnRobHlfcGF5JywgdmFsdWU6ICdNYXJjaCA1LCAyMDE4JywgZGVzY3JpcHRpb246ICdEYXRlIHRlc3QgZm9yIG1vbnRobHkgcGF5bWVudCBvZiBjb21leWdhbmEgc2VydmljZScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTAwMDAnLCBuYW1lOiAncGF5dV9wYXltZW50c191cmxfcHJvZCcsIHZhbHVlOiAnaHR0cHM6Ly9hcGkucGF5dWxhdGFtLmNvbS9wYXltZW50cy1hcGkvNC4wL3NlcnZpY2UuY2dpJywgZGVzY3JpcHRpb246ICd1cmwgZm9yIGNvbm5lY3QgcHJvZCBwYXl1IHBheW1lbnRzIEFQSScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjAwMDAnLCBuYW1lOiAncGF5dV9yZXBvcnRzX3VybF9wcm9kJywgdmFsdWU6ICdodHRwczovL2FwaS5wYXl1bGF0YW0uY29tL3JlcG9ydHMtYXBpLzQuMC9zZXJ2aWNlLmNnaScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBjb25uZWN0IHByb2QgcGF5dSByZXBvcnRzIEFQSScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnODUwMCcsIG5hbWU6ICdkYXRlX3Rlc3RfcmVhY3RpdmF0ZScsIHZhbHVlOiAnSmFudWFyeSA2LCAyMDE4JywgZGVzY3JpcHRpb246ICdEYXRlIHRlc3QgZm9yIHJlYWN0aXZhdGUgcmVzdGF1cmFudCBmb3IgcGF5JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMDAwMCcsIG5hbWU6ICd0ZXJtc191cmwnLCB2YWx1ZTogJ2h0dHA6Ly93d3cudHN0aTR0LTE5MzU5NDMwOTUuY29tL3NpZ25pbi8nLCBkZXNjcmlwdGlvbjogJ3VybCB0byBzZWUgdGVybXMgYW5kIGNvbmRpdGlvbnMnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwMDAwJywgbmFtZTogJ3BvbGljeV91cmwnLCB2YWx1ZTogJ2h0dHA6Ly93d3cudHN0aTR0LTE5MzU5NDMwOTUuY29tL3NpZ251cC8nLCBkZXNjcmlwdGlvbjogJ3VybCB0byBzZWUgcHJpdmFjeSBwb2xpY3knIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwMDAwJywgbmFtZTogJ1FSX2NvZGVfdXJsJywgdmFsdWU6ICdodHRwOi8vd3d3LnRzdGk0dC0xOTM1OTQzMDk1LmNvbS9xcj8nLCBkZXNjcmlwdGlvbjogJ1RoaXMgdXJsIHJlZGlyZWN0IHRvIHBhZ2UgdGhlIGNvbWV5Z2FuYS9kb3dubG9hZCB3aGVuIHNjYW5uZWQgUVIgY29kZSBmcm9tIG90aGVyIGFwcGxpY2F0aW9uJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMzAwJywgbmFtZTogJ3VzZXJfc3RhcnRfcG9pbnRzJywgdmFsdWU6ICcxJywgZGVzY3JpcHRpb246ICdVc2VyIHN0YXJ0IHBvaW50cycgfSxcbiAgICAgICAgXTtcbiAgICAgICAgcGFyYW1ldGVycy5mb3JFYWNoKChwYXJhbWV0ZXI6IFBhcmFtZXRlcikgPT4gUGFyYW1ldGVycy5pbnNlcnQocGFyYW1ldGVyKSk7XG4gICAgfVxufSIsImltcG9ydCB7IFBheW1lbnRNZXRob2QgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL3BheW1lbnRNZXRob2QubW9kZWwnO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQYXltZW50TWV0aG9kcygpe1xuICAgIGlmKCBQYXltZW50TWV0aG9kcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDAgKXtcbiAgICAgICAgY29uc3QgcGF5bWVudHM6IFBheW1lbnRNZXRob2RbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiBcIjEwXCIsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnUEFZTUVOVF9NRVRIT0RTLkNBU0gnIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMFwiLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ1BBWU1FTlRfTUVUSE9EUy5DUkVESVRfQ0FSRCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjMwXCIsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnUEFZTUVOVF9NRVRIT0RTLkRFQklUX0NBUkQnIH0sXG4gICAgICAgICAgICB7IF9pZDogXCI0MFwiLCBpc0FjdGl2ZTogZmFsc2UsIG5hbWU6ICdQQVlNRU5UX01FVEhPRFMuT05MSU5FJyB9LFxuICAgICAgICBdO1xuICAgICAgICBwYXltZW50cy5mb3JFYWNoKCAoIHBheTpQYXltZW50TWV0aG9kICkgPT4gUGF5bWVudE1ldGhvZHMuaW5zZXJ0KCBwYXkgKSApO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2dlbmVyYWwvcG9pbnQubW9kZWwnO1xuaW1wb3J0IHsgUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BvaW50LmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFBvaW50cygpIHtcbiAgICBpZihQb2ludHMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwICl7XG4gICAgICAgIGNvbnN0IHBvaW50czogUG9pbnRbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiBcIjFcIiwgcG9pbnQ6IDEgfSwgXG4gICAgICAgICAgICB7IF9pZDogXCIyXCIsIHBvaW50OiAyIH0sIFxuICAgICAgICAgICAgeyBfaWQ6IFwiM1wiLCBwb2ludDogMyB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiNFwiLCBwb2ludDogNCB9LCBcbiAgICAgICAgICAgIHsgX2lkOiBcIjVcIiwgcG9pbnQ6IDUgfSwgXG4gICAgICAgICAgICB7IF9pZDogXCI2XCIsIHBvaW50OiA2IH0sIFxuICAgICAgICAgICAgeyBfaWQ6IFwiN1wiLCBwb2ludDogNyB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiOFwiLCBwb2ludDogOCB9LCBcbiAgICAgICAgICAgIHsgX2lkOiBcIjlcIiwgcG9pbnQ6IDkgfSwgXG4gICAgICAgICAgICB7IF9pZDogXCIxMFwiLCBwb2ludDogMTAgfVxuICAgICAgICBdO1xuICAgICAgICBwb2ludHMuZm9yRWFjaCgocG9pbnQ6UG9pbnQpID0+IFBvaW50cy5pbnNlcnQocG9pbnQpKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgVHlwZU9mRm9vZCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2dlbmVyYWwvdHlwZS1vZi1mb29kLm1vZGVsJztcbmltcG9ydCB7IFR5cGVzT2ZGb29kIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRUeXBlc09mRm9vZCgpIHtcbiAgICBpZiAoVHlwZXNPZkZvb2QuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHR5cGVzOiBUeXBlT2ZGb29kW10gPSBbXG4gICAgICAgICAgICB7IF9pZDogXCIxMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkdFUk1BTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjIwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQU1FUklDQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkFSQUJJQ19GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjQwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQVJHRU5USU5FX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiNTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5BU0lBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjYwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQlJBWklMSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiNzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5IT01FTUFERV9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjgwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQ0hJTEVBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjkwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQ0hJTkVTRV9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjEwMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkNPTE9NQklBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjExMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkNPUkVBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjEyMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELk1JRERMRV9FQVNURVJOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMTMwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuU1BBTklTSF9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE0MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkZSRU5DSF9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE1MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkZVU0lPTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE2MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkdPVVJNRVRfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxNzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5HUkVFS19GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE4MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELklORElBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE5MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELklOVEVSTkFUSU9OQUxfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5JVEFMSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjEwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuSkFQQU5FU0VfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5MQVRJTl9BTUVSSUNBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjIzMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELk1FRElURVJSQU5FQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyNDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5NRVhJQ0FOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjUwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuT1JHQU5JQ19GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjI2MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlBFUlVWSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjcwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuRkFTVF9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjI4MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlRIQUlfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyOTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5WRUdFVEFSSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzAwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuVklFVE5BTUVTRV9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjMxMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELk9USEVSU1wiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5CQVJCRUNVRVwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5QQVNUQVwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzNDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5GSVNIX0FORF9TRUFGT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjM1MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlBJWlpBXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjM2MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlNBTkRXSUNIRVNcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzcwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuU1VTSElcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzgwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuVkVHQU5JU01cIiB9XG4gICAgICAgIF07XG4gICAgICAgIHR5cGVzLmZvckVhY2goKHR5cGU6IFR5cGVPZkZvb2QpID0+IHsgVHlwZXNPZkZvb2QuaW5zZXJ0KHR5cGUpIH0pO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDY1BheW1lbnRNZXRob2QgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kLm1vZGVsJztcbmltcG9ydCB7IENjUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvY2MtcGF5bWVudC1tZXRob2RzLmNvbGxlY3Rpb24nXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQ2NQYXltZW50TWV0aG9kcygpIHtcbiAgICBpZiAoQ2NQYXltZW50TWV0aG9kcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT0gMCkge1xuICAgICAgICBjb25zdCBjY1BheW1lbnRNZXRob2RzOiBDY1BheW1lbnRNZXRob2RbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAnLCBpc19hY3RpdmU6IHRydWUsIG5hbWU6ICdWaXNhJywgcGF5dV9jb2RlOiAnVklTQScsIGxvZ29fbmFtZTogJ3Zpc2EnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwJywgaXNfYWN0aXZlOiB0cnVlLCBuYW1lOiAnTWFzdGVyY2FyZCcsIHBheXVfY29kZTogJ01BU1RFUkNBUkQnLCBsb2dvX25hbWU6ICdtYXN0ZXJjYXJkJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMCcsIGlzX2FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0FtZXJpY2FuIEV4cHJlc3MnLCBwYXl1X2NvZGU6ICdBTUVYJywgbG9nb19uYW1lOiAnYW1leCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAnLCBpc19hY3RpdmU6IHRydWUsIG5hbWU6ICdEaW5lcnMgQ2x1YicsIHBheXVfY29kZTogJ0RJTkVSUycsIGxvZ29fbmFtZTogJ2RpbmVycycgfVxuICAgICAgICBdO1xuICAgICAgICBjY1BheW1lbnRNZXRob2RzLmZvckVhY2goKGNjUGF5bWVudE1ldGhvZDogQ2NQYXltZW50TWV0aG9kKSA9PiB7IENjUGF5bWVudE1ldGhvZHMuaW5zZXJ0KGNjUGF5bWVudE1ldGhvZCkgfSk7XG4gICAgfVxufSIsImltcG9ydCB7IEludm9pY2VJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvcGF5bWVudC9pbnZvaWNlLWluZm8ubW9kZWwnO1xuaW1wb3J0IHsgSW52b2ljZXNJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2ludm9pY2VzLWluZm8uY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkSW52b2ljZXNJbmZvKCkge1xuICAgIGlmIChJbnZvaWNlc0luZm8uZmluZCgpLmN1cnNvci5jb3VudCgpID09IDApIHtcbiAgICAgICAgY29uc3QgaW52b2ljZXNJbmZvOiBJbnZvaWNlSW5mb1tdID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogJzEwMCcsXG4gICAgICAgICAgICAgICAgY291bnRyeV9pZDogJzE5MDAnLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fb25lOiAnMzEwMDAwMDg5NTA5JyxcbiAgICAgICAgICAgICAgICBwcmVmaXhfb25lOiAnSTRUJyxcbiAgICAgICAgICAgICAgICBzdGFydF9kYXRlX29uZTogbmV3IERhdGUoJzIwMTctMDgtMzFUMDA6MDA6MDAuMDBaJyksXG4gICAgICAgICAgICAgICAgZW5kX2RhdGVfb25lOiBuZXcgRGF0ZSgnMjAxNy0xMC0zMVQwMDowMDowMC4wMFonKSxcbiAgICAgICAgICAgICAgICBzdGFydF92YWx1ZV9vbmU6IDQyMjAwMCxcbiAgICAgICAgICAgICAgICBlbmRfdmFsdWVfb25lOiAxMDAwMDAwLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIHByZWZpeF90d286IG51bGwsXG4gICAgICAgICAgICAgICAgc3RhcnRfZGF0ZV90d286IG51bGwsXG4gICAgICAgICAgICAgICAgZW5kX2RhdGVfdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJ0X3ZhbHVlX3R3bzogbnVsbCxcbiAgICAgICAgICAgICAgICBlbmRfdmFsdWVfdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIGVuYWJsZV90d286IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRfdmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3RhcnRfbmV3X3ZhbHVlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgaW52b2ljZXNJbmZvLmZvckVhY2goKGludm9pY2VJbmZvOiBJbnZvaWNlSW5mbykgPT4gSW52b2ljZXNJbmZvLmluc2VydChpbnZvaWNlSW5mbykpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBCYWdQbGFuLCBQcmljZVBvaW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL3BvaW50cy9iYWctcGxhbi5tb2RlbCc7XG5pbXBvcnQgeyBCYWdQbGFucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2JhZy1wbGFucy5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRCYWdQbGFucygpIHtcbiAgICBpZiAoQmFnUGxhbnMuZmluZCgpLmN1cnNvci5jb3VudCgpID09IDApIHtcbiAgICAgICAgY29uc3QgYmFnUGxhbnM6IEJhZ1BsYW5bXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcxMDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdmcmVlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JBR19QTEFOLkZSRUUnLFxuICAgICAgICAgICAgICAgIHByaWNlOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5X2lkOiBcIjE5MDBcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5OiAnQ09QJ1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHZhbHVlX3BvaW50czogMzUwLFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiAnMjAwJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc21hbGwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnQkFHX1BMQU4uU01BTEwnLFxuICAgICAgICAgICAgICAgIHByaWNlOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5X2lkOiBcIjE5MDBcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IDI4OTAwLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeTogJ0NPUCdcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICB2YWx1ZV9wb2ludHM6IDMwMCxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogJzMwMCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ21lZGl1bScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdCQUdfUExBTi5NRURJVU0nLFxuICAgICAgICAgICAgICAgIHByaWNlOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5X2lkOiBcIjE5MDBcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IDM0OTAwLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeTogJ0NPUCdcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICB2YWx1ZV9wb2ludHM6IDUwMCxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogJzQwMCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2xhcmdlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JBR19QTEFOLkxBUkdFJyxcbiAgICAgICAgICAgICAgICBwcmljZTogW3tcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeV9pZDogXCIxOTAwXCIsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiAzODkwMCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3k6ICdDT1AnXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgdmFsdWVfcG9pbnRzOiA3MDAsXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGJhZ1BsYW5zLmZvckVhY2goKGJhZ1BsYW46IEJhZ1BsYW4pID0+IEJhZ1BsYW5zLmluc2VydChiYWdQbGFuKSk7XG4gICAgfVxufSIsImltcG9ydCB7IE1lbnVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSG91cnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvaG91cnMuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDdXJyZW5jaWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTGFuZ3VhZ2VzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2xhbmd1YWdlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWxDb250ZW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9lbWFpbC1jb250ZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDY1BheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kcy5jb2xsZWN0aW9uJ1xuaW1wb3J0IHsgUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BvaW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVHlwZXNPZkZvb2QgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvdHlwZS1vZi1mb29kLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQmFnUGxhbnMgfSBmcm9tIFwiLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLmNvbGxlY3Rpb25cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUZpeHR1cmVzKCkge1xuICAgIC8qKlxuICAgICAqIFJlbW92ZSBNZW51cyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgTWVudXMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBSb2xlcyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgUm9sZXMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBIb3VycyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgSG91cnMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBDdXJyZW5jaWVzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBDdXJyZW5jaWVzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgUGF5bWVudE1ldGhvZHMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIFBheW1lbnRNZXRob2RzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgQ291bnRyaWVzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBDb3VudHJpZXMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBMYW5ndWFnZXMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIExhbmd1YWdlcy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIEVtYWlsQ29udGVudHMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIEVtYWlsQ29udGVudHMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBQYXJhbWV0ZXJzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBQYXJhbWV0ZXJzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgQ2NQYXltZW50TWV0aG9kcyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgQ2NQYXltZW50TWV0aG9kcy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIFBvaW50cyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgUG9pbnRzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgVHlwZXNPZkZvb2QgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIFR5cGVzT2ZGb29kLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgQmFnUGxhbnMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIEJhZ1BsYW5zLnJlbW92ZSh7fSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLm1vZGVsJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcblxuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnNEZXRhaWxzRm9yRXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudF93b3JrOiBzdHJpbmcpIHtcbiAgICBpZiAoX2VzdGFibGlzaG1lbnRfd29yaykge1xuICAgICAgICByZXR1cm4gVXNlckRldGFpbHMuZmluZCh7IGVzdGFibGlzaG1lbnRfd29yazogX2VzdGFibGlzaG1lbnRfd29yayB9KTtcbiAgICB9XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJzQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50X3dvcms6IHN0cmluZykge1xuICAgIGlmIChfZXN0YWJsaXNobWVudF93b3JrKSB7XG4gICAgICAgIGxldCBfbFVzZXJEZXRhaWxzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjaGVjayhfZXN0YWJsaXNobWVudF93b3JrLCBTdHJpbmcpO1xuXG4gICAgICAgIFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRfd29yazogX2VzdGFibGlzaG1lbnRfd29yayB9KS5mZXRjaCgpLmZvckVhY2goZnVuY3Rpb24gPFVzZXJEZXRhaWw+KHVzZGV0LCBpbmRleCwgYXJyKSB7XG4gICAgICAgICAgICBfbFVzZXJEZXRhaWxzLnB1c2godXNkZXQudXNlcl9pZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogeyAkaW46IF9sVXNlckRldGFpbHMgfSB9KTtcbiAgICB9XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTWVudXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvbWVudS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXIubW9kZWwnO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0TWVudXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIE1lbnVzLmZpbmQoe30sIHsgc29ydDogeyBvcmRlcjogMSB9IH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2F1dGgvdXNlci5tb2RlbCc7XG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0Um9sZUNvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSb2xlcy5maW5kKHt9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0Um9sZUNvbGxhYm9yYXRvcnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJvbGVzLmZpbmQoe19pZDogeyAkaW46IFsgXCI2MDBcIiBdIH19KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnNEZXRhaWxzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHt9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlckRldGFpbHNCeVVzZXInLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gVXNlckRldGFpbHMuZmluZCh7IHVzZXJfaWQ6IF91c2VySWQgfSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJEZXRhaWxzQnlDdXJyZW50VGFibGUnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nLCBfdGFibGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IF9lc3RhYmxpc2htZW50SWQsIGN1cnJlbnRfdGFibGU6IF90YWJsZUlkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB1c2VycyBieSBlc3RhYmxpc2htZW50cyBJZFxuICogQHBhcmFtIHtzdHJpbmdbXX0gX3BFc3RhYmxpc2htZW50c0lkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0J5RXN0YWJsaXNobWVudHNJZCcsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRzSWQ6IFN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IHsgJGluOiBfcEVzdGFibGlzaG1lbnRzSWQgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdXNlcnMgZGV0YWlscyBieSBhZG1pbiB1c2VyXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VyRGV0YWlsc0J5QWRtaW5Vc2VyJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgbGV0IF9sRXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFycikge1xuICAgICAgICBfbEVzdGFibGlzaG1lbnRzSWQucHVzaChlc3RhYmxpc2htZW50Ll9pZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IHsgJGluOiBfbEVzdGFibGlzaG1lbnRzSWQgfSB9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlckRldGFpbHNCeUVzdGFibGlzaG1lbnRXb3JrJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgbGV0IF9sVXNlckRldGFpbDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuICAgIGlmIChfbFVzZXJEZXRhaWwpIHtcbiAgICAgICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IF9sVXNlckRldGFpbC5lc3RhYmxpc2htZW50X3dvcmsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudCBjb2xsYWJvcmF0b3JzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0NvbGxhYm9yYXRvcnNCeUVzdGFibGlzaG1lbnRzSWQnLCBmdW5jdGlvbiAoX3BFc3RhYmxpc2htZW50c0lkOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHsgZXN0YWJsaXNobWVudF93b3JrOiB7ICRpbjogX3BFc3RhYmxpc2htZW50c0lkIH0gfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJTZXR0aW5ncycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogdGhpcy51c2VySWQgfSwgeyBmaWVsZHM6IHsgdXNlcm5hbWU6IDEsIFwic2VydmljZXMucHJvZmlsZS5uYW1lXCI6IDEsIFwic2VydmljZXMuZmFjZWJvb2tcIjogMSwgXCJzZXJ2aWNlcy50d2l0dGVyXCI6IDEsIFwic2VydmljZXMuZ29vZ2xlXCI6IDEgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaXNoLCBnZXQgYWxsIHVzZXJzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VycycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7fSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGlzaC4gR2V0IHVzZXIgYnkgSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJCeVVzZXJJZCcsIGZ1bmN0aW9uIChfdXNySWQ6IHN0cmluZykge1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiBfdXNySWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIHVzZXJzIHdpdGggZXN0YWJsaXNobWVudCBhbmQgdGFibGUgSWQgY29uZGl0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IF9wRXN0YWJsaXNobWVudElkXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BUYWJsZUlkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VyQnlUYWJsZUlkJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudElkOiBzdHJpbmcsIF9wVGFibGVJZCkge1xuICAgIGNoZWNrKF9wRXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIGNoZWNrKF9wVGFibGVJZCwgU3RyaW5nKTtcbiAgICBsZXQgX2xVc2Vyczogc3RyaW5nW10gPSBbXTtcbiAgICBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IF9wRXN0YWJsaXNobWVudElkLCBjdXJyZW50X3RhYmxlOiBfcFRhYmxlSWQgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxVc2VyRGV0YWlsPih1c2VyLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9sVXNlcnMucHVzaCh1c2VyLnVzZXJfaWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiB7ICRpbjogX2xVc2VycyB9IH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB1c2VycyBieSBhZG1pbiB1c2VyIElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0J5QWRtaW5Vc2VyJywgZnVuY3Rpb24gKF9wVXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfcFVzZXJJZCwgU3RyaW5nKTtcbiAgICBsZXQgX2xFc3RhYmxpc2htZW50c0lkOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBfbFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IGNyZWF0aW9uX3VzZXI6IF9wVXNlcklkIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFycikge1xuICAgICAgICBfbEVzdGFibGlzaG1lbnRzSWQucHVzaChlc3RhYmxpc2htZW50Ll9pZCk7XG4gICAgfSk7XG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kKHsgY3VycmVudF9lc3RhYmxpc2htZW50OiB7ICRpbjogX2xFc3RhYmxpc2htZW50c0lkIH0gfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxVc2VyRGV0YWlsPih1c2VyRGV0YWlsLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9sVXNlcnMucHVzaCh1c2VyRGV0YWlsLnVzZXJfaWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiB7ICRpbjogX2xVc2VycyB9IH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB1c2VycyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BFc3RhYmxpc2htZW50SWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiAoX3BFc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wRXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIGxldCBfbFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgIFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZCh7IGN1cnJlbnRfZXN0YWJsaXNobWVudDogX3BFc3RhYmxpc2htZW50SWQgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxVc2VyRGV0YWlsPih1c2VyLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9sVXNlcnMucHVzaCh1c2VyLnVzZXJfaWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiB7ICRpbjogX2xVc2VycyB9IH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UVJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGdldEVzdGFibGlzaG1lbnRRUnNCeUFkbWluIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50UVJzQnlBZG1pbicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50UVJzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cywgRXN0YWJsaXNobWVudHNQcm9maWxlIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFBheW1lbnRIaXN0b3J5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkubW9kZWwnO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50cyB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZXN0YWJsaXNobWVudHMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb25zIGVzdGFibGlzaG1lbnRCeUVzdGFibGlzaG1lbnRXb3JrXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50QnlFc3RhYmxpc2htZW50V29yaycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHZhciB1c2VyX2RldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuICAgIGlmICh1c2VyX2RldGFpbCkge1xuICAgICAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IF9pZDogdXNlcl9kZXRhaWwuZXN0YWJsaXNobWVudF93b3JrIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gdG8gZmluZCBjdXJyZW50IGVzdGFibGlzaG1lbnRzIHdpdGggbm8gcGF5XG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnY3VycmVudEVzdGFibGlzaG1lbnRzTm9QYXllZCcsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuXG4gICAgbGV0IGN1cnJlbnREYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICBsZXQgY3VycmVudE1vbnRoOiBzdHJpbmcgPSAoY3VycmVudERhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCk7XG4gICAgbGV0IGN1cnJlbnRZZWFyOiBzdHJpbmcgPSBjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gICAgbGV0IGhpc3RvcnlQYXltZW50UmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBlc3RhYmxpc2htZW50c0luaXRpYWw6IHN0cmluZ1tdID0gW107XG5cbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkLCBpc0FjdGl2ZTogdHJ1ZSwgZnJlZURheXM6IGZhbHNlIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFycikge1xuICAgICAgICBlc3RhYmxpc2htZW50c0luaXRpYWwucHVzaChlc3RhYmxpc2htZW50Ll9pZCk7XG4gICAgfSk7XG5cbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5maW5kKHtcbiAgICAgICAgZXN0YWJsaXNobWVudElkczoge1xuICAgICAgICAgICAgJGluOiBlc3RhYmxpc2htZW50c0luaXRpYWxcbiAgICAgICAgfSwgbW9udGg6IGN1cnJlbnRNb250aCwgeWVhcjogY3VycmVudFllYXIsICRvcjogW3sgc3RhdHVzOiAnVFJBTlNBQ1RJT05fU1RBVFVTLkFQUFJPVkVEJyB9LCB7IHN0YXR1czogJ1RSQU5TQUNUSU9OX1NUQVRVUy5QRU5ESU5HJyB9XVxuICAgIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8UGF5bWVudEhpc3Rvcnk+KGhpc3RvcnlQYXltZW50LCBpbmRleCwgYXJyKSB7XG4gICAgICAgIGhpc3RvcnlQYXltZW50LmVzdGFibGlzaG1lbnRfaWRzLmZvckVhY2goKGVzdGFibGlzaG1lbnQpID0+IHtcbiAgICAgICAgICAgIGhpc3RvcnlQYXltZW50UmVzLnB1c2goZXN0YWJsaXNobWVudCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzLmZpbmQoeyBfaWQ6IHsgJG5pbjogaGlzdG9yeVBheW1lbnRSZXMgfSwgY3JlYXRpb25fdXNlcjogX3VzZXJJZCwgaXNBY3RpdmU6IHRydWUsIGZyZWVEYXlzOiBmYWxzZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB0byBmaW5kIGluYWN0aXZlIGVzdGFibGlzaG1lbnRzIGJ5IHVzZXJcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEluYWN0aXZlRXN0YWJsaXNobWVudHMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQsIGlzQWN0aXZlOiBmYWxzZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gYWN0aXZlIGVzdGFibGlzaG1lbnRzIGJ5IHVzZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBY3RpdmVFc3RhYmxpc2htZW50cycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCwgaXNBY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGVzdGFibGlzaG1lbnRzIGJ5IGlkXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudEJ5SWQnLCBmdW5jdGlvbiAoX3BJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3BJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IF9pZDogX3BJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudCBwcm9maWxlIGJ5IGVzdGFibGlzaG1lbnQgaWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRQcm9maWxlJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzUHJvZmlsZS5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudHMgYnkgaWRzXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBfcElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50c0J5SWRzJywgZnVuY3Rpb24gKF9wSWRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHsgX2lkOiB7ICRpbjogX3BJZHMgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHt9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgUmV3YXJkUG9pbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5tb2RlbCc7XG5pbXBvcnQgeyBSZXdhcmRQb2ludHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLXBvaW50LmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdXNlciByZXdhcmQgcG9pbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJfaWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFJld2FyZFBvaW50c0J5VXNlcklkJywgZnVuY3Rpb24gKF91c2VyX2lkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcl9pZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gUmV3YXJkUG9pbnRzLmZpbmQoeyBpZF91c2VyOiBfdXNlcl9pZCB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUmV3YXJkcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJld2FyZHMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkcycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBSZXdhcmRzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiByZXdhcmRzIGJ5IGVzdGFibGlzaG1lbnQgSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRSZXdhcmRzJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFJld2FyZHMuZmluZCh7IGVzdGFibGlzaG1lbnRzOiB7ICRpbjogW19lc3RhYmxpc2htZW50SWRdIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbnMgZ2V0UmV3YXJkc0J5RXN0YWJsaXNobWVudFdvcmtcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFJld2FyZHNCeUVzdGFibGlzaG1lbnRXb3JrJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgdmFyIHVzZXJfZGV0YWlsID0gVXNlckRldGFpbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQgfSk7XG4gICAgaWYgKHVzZXJfZGV0YWlsKSB7XG4gICAgICAgIHJldHVybiBSZXdhcmRzLmZpbmQoeyBlc3RhYmxpc2htZW50czogeyAkaW46IFt1c2VyX2RldGFpbC5lc3RhYmxpc2htZW50X3dvcmtdIH0gfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB0byByZXR1cm4gdGhlIHJld2FyZHMgXG4gKi9cbk1ldGVvcltcInB1Ymxpc2hDb21wb3NpdGVcIl0oJ2dldFJld2FyZHNUb0l0ZW1zJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG5cbiAgICBpZiAoX2VzdGFibGlzaG1lbnRJZCAhPT0gbnVsbCB8fCBfZXN0YWJsaXNobWVudElkICE9PSAnJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmluZCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSXRlbXMuZmluZCh7ICdlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkJzogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbe1xuICAgICAgICAgICAgICAgIGZpbmQoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmV3YXJkcy5maW5kKHsgaXRlbV9pZDogaXRlbS5faWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVGFibGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3RhYmxlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHRhYmxlcyB3aXRoIHVzZXIgY3JlYXRpb24gY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgndGFibGVzJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFRhYmxlcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gYWxsIHRhYmxlc1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0QWxsVGFibGVzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBUYWJsZXMuZmluZCh7fSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIHRhYmxlcyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VGFibGVzQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFRhYmxlcy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnRJZCwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB0YWJsZXMgYnkgZXN0YWJsaXNobWVudCBXb3JrXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VGFibGVzQnlFc3RhYmxpc2htZW50V29yaycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcbiAgICBpZiAoX2xVc2VyRGV0YWlsKSB7XG4gICAgICAgIHJldHVybiBUYWJsZXMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IF9sVXNlckRldGFpbC5lc3RhYmxpc2htZW50X3dvcmssIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgfVxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFdhaXRlckNhbGxEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3dhaXRlci1jYWxsLWRldGFpbC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gd2FpdGVyIGNhbGwgZGV0YWlscy4gdXNlcklkXG4gKiBAcGFyYW0geyBzdHJpbmcgfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdjb3VudFdhaXRlckNhbGxEZXRhaWxCeVVzcklkJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICByZXR1cm4gV2FpdGVyQ2FsbERldGFpbHMuZmluZCh7IHVzZXJfaWQ6IF91c2VySWQsIHN0YXR1czogeyAkaW46IFtcIndhaXRpbmdcIiwgXCJjb21wbGV0ZWRcIl0gfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB3YWl0ZXIgY2FsbCBkZXRhaWxzLCBmb3IgdG8gcGF5bWVudC5cbiAqIEBwYXJhbSB7IHN0cmluZyB9IF9lc3RhYmxpc2htZW50SWRcbiAqIEBwYXJhbSB7IHN0cmluZyB9IF90YWJsZUlkXG4gKiBAcGFyYW0geyBzdHJpbmcgfSBfdHlwZVxuICogQHBhcmFtIHsgc3RyaW5nW10gfSBfc3RhdHVzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdXYWl0ZXJDYWxsRGV0YWlsRm9yUGF5bWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcsXG4gIF90YWJsZUlkOiBzdHJpbmcsXG4gIF90eXBlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFdhaXRlckNhbGxEZXRhaWxzLmZpbmQoe1xuICAgIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50SWQsXG4gICAgdGFibGVfaWQ6IF90YWJsZUlkLFxuICAgIHR5cGU6IF90eXBlLFxuICAgIHN0YXR1czogeyAkaW46IFsnd2FpdGluZycsICdjb21wbGV0ZWQnXSB9XG4gIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHdhaXRlciBjYWxsIGRldGFpbHMuIHVzZXJJZCAoV2FpdGVyIGlkKVxuICogQHBhcmFtIHsgc3RyaW5nIH0gX3dhaXRlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCd3YWl0ZXJDYWxsRGV0YWlsQnlXYWl0ZXJJZCcsIGZ1bmN0aW9uIChfd2FpdGVySWQ6IHN0cmluZykge1xuICByZXR1cm4gV2FpdGVyQ2FsbERldGFpbHMuZmluZCh7IHdhaXRlcl9pZDogX3dhaXRlcklkLCBzdGF0dXM6IFwiY29tcGxldGVkXCIgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBjb3VudHJpZXNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2NvdW50cmllcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gQ291bnRyaWVzLmZpbmQoeyBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBDb3VudHJ5IGJ5IGVzdGFibGlzaG1lbnRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldENvdW50cnlCeUVzdGFibGlzaG1lbnRJZCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIGxldCBlc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuZmluZE9uZSh7IF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbiAgICBpZiAoZXN0YWJsaXNobWVudCkge1xuICAgICAgICByZXR1cm4gQ291bnRyaWVzLmZpbmQoeyBfaWQ6IGVzdGFibGlzaG1lbnQuY291bnRyeUlkIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBDb3VudHJpZXMuZmluZCh7IGlzX2FjdGl2ZTogdHJ1ZSB9KTs7XG4gICAgfVxufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBjb3VudHJpZXMgYnkgZXN0YWJsaXNobWVudHMgSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldENvdW50cmllc0J5RXN0YWJsaXNobWVudHNJZCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10pIHtcbiAgICBsZXQgX2lkczogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBfaWQ6IHsgJGluOiBfZXN0YWJsaXNobWVudHNJZCB9IH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcikge1xuICAgICAgICBfaWRzLnB1c2goZXN0YWJsaXNobWVudC5jb3VudHJ5SWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBDb3VudHJpZXMuZmluZCh7IF9pZDogeyAkaW46IF9pZHMgfSB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDdXJyZW5jaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGN1cnJlbmNpZXNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2N1cnJlbmNpZXMnLCAoKSA9PiBDdXJyZW5jaWVzLmZpbmQoeyBpc0FjdGl2ZTogdHJ1ZSB9KSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBjdXJyZW5jaWVzIGJ5IGVzdGFibGlzaG1lbnRzIElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRDdXJyZW5jaWVzQnlFc3RhYmxpc2htZW50c0lkJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50c0lkOiBzdHJpbmdbXSkge1xuICAgIGxldCBfaWRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IF9pZDogeyAkaW46IF9lc3RhYmxpc2htZW50c0lkIH0gfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgIF9pZHMucHVzaChlc3RhYmxpc2htZW50LmN1cnJlbmN5SWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBDdXJyZW5jaWVzLmZpbmQoeyBfaWQ6IHsgJGluOiBfaWRzIH0gfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGN1cnJlbmNpZXMgYnkgIHVzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0Q3VycmVuY2llc0J5VXNlcklkJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGxldCBfY3VycmVuY2llc0lkczogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcmdzKSB7XG4gICAgICAgIF9jdXJyZW5jaWVzSWRzLnB1c2goZXN0YWJsaXNobWVudC5jdXJyZW5jeUlkKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBDdXJyZW5jaWVzLmZpbmQoeyBfaWQ6IHsgJGluOiBfY3VycmVuY2llc0lkcyB9IH0pO1xufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gRW1haWxDb250ZW50c1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RW1haWxDb250ZW50cycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gRW1haWxDb250ZW50cy5maW5kKHt9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgSG91cnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvaG91cnMuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGhvdXJzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdob3VycycsICgpID0+IEhvdXJzLmZpbmQoKSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBMYW5ndWFnZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvbGFuZ3VhZ2UuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGxhbmd1YWdlc1xuICovXG5NZXRlb3IucHVibGlzaCggJ2xhbmd1YWdlcycsICgpID0+IExhbmd1YWdlcy5maW5kKCB7IGlzX2FjdGl2ZTogdHJ1ZSB9ICkgKTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRQYXJhbWV0ZXJzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBQYXJhbWV0ZXJzLmZpbmQoe30pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBQYXltZW50TWV0aG9kcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHBheW1lbnRNZXRob2RzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCAncGF5bWVudE1ldGhvZHMnLCAoKSA9PiBQYXltZW50TWV0aG9kcy5maW5kKCB7IGlzQWN0aXZlOiB0cnVlIH0gKSApO1xuXG4vKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBlc3RhYmxpc2htZW50IHBheW1lbnQgbWV0aG9kc1xuICovXG5NZXRlb3IucHVibGlzaCggJ2dldFBheW1lbnRNZXRob2RzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiggX3BFc3RhYmxpc2htZW50SWQ6c3RyaW5nICl7XG4gICAgY2hlY2soIF9wRXN0YWJsaXNobWVudElkLCBTdHJpbmcgKTtcbiAgICBsZXQgX2xFc3RhYmxpc2htZW50OiBFc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuZmluZE9uZSggeyBfaWQ6IF9wRXN0YWJsaXNobWVudElkIH0gKTtcbiAgICBpZiggX2xFc3RhYmxpc2htZW50ICl7XG4gICAgICAgIHJldHVybiBQYXltZW50TWV0aG9kcy5maW5kKCB7IF9pZDogeyAkaW46IF9sRXN0YWJsaXNobWVudC5wYXltZW50TWV0aG9kcyB9ICwgaXNBY3RpdmU6IHRydWUgfSApOyAgICAgICAgXG4gICAgfSBlbHNle1xuICAgICAgICByZXR1cm4gUGF5bWVudE1ldGhvZHMuZmluZCggeyBpc0FjdGl2ZTogdHJ1ZSB9ICk7XG4gICAgfVxufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQb2ludHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcG9pbnQuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHBvaW50c1xuICovXG5NZXRlb3IucHVibGlzaCgncG9pbnRzJywgKCkgPT4gUG9pbnRzLmZpbmQoKSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBUeXBlc09mRm9vZCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC90eXBlLW9mLWZvb2QuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHR5cGVzT2ZGb29kXG4gKi9cbk1ldGVvci5wdWJsaXNoKCd0eXBlc09mRm9vZCcsICgpID0+IFR5cGVzT2ZGb29kLmZpbmQoKSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBBZGRpdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvYWRkaXRpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGFkZGl0aW9ucyB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnYWRkaXRpb25zJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEFkZGl0aW9ucy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gYWRkaXRpb25zIHdpdGggZXN0YWJsaXNobWVudCBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfZXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdhZGRpdGlvbnNCeUVzdGFibGlzaG1lbnQnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX2VzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gQWRkaXRpb25zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBhZGR0aW9ucyBieSBpdGVtSWQgIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF9pdGVtSWRcbiovXG5NZXRlb3IucHVibGlzaCgnYWRkaXRpb25zQnlJdGVtJywgZnVuY3Rpb24gKF9pdGVtSWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9pdGVtSWQsIFN0cmluZyk7IFxuICAgIHZhciBpdGVtID0gSXRlbXMuZmluZE9uZSh7IF9pZDogX2l0ZW1JZCwgYWRkaXRpb25zSXNBY2NlcHRlZDogdHJ1ZSB9KTtcblxuICAgIGlmKHR5cGVvZiBpdGVtICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgYXV4ID0gQWRkaXRpb25zLmZpbmQoeyBfaWQ6IHsgJGluOiBpdGVtLmFkZGl0aW9ucyB9IH0pLmZldGNoKCk7XG4gICAgICAgIHJldHVybiBBZGRpdGlvbnMuZmluZCh7IF9pZDogeyAkaW46IGl0ZW0uYWRkaXRpb25zIH0gfSk7XG4gICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBBZGRpdGlvbnMuZmluZCh7IF9pZDogeyAkaW46IFtdIH0gfSk7XG4gICAgfVxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENhdGVnb3JpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvY2F0ZWdvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFNlY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3NlY3Rpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGNhdGVnb3JpZXMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2NhdGVnb3JpZXMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gQ2F0ZWdvcmllcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gY2F0ZWdvcmllcyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnY2F0ZWdvcmllc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBsZXQgX3NlY3Rpb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG5cbiAgICBTZWN0aW9ucy5jb2xsZWN0aW9uLmZpbmQoeyBlc3RhYmxpc2htZW50czogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxTdHJpbmc+KHMsIGluZGV4LCBhcnIpIHtcbiAgICAgICAgX3NlY3Rpb25zLnB1c2gocy5faWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBDYXRlZ29yaWVzLmZpbmQoeyBzZWN0aW9uOiB7ICRpbjogX3NlY3Rpb25zIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGl0ZW1zIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdpdGVtcycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBJdGVtcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBhZG1pbiBhY3RpdmUgaXRlbXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBZG1pbkFjdGl2ZUl0ZW1zJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkLCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGl0ZW1zIHdpdGggZXN0YWJsaXNobWVudCBjb25kaXRpb25cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2l0ZW1zQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBlc3RhYmxpc2htZW50cyBpdGVtc1xuICogQHBhcmFtIHtzdHJpbmdbXX0gX3BFc3RhYmxpc2htZW50SWRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRJdGVtc0J5RXN0YWJsaXNobWVudElkcycsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRJZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBfcEVzdGFibGlzaG1lbnRJZHMgfSB9KTtcbn0pO1xuXG5cbi8qKlxuICogTWVldG9yIHB1YmxpY2F0aW9uIHJldHVybiBpdGVtcyBieSBlc3RhYmxpc2htZW50IHdvcmtcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRJdGVtc0J5VXNlckVzdGFibGlzaG1lbnRXb3JrJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgbGV0IF9sVXNlckRldGFpbDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuXG4gICAgaWYgKF9sVXNlckRldGFpbCkge1xuICAgICAgICBpZiAoX2xVc2VyRGV0YWlsLmVzdGFibGlzaG1lbnRfd29yaykge1xuICAgICAgICAgICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBbX2xVc2VyRGV0YWlsLmVzdGFibGlzaG1lbnRfd29ya10gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn0pO1xuXG5cbi8qKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gaXRlbXMgc29ydGVkIGJ5IGl0ZW0gbmFtZVxuICovXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gaXRlbXMgd2l0aCBlc3RhYmxpc2htZW50IGNvbmRpdGlvblxuICovXG5NZXRlb3IucHVibGlzaCgnaXRlbXNCeUVzdGFibGlzaG1lbnRTb3J0ZWRCeU5hbWUnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX2VzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gSXRlbXMuZmluZCh7ICdlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkJzogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSwgeyBzb3J0OiB7IG5hbWU6IDEgfSB9KTtcbn0pO1xuXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE9wdGlvblZhbHVlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9vcHRpb24tdmFsdWUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIG9wdGlvbiB2YWx1ZXMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEFkbWluT3B0aW9uVmFsdWVzJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIE9wdGlvblZhbHVlcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBvcHRpb24gdmFsdWVzIHdpdGggb3B0aW9uIGlkcyBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRPcHRpb25WYWx1ZXNCeU9wdGlvbklkcycsIGZ1bmN0aW9uIChfcE9wdGlvbklkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gT3B0aW9uVmFsdWVzLmZpbmQoeyBvcHRpb25faWQ6IHsgJGluOiBfcE9wdGlvbklkcyB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9vcHRpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gb3B0aW9uIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBZG1pbk9wdGlvbnMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gT3B0aW9ucy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50cyBvcHRpb25zIFxuICogQHBhcmFtIHtzdHJpbmd9IF9lc3RhYmxpc2htZW50SWRcbiovXG5NZXRlb3IucHVibGlzaCgnb3B0aW9uc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gT3B0aW9ucy5maW5kKHsgZXN0YWJsaXNobWVudHM6IHsgJGluOiBfZXN0YWJsaXNobWVudHNJZCB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFNlY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3NlY3Rpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gc2VjdGlvbiB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnc2VjdGlvbnMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gU2VjdGlvbnMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gZXN0YWJsaXNobWVudHMgc2VjdGlvbnMgXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuKi9cbk1ldGVvci5wdWJsaXNoKCdzZWN0aW9uc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIHJldHVybiBTZWN0aW9ucy5maW5kKHsgZXN0YWJsaXNobWVudHM6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbk1ldGVvci5wdWJsaXNoKCdnZXRTZWN0aW9ucycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gU2VjdGlvbnMuZmluZCh7fSk7XG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgU3ViY2F0ZWdvcmllcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9zdWJjYXRlZ29yeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFNlY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3NlY3Rpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDYXRlZ29yaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L2NhdGVnb3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHN1YmNhdGVnb3JpZXMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ3N1YmNhdGVnb3JpZXMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gU3ViY2F0ZWdvcmllcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gc3ViY2F0ZWdvcmllcyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnc3ViY2F0ZWdvcmllc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBsZXQgX3NlY3Rpb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBfY2F0ZWdvcmllczogc3RyaW5nW10gPSBbXTtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuXG4gICAgU2VjdGlvbnMuY29sbGVjdGlvbi5maW5kKHsgZXN0YWJsaXNobWVudHM6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8U3RyaW5nPihzLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9zZWN0aW9ucy5wdXNoKHMuX2lkKTtcbiAgICB9KTtcbiAgICBDYXRlZ29yaWVzLmNvbGxlY3Rpb24uZmluZCh7IHNlY3Rpb246IHsgJGluOiBfc2VjdGlvbnMgfSwgaXNfYWN0aXZlOiB0cnVlIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8U3RyaW5nPihjLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9jYXRlZ29yaWVzLnB1c2goYy5faWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBTdWJjYXRlZ29yaWVzLmZpbmQoeyBjYXRlZ29yeTogeyAkaW46IF9jYXRlZ29yaWVzIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENjUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvY2MtcGF5bWVudC1tZXRob2RzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRDY1BheW1lbnRNZXRob2RzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBDY1BheW1lbnRNZXRob2RzLmZpbmQoeyBpc19hY3RpdmU6IHRydWUgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEN5Z0ludm9pY2VzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2N5Zy1pbnZvaWNlcy5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gSW52b2ljZXNJbmZvXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBbGxDeWdJbnZvaWNlcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gQ3lnSW52b2ljZXMuZmluZCh7fSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldEN5Z0ludm9pY2VCeVVzZXInLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gQ3lnSW52b2ljZXMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEludm9pY2VzSW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBJbnZvaWNlc0luZm9cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEludm9pY2VzSW5mb0J5Q291bnRyeScsIGZ1bmN0aW9uIChjb3VudHJ5SWQ6IHN0cmluZykge1xuICAgIHJldHVybiBJbnZvaWNlc0luZm8uZmluZCh7IGNvdW50cnlfaWQ6IGNvdW50cnlJZCB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQYXltZW50c0hpc3RvcnkgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRIaXN0b3J5UGF5bWVudHNCeVVzZXInLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIFBheW1lbnRzSGlzdG9yeS5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZH0sIHsgc29ydDogeyBjcmVhdGlvbl9kYXRlOiAtMSB9IH0pO1xufSk7ICIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUGF5bWVudFRyYW5zYWN0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LXRyYW5zYWN0aW9uLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRUcmFuc2FjdGlvbnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFBheW1lbnRUcmFuc2FjdGlvbnMuZmluZCh7fSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFRyYW5zYWN0aW9uc0J5VXNlcicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gUGF5bWVudFRyYW5zYWN0aW9ucy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pOyIsImltcG9ydCB7IEJhZ1BsYW4gfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9wb2ludHMvYmFnLXBsYW4ubW9kZWwnO1xuaW1wb3J0IHsgQmFnUGxhbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9iYWctcGxhbnMuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGJhZyBwbGFuc1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEJhZ1BsYW5zJywgZnVuY3Rpb24gKCkge1xuICAgIGxldCBfbEJhZ3NQbGFucyA9IEJhZ1BsYW5zLmZpbmQoe30pO1xuICAgIHJldHVybiBfbEJhZ3NQbGFucztcbn0pO1xuXG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGJhZyBwbGFuc1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEJhZ1BsYW5zTm9GcmVlJywgZnVuY3Rpb24gKCkge1xuICAgIGxldCBfbEJhZ3NQbGFucyA9IEJhZ1BsYW5zLmZpbmQoeyBuYW1lOiB7ICRuaW46IFsnZnJlZSddIH0gfSk7XG4gICAgcmV0dXJuIF9sQmFnc1BsYW5zO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50TWVkYWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gZXN0YWJsaXNobWVudCBtZWRhbHMgYnkgdXNlciBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wVXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50TWVkYWxzQnlVc2VySWQnLCBmdW5jdGlvbiAoX3BVc2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wVXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50TWVkYWxzLmZpbmQoeyB1c2VyX2lkOiBfcFVzZXJJZCB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnRzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IHBvaW50cyBieSBpZHNcbiAqIEBwYXJhbSB7c3RyaW5nW119IF9wSWRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50UG9pbnRzQnlJZHMnLCBmdW5jdGlvbiAoX3BJZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRQb2ludHMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IHsgJGluOiBfcElkcyB9IH0pO1xufSk7XG5cblxuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IHBvaW50cyBieSB1c2VyXG4gKiBAcGFyYW0ge3N0cmluZ30gdXNlcl9pZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudFBvaW50c0J5VXNlcicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudFBvaW50cy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KVxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IE5lZ2F0aXZlUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnRzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IG5lZ2F0aXZlIHBvaW50cyBieSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldE5lZ2F0aXZlUG9pbnRzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiAoX3BJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIE5lZ2F0aXZlUG9pbnRzLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBfcElkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIG5lZ2F0aXZlIHBvaXRucyBieSBlc3RhYmxpc2htZW50cyBhcnJheVxuICovXG5cbk1ldGVvci5wdWJsaXNoKCdnZXROZWdhdGl2ZVBvaW50c0J5RXN0YWJsaXNobWVudHNBcnJheScsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudEFycmF5OiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBOZWdhdGl2ZVBvaW50cy5maW5kKHsgXCJlc3RhYmxpc2htZW50X2lkXCI6IHsgJGluOiBfZXN0YWJsaXNobWVudEFycmF5IH0gfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IFJld2FyZHNDb25maXJtYXRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbi5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV3YXJkcyBjb25maXJtYXRpb24gYnkgZXN0YWJsaXNobWVudCBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wRXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRSZXdhcmRzQ29uZmlybWF0aW9uc0J5RXN0YWJsaXNobWVudElkJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfcEVzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gUmV3YXJkc0NvbmZpcm1hdGlvbnMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IF9wRXN0YWJsaXNobWVudElkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJld2FyZHMgY29uZmlybWF0aW9uIGJ5IGVzdGFibGlzaG1lbnRzIGlkc1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkc0NvbmZpcm1hdGlvbnNCeUVzdGFibGlzaG1lbnRzSWRzJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudHNJZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIFJld2FyZHNDb25maXJtYXRpb25zLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiB7ICRpbjogX3BFc3RhYmxpc2htZW50c0lkcyB9IH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBSZXdhcmRIaXN0b3JpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9yZXdhcmQtaGlzdG9yeS5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV3YXJkcyBoaXN0b3JpZXMgYnkgZXN0YWJsaXNobWVudCBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wRXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRSZXdhcmRIaXN0b3JpZXNCeUVzdGFibGlzaG1lbnRJZCcsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3BFc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFJld2FyZEhpc3Rvcmllcy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogX3BFc3RhYmxpc2htZW50SWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV3YXJkcyBoaXN0b3JpZXMgYnkgdXNlciBpZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkSGlzdG9yaWVzQnlVc2VySWQnLCBmdW5jdGlvbiAoX3BVc2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wVXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBSZXdhcmRIaXN0b3JpZXMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF9wVXNlcklkIH0pO1xufSk7IiwiaW1wb3J0IHsgRXN0YWJsaXNobWVudHMsIEVzdGFibGlzaG1lbnRzUHJvZmlsZSB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBTZWN0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9zZWN0aW9uLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ2F0ZWdvcmllcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9jYXRlZ29yeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFN1YmNhdGVnb3JpZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc3ViY2F0ZWdvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBBZGRpdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvYWRkaXRpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBPcmRlcnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvb3JkZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBUYWJsZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBXYWl0ZXJDYWxsRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC93YWl0ZXItY2FsbC1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDY1BheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kcy5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBheW1lbnRUcmFuc2FjdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC10cmFuc2FjdGlvbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE9yZGVySGlzdG9yaWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IExhbmd1YWdlcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFJld2FyZFBvaW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSZXdhcmRzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgT3B0aW9uVmFsdWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L29wdGlvbi12YWx1ZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvb3B0aW9uLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSW52b2ljZXNJbmZvIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2ludm9pY2VzLWluZm8uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludHMuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBOZWdhdGl2ZVBvaW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL25lZ2F0aXZlLXBvaW50cy5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZWRiaW5kZXhlcygpIHtcblxuICAgIC8vIEVzdGFibGlzaG1lbnQgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgbmFtZTogMSB9KTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzQWN0aXZlOiAxIH0pO1xuXG4gICAgLy8gRXN0YWJsaXNobWVudCBQcm9maWxlIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIEVzdGFibGlzaG1lbnRzUHJvZmlsZS5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRfaWQ6IDEgfSk7XG5cbiAgICAvLyBVc2VyIENvbGxlY3Rpb25zIEluZGV4ZXNcbiAgICBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHVzZXJfaWQ6IDEgfSk7XG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X3dvcms6IDEgfSk7XG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IDEsIGN1cnJlbnRfdGFibGU6IDEgfSk7XG5cbiAgICAvLyBTZWN0aW9uIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIFNlY3Rpb25zLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY3JlYXRpb25fdXNlcjogMSB9KTtcbiAgICBTZWN0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuXG4gICAgLy8gQ2F0ZWdvcnkgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgQ2F0ZWdvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgQ2F0ZWdvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHNlY3Rpb246IDEgfSk7XG5cbiAgICAvLyBTdWJjYXRlZ29yeSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBTdWJjYXRlZ29yaWVzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY3JlYXRpb25fdXNlcjogMSB9KTtcbiAgICBTdWJjYXRlZ29yaWVzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY2F0ZWdvcnk6IDEgfSk7XG5cbiAgICAvLyBBZGRpdGlvbiBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBBZGRpdGlvbnMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIEFkZGl0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuXG4gICAgLy8gSXRlbSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBJdGVtcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgSXRlbXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBzZWN0aW9uSWQ6IDEgfSk7XG4gICAgSXRlbXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50czogMSB9KTtcblxuICAgIC8vIFBheW1lbnRNZXRob2QgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUGF5bWVudE1ldGhvZHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpc0FjdGl2ZTogMSB9KTtcblxuICAgIC8vIFBheW1lbnRzSGlzdG9yeSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkczogMSB9KTtcbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIFBheW1lbnRzSGlzdG9yeS5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX2RhdGU6IDEgfSk7XG5cbiAgICAvLyBUYWJsZXMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgVGFibGVzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgUVJfY29kZTogMSB9KTtcbiAgICBUYWJsZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gT3JkZXJzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIE9yZGVycy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRfaWQ6IDEgfSk7XG4gICAgT3JkZXJzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgdGFibGVJZDogMSB9KTtcbiAgICBPcmRlcnMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBzdGF0dXM6IDEgfSk7XG5cbiAgICAvLyBXYWl0ZXJDYWxsRGV0YWlscyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBXYWl0ZXJDYWxsRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHN0YXR1czogMSB9KTtcbiAgICBXYWl0ZXJDYWxsRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHVzZXJfaWQ6IDEgfSk7XG4gICAgV2FpdGVyQ2FsbERldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxLCB0YWJsZV9pZDogMSwgdHlwZTogMSB9KTtcblxuICAgIC8vIENjUGF5bWVudE1ldGhvZHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgQ2NQYXltZW50TWV0aG9kcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzX2FjdGl2ZTogMSB9KTtcblxuICAgIC8vIFBheW1lbnRUcmFuc2FjdGlvbnMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUGF5bWVudFRyYW5zYWN0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG5cbiAgICAvLyBPcmRlckhpc3RvcmllcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBPcmRlckhpc3Rvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGN1c3RvbWVyX2lkOiAxLCBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gQ291bnRyaWVzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIENvdW50cmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzX2FjdGl2ZTogMSB9KTtcblxuICAgIC8vIExhbmd1YWdlcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBMYW5ndWFnZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpc19hY3RpdmU6IDEgfSk7XG5cbiAgICAvLyBSZXdhcmRQb2ludHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUmV3YXJkUG9pbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgaWRfdXNlcjogMSB9KTtcblxuICAgIC8vIFJld2FyZHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUmV3YXJkcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuICAgIFJld2FyZHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpdGVtX2lkOiAxIH0pO1xuXG4gICAgLy8gUGFyYW1ldGVycyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgbmFtZTogMSB9KTtcblxuICAgIC8vIE9wdGlvblZhbHVlcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBPcHRpb25WYWx1ZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIE9wdGlvblZhbHVlcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IG9wdGlvbl9pZDogMSB9KTtcblxuICAgIC8vIE9wdGlvbnMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgT3B0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgT3B0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuXG4gICAgLy8gSW52b2ljZXNJbmZvIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIEludm9pY2VzSW5mby5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNvdW50cnlfaWQ6IDEgfSk7XG5cbiAgICAvLyBFc3RhYmxpc2htZW50UG9pbnRzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIEVzdGFibGlzaG1lbnRQb2ludHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gTmVnYXRpdmVQb2ludHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgTmVnYXRpdmVQb2ludHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xufSIsImltcG9ydCB7IFN5bmNlZENyb24gfSBmcm9tICdtZXRlb3IvcGVyY29sYXRlOnN5bmNlZC1jcm9uJztcblN5bmNlZENyb24uY29uZmlnKHtcbiAgICAvLyBMb2cgam9iIHJ1biBkZXRhaWxzIHRvIGNvbnNvbGVcbiAgICBsb2c6IHRydWUsXG5cbiAgICAvLyBVc2UgYSBjdXN0b20gbG9nZ2VyIGZ1bmN0aW9uIChkZWZhdWx0cyB0byBNZXRlb3IncyBsb2dnaW5nIHBhY2thZ2UpXG4gICAgbG9nZ2VyOiBudWxsLFxuXG4gICAgLy8gTmFtZSBvZiBjb2xsZWN0aW9uIHRvIHVzZSBmb3Igc3luY2hyb25pc2F0aW9uIGFuZCBsb2dnaW5nXG4gICAgY29sbGVjdGlvbk5hbWU6ICdjcm9uX2hpc3RvcnknLFxuXG4gICAgLy8gRGVmYXVsdCB0byB1c2luZyBsb2NhbFRpbWVcbiAgICB1dGM6IGZhbHNlLFxuXG4gICAgLypcbiAgICAgIFRUTCBpbiBzZWNvbmRzIGZvciBoaXN0b3J5IHJlY29yZHMgaW4gY29sbGVjdGlvbiB0byBleHBpcmVcbiAgICAgIE5PVEU6IFVuc2V0IHRvIHJlbW92ZSBleHBpcnkgYnV0IGVuc3VyZSB5b3UgcmVtb3ZlIHRoZSBpbmRleCBmcm9tXG4gICAgICBtb25nbyBieSBoYW5kXG5cbiAgICAgIEFMU086IFN5bmNlZENyb24gY2FuJ3QgdXNlIHRoZSBgX2Vuc3VyZUluZGV4YCBjb21tYW5kIHRvIG1vZGlmeVxuICAgICAgdGhlIFRUTCBpbmRleC4gVGhlIGJlc3Qgd2F5IHRvIG1vZGlmeSB0aGUgZGVmYXVsdCB2YWx1ZSBvZlxuICAgICAgYGNvbGxlY3Rpb25UVExgIGlzIHRvIHJlbW92ZSB0aGUgaW5kZXggYnkgaGFuZCAoaW4gdGhlIG1vbmdvIHNoZWxsXG4gICAgICBydW4gYGRiLmNyb25IaXN0b3J5LmRyb3BJbmRleCh7c3RhcnRlZEF0OiAxfSlgKSBhbmQgcmUtcnVuIHlvdXJcbiAgICAgIHByb2plY3QuIFN5bmNlZENyb24gd2lsbCByZWNyZWF0ZSB0aGUgaW5kZXggd2l0aCB0aGUgdXBkYXRlZCBUVEwuXG4gICAgKi9cbiAgICBjb2xsZWN0aW9uVFRMOiAxNzI4MDBcbn0pOyIsImltcG9ydCB7IFN5bmNlZENyb24gfSBmcm9tICdtZXRlb3IvcGVyY29sYXRlOnN5bmNlZC1jcm9uJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWwgfSBmcm9tICdtZXRlb3IvZW1haWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3JvbnMoKSB7XG4gIGxldCBhY3RpdmVDb3VudHJpZXMgPSBDb3VudHJpZXMuY29sbGVjdGlvbi5maW5kKHsgaXNfYWN0aXZlOiB0cnVlIH0pLmZldGNoKCk7XG4gIGFjdGl2ZUNvdW50cmllcy5mb3JFYWNoKGNvdW50cnkgPT4ge1xuICAgIC8qKlxuICAgICogVGhpcyBjcm9uIGV2YWx1YXRlcyB0aGUgZnJlZURheXMgZmxhZyBvbiBlc3RhYmxpc2htZW50cyB3aXRoIHZhbHVlIHRydWUsIGFuZCBjaGFuZ2UgaXQgdG8gZmFsc2VcbiAgICAqL1xuICAgLyoqXG4gICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgbmFtZTogJ2Nyb25DaGFuZ2VGcmVlRGF5cy4nICsgY291bnRyeS5uYW1lLFxuICAgICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChwYXJzZXIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5jcm9uKGNvdW50cnkuY3JvbkNoYW5nZUZyZWVEYXlzKTtcbiAgICAgIH0sXG4gICAgICBqb2I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTWV0ZW9yLmNhbGwoJ2NoYW5nZUZyZWVEYXlzVG9GYWxzZScsIGNvdW50cnkuX2lkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICogVGhpcyBjcm9uIHNlbmRzIGVtYWlsIHRvIHdhcm4gdGhlIGNoYXJnZSBzb29uIG9mIGl1cmVzdCBzZXJ2aWNlXG4gICAgKi9cbiAgIC8qKlxuICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgIG5hbWU6ICdjcm9uRW1haWxDaGFyZ2VTb29uLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uRW1haWxDaGFyZ2VTb29uKTtcbiAgICAgIH0sXG4gICAgICBqb2I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTWV0ZW9yLmNhbGwoJ3NlbmRFbWFpbENoYXJnZVNvb24nLCBjb3VudHJ5Ll9pZCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgICovXG5cbiAgICAvKipcbiAgICAqIFRoaXMgY3JvbiBzZW5kcyBlbWFpbCB0byB3YXJuIHRoZSBleHBpcmUgc29vbiB0aGUgaXVyZXN0IHNlcnZpY2VcbiAgICAqL1xuICAgLyoqXG4gICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgbmFtZTogJ2Nyb25FbWFpbEV4cGlyZVNvb24uJyArIGNvdW50cnkubmFtZSxcbiAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAocGFyc2VyKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIuY3Jvbihjb3VudHJ5LmNyb25FbWFpbEV4cGlyZVNvb24pO1xuICAgICAgfSxcbiAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICBNZXRlb3IuY2FsbCgnc2VuZEVtYWlsRXhwaXJlU29vbicsIGNvdW50cnkuX2lkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAgKi9cblxuXG4gICAgLyoqXG4gICAgICogVGhpcyBjcm9uIGV2YWx1YXRlcyB0aGUgaXNBY3RpdmUgZmxhZyBvbiBlc3RhYmxpc2htZW50cyB3aXRoIHZhbHVlIHRydWUsIGFuZCBpbnNlcnQgdGhlbSBvbiBoaXN0b3J5X3BheW1lbnQgY29sbGVjdGlvblxuICAgICAqL1xuICAgIC8qKlxuICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgIG5hbWU6ICdjcm9uVmFsaWRhdGVBY3RpdmUuJyArIGNvdW50cnkubmFtZSxcbiAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAocGFyc2VyKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIuY3Jvbihjb3VudHJ5LmNyb25WYWxpZGF0ZUFjdGl2ZSk7XG4gICAgICB9LFxuICAgICAgam9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIE1ldGVvci5jYWxsKCd2YWxpZGF0ZUFjdGl2ZUVzdGFibGlzaG1lbnRzJywgY291bnRyeS5faWQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgICAqL1xuXG5cbiAgICAvKipcbiAgICAqIFRoaXMgY3JvbiBzZW5kcyBhbiBlbWFpbCB0byB3YXJuIHRoYXQgdGhlIHNlcnZpY2UgaGFzIGV4cGlyZWRcbiAgICAqL1xuICAgLyoqXG4gICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgbmFtZTogJ2Nyb25FbWFpbFJlc3RFeHBpcmVkLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uRW1haWxSZXN0RXhwaXJlZCk7XG4gICAgICB9LFxuICAgICAgam9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIE1ldGVvci5jYWxsKCdzZW5kRW1haWxSZXN0RXhwaXJlZCcsIGNvdW50cnkuX2lkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAgKi9cbiAgICBcbiAgICAvKipcbiAgICAqIFRoaXMgY3JvbiB2YWxpZGF0ZSB0aGUgcG9pbnRzIGV4cGlyYXRpb24gZGF0ZVxuICAgICovXG4gICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgbmFtZTogJ2Nyb25Qb2ludHNFeHBpcmUuJyArIGNvdW50cnkubmFtZSxcbiAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAocGFyc2VyKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIuY3Jvbihjb3VudHJ5LmNyb25Qb2ludHNFeHBpcmUpO1xuICAgICAgfSxcbiAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICBNZXRlb3IuY2FsbCgnY2hlY2tQb2ludHNUb0V4cGlyZScsIGNvdW50cnkuX2lkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cblN5bmNlZENyb24uc3RhcnQoKTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvc2VjdGlvbnMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvY2F0ZWdvcmllcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9zdWJjYXRlZ29yaWVzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L2FkZGl0aW9ucyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9pdGVtJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L29wdGlvbnMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvb3B0aW9uLXZhbHVlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC91c2Vycyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9yb2xlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9tZW51cyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9jb2xsYWJvcmF0b3JzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3VzZXItZGV0YWlscyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9ob3VyJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2N1cnJlbmN5JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL3BheW1lbnRNZXRob2QnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvZW1haWwtY29udGVudCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXInO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvY291bnRyaWVzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2xhbmd1YWdlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wb2ludCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC90eXBlLW9mLWZvb2QnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L3BheW1lbnQtdHJhbnNhY3Rpb24nO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvaW52b2ljZS1pbmZvJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L2N5Zy1pbnZvaWNlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXInO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvdGFibGUnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvd2FpdGVyLWNhbGwnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL2JhZ19wbGFucyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnRfcG9pbnRzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnQnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFscyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24nO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9yZXdhcmQtaGlzdG9yeSc7XG5cbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL21lbnUvaXRlbS5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvY29sbGFib3JhdG9ycy5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvbWVudS5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXRhaWwubWV0aG9kcyc7XG5pbXBvcnQgJy4uL2JvdGgvbWV0aG9kcy9hdXRoL3VzZXItZGV2aWNlcy5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvdXNlci1sb2dpbi5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvdXNlci5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvY3Jvbi5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvZW1haWwubWV0aG9kcyc7XG5pbXBvcnQgJy4uL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2NoYW5nZS1lbWFpbC5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvY291bnRyeS5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvY3lnLWludm9pY2UubWV0aG9kcyc7XG5pbXBvcnQgJy4uL2JvdGgvbWV0aG9kcy9nZW5lcmFsL3B1c2gtbm90aWZpY2F0aW9ucy5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL3Jld2FyZC9yZXdhcmQubWV0aG9kcyc7XG5cbmltcG9ydCAnLi9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvYWNjb3VudC1jcmVhdGlvbic7XG5pbXBvcnQgJy4vaW1wb3J0cy9maXh0dXJlcy9hdXRoL2VtYWlsLWNvbmZpZyc7XG5pbXBvcnQgeyByZW1vdmVGaXh0dXJlcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9yZW1vdmUtZml4dHVyZXMnO1xuaW1wb3J0IHsgbG9hZFJvbGVzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvcm9sZXMnO1xuaW1wb3J0IHsgbG9hZE1lbnVzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvbWVudXMnO1xuaW1wb3J0IHsgbG9hZEhvdXJzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvaG91cnMnO1xuaW1wb3J0IHsgbG9hZEN1cnJlbmNpZXMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9jdXJyZW5jaWVzJztcbmltcG9ydCB7IGxvYWRQYXltZW50TWV0aG9kcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL3BheW1lbnRNZXRob2RzJztcbmltcG9ydCB7IGxvYWRDb3VudHJpZXMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9jb3VudHJpZXMnO1xuaW1wb3J0IHsgbG9hZExhbmd1YWdlcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL2xhbmd1YWdlcyc7XG5pbXBvcnQgeyBsb2FkRW1haWxDb250ZW50cyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL2VtYWlsLWNvbnRlbnRzJztcbmltcG9ydCB7IGxvYWRQYXJhbWV0ZXJzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvcGFyYW1ldGVycyc7XG5pbXBvcnQgeyBsb2FkQ2NQYXltZW50TWV0aG9kcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9wYXltZW50cy9jYy1wYXltZW50LW1ldGhvZHMnO1xuaW1wb3J0IHsgbG9hZEludm9pY2VzSW5mbyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9wYXltZW50cy9pbnZvaWNlcy1pbmZvJztcbmltcG9ydCB7IGxvYWRQb2ludHMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9wb2ludCc7XG5pbXBvcnQgeyBsb2FkVHlwZXNPZkZvb2QgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC90eXBlLW9mLWZvb2QnO1xuaW1wb3J0IHsgY3JlYXRlZGJpbmRleGVzIH0gZnJvbSAnLi9pbXBvcnRzL2luZGV4ZXMvaW5kZXhkYic7XG5pbXBvcnQgeyBjcmVhdGVDcm9ucyB9IGZyb20gJy4vY3Jvbic7XG5pbXBvcnQgeyBsb2FkQmFnUGxhbnMgfSBmcm9tIFwiLi9pbXBvcnRzL2ZpeHR1cmVzL3BvaW50cy9iYWdfcGxhbnNcIjtcblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICAgIHJlbW92ZUZpeHR1cmVzKCk7XG4gICAgbG9hZE1lbnVzKCk7XG4gICAgbG9hZFJvbGVzKCk7XG4gICAgbG9hZEhvdXJzKCk7XG4gICAgbG9hZEN1cnJlbmNpZXMoKTtcbiAgICBsb2FkUGF5bWVudE1ldGhvZHMoKTtcbiAgICBsb2FkQ291bnRyaWVzKCk7XG4gICAgbG9hZExhbmd1YWdlcygpO1xuICAgIGxvYWRFbWFpbENvbnRlbnRzKCk7XG4gICAgbG9hZFBhcmFtZXRlcnMoKTtcbiAgICBsb2FkQ2NQYXltZW50TWV0aG9kcygpO1xuICAgIGxvYWRJbnZvaWNlc0luZm8oKTtcbiAgICBsb2FkUG9pbnRzKCk7XG4gICAgbG9hZFR5cGVzT2ZGb29kKCk7XG4gICAgY3JlYXRlQ3JvbnMoKTtcbiAgICBsb2FkQmFnUGxhbnMoKTtcbiAgICBjcmVhdGVkYmluZGV4ZXMoKTtcbn0pO1xuIl19
