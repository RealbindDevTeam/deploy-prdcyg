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
const email_content_collection_1 = require("../../collections/general/email-content.collection");
const establishment_collection_1 = require("../../collections/establishment/establishment.collection");
const user_collection_1 = require("../../collections/auth/user.collection");
const parameter_collection_1 = require("../../collections/general/parameter.collection");
const meteorhacks_ssr_1 = require("meteor/meteorhacks:ssr");
const establishment_points_collection_1 = require("../../collections/points/establishment-points.collection");
if (meteor_1.Meteor.isServer) {
    meteor_1.Meteor.methods({
        /**
         * This function evaluates de the current medals for send warning to user every two days
         * @param {string} _countryId
         */
        checkCurrentMedals: function (_countryId) {
            let parameter = parameter_collection_1.Parameters.collection.findOne({ name: 'from_email' });
            let iurest_url = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_url' });
            let facebook = parameter_collection_1.Parameters.collection.findOne({ name: 'facebook_link' });
            let twitter = parameter_collection_1.Parameters.collection.findOne({ name: 'twitter_link' });
            let instagram = parameter_collection_1.Parameters.collection.findOne({ name: 'instagram_link' });
            let iurestImgVar = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_img_url' });
            let establishmentsArray = [];
            let max_medals = parseInt(parameter_collection_1.Parameters.collection.findOne({ name: 'max_medals_to_advice' }).value);
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId, is_beta_tester: false, isActive: true }).forEach(function (establishment, index, ar) {
                establishmentsArray.push(establishment._id);
            });
            establishment_points_collection_1.EstablishmentPoints.collection.find({ establishment_id: { $in: establishmentsArray }, negative_balance: false, negative_advice_counter: { $eq: 0 } }).forEach(function (establishmentPoint, index, ar) {
                if (establishmentPoint.current_points <= max_medals && establishmentPoint.current_points > 0) {
                    establishment_collection_1.Establishments.collection.find({ _id: establishmentPoint.establishment_id }).forEach(function (establishment2, index, ar) {
                        let user = user_collection_1.Users.collection.findOne({ _id: establishment2.creation_user });
                        let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
                        let greetVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                        let greeting = (user.profile && user.profile.full_name) ? (greetVar + ' ' + user.profile.full_name + ",") : greetVar;
                        meteorhacks_ssr_1.SSR.compileTemplate('checkMedalsEmailHtml', Assets.getText('check-medals-email.html'));
                        var emailData = {
                            greeting: greeting,
                            reminderMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderCurrentMedals1'),
                            establishmentName: establishment2.name,
                            reminderMsgVar2: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderCurrentMedals2'),
                            currentMedals: establishmentPoint.current_points,
                            reminderMsgVar3: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderCurrentMedals3'),
                            reminderMsgVar4: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderCurrentMedals4'),
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
                            subject: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'checkMedalsSubjectVar'),
                            html: meteorhacks_ssr_1.SSR.render('checkMedalsEmailHtml', emailData),
                        });
                    });
                }
            });
        },
        /**
         * This function evaluates de the current medals for send warning to user every two days
         * @param {string} _countryId
         */
        checkNegativeMedals: function (_countryId) {
            let parameter = parameter_collection_1.Parameters.collection.findOne({ name: 'from_email' });
            let iurest_url = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_url' });
            let facebook = parameter_collection_1.Parameters.collection.findOne({ name: 'facebook_link' });
            let twitter = parameter_collection_1.Parameters.collection.findOne({ name: 'twitter_link' });
            let instagram = parameter_collection_1.Parameters.collection.findOne({ name: 'instagram_link' });
            let iurestImgVar = parameter_collection_1.Parameters.collection.findOne({ name: 'iurest_img_url' });
            let max_days = parseInt(parameter_collection_1.Parameters.collection.findOne({ name: 'max_days_to_advice' }).value);
            let establishmentsArray = [];
            establishment_collection_1.Establishments.collection.find({ countryId: _countryId, is_beta_tester: false, isActive: true }).forEach(function (establishment, index, ar) {
                establishmentsArray.push(establishment._id);
            });
            establishment_points_collection_1.EstablishmentPoints.collection.find({ establishment_id: { $in: establishmentsArray }, negative_balance: true, negative_advice_counter: { $gte: 0 } }).forEach(function (establishmentPoint, index, ar) {
                let advice_aux = establishmentPoint.negative_advice_counter + 1;
                if (establishmentPoint.negative_advice_counter <= max_days) {
                    establishment_points_collection_1.EstablishmentPoints.collection.update({ _id: establishmentPoint._id }, {
                        $set: {
                            negative_advice_counter: establishmentPoint.negative_advice_counter + 1
                        }
                    });
                    establishment_collection_1.Establishments.collection.find({ _id: establishmentPoint.establishment_id }).forEach(function (establishment2, index, ar) {
                        let user = user_collection_1.Users.collection.findOne({ _id: establishment2.creation_user });
                        let emailContent = email_content_collection_1.EmailContents.collection.findOne({ language: user.profile.language_code });
                        let greetVar = meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                        let greeting = (user.profile && user.profile.full_name) ? (greetVar + ' ' + user.profile.full_name + ",") : greetVar;
                        meteorhacks_ssr_1.SSR.compileTemplate('checkNegativeEmailHtml', Assets.getText('check-negative-email.html'));
                        var emailData = {
                            greeting: greeting,
                            reminderMsgVar: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderNegativeMedals1'),
                            establishmentName: establishment2.name,
                            reminderMsgVar2: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderNegativeMedals2'),
                            currentMedals: establishmentPoint.current_points * -1,
                            reminderMsgVar3: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderNegativeMedals3'),
                            reminderMsgVar4: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderNegativeMedals4'),
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
                            subject: meteor_1.Meteor.call('getEmailContent', emailContent.lang_dictionary, 'checkNegativeSubjectVar'),
                            html: meteorhacks_ssr_1.SSR.render('checkNegativeEmailHtml', emailData),
                        });
                    });
                }
                else {
                    establishment_collection_1.Establishments.collection.update({ _id: establishmentPoint.establishment_id }, {
                        $set: {
                            isActive: false
                        }
                    });
                }
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
            { _id: '100', is_active: false, name: 'COUNTRIES.ALBANIA', alfaCode2: 'AL', alfaCode3: 'ALB', numericCode: '008', indicative: '(+ 355)', currencyId: '270', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '200', is_active: false, name: 'COUNTRIES.GERMANY', alfaCode2: 'DE', alfaCode3: 'DEU', numericCode: '276', indicative: '(+ 49)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '300', is_active: false, name: 'COUNTRIES.ANDORRA', alfaCode2: 'AD', alfaCode3: 'AND', numericCode: '020', indicative: '(+ 376)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '400', is_active: false, name: 'COUNTRIES.ARGENTINA', alfaCode2: 'AR', alfaCode3: 'ARG', numericCode: '032', indicative: '(+ 54)', currencyId: '370', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '500', is_active: false, name: 'COUNTRIES.ARMENIA', alfaCode2: 'AM', alfaCode3: 'ARM', numericCode: '051', indicative: '(+ 374)', currencyId: '190', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '600', is_active: false, name: 'COUNTRIES.AUSTRIA', alfaCode2: 'AT', alfaCode3: 'AUT', numericCode: '040', indicative: '(+ 43)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '700', is_active: false, name: 'COUNTRIES.AZERBAIJAN', alfaCode2: 'AZ', alfaCode3: 'AZE', numericCode: '031', indicative: '(+ 994)', currencyId: '350', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '800', is_active: false, name: 'COUNTRIES.BELGIUM', alfaCode2: 'BE', alfaCode3: 'BEL', numericCode: '056', indicative: '(+ 32)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '900', is_active: false, name: 'COUNTRIES.BELIZE', alfaCode2: 'BZ', alfaCode3: 'BLZ', numericCode: '084', indicative: '(+ 501)', currencyId: '130', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1000', is_active: false, name: 'COUNTRIES.BERMUDAS', alfaCode2: 'BM', alfaCode3: 'BMU', numericCode: '060', indicative: '(+ 1004)', currencyId: '140', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1100', is_active: false, name: 'COUNTRIES.BELARUS', alfaCode2: 'BY', alfaCode3: 'BLR', numericCode: '112', indicative: '(+ 375)', currencyId: '440', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1200', is_active: false, name: 'COUNTRIES.BOLIVIA', alfaCode2: 'BO', alfaCode3: 'BOL', numericCode: '068', indicative: '(+ 591)', currencyId: '30', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1300', is_active: false, name: 'COUNTRIES.BOSNIA_HERZEGOVINA', alfaCode2: 'BA', alfaCode3: 'BIH', numericCode: '070', indicative: '(+ 387)', currencyId: '360', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1400', is_active: false, name: 'COUNTRIES.BRAZIL', alfaCode2: 'BR', alfaCode3: 'BRA', numericCode: '076', indicative: '(+ 55)', currencyId: '430', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1500', is_active: false, name: 'COUNTRIES.BULGARIA', alfaCode2: 'BG', alfaCode3: 'BGR', numericCode: '100', indicative: '(+ 359)', currencyId: '310', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1600', is_active: false, name: 'COUNTRIES.CANADA', alfaCode2: 'CA', alfaCode3: 'CAN', numericCode: '124', indicative: '(+ 001)', currencyId: '150', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1700', is_active: false, name: 'COUNTRIES.CHILE', alfaCode2: 'CL', alfaCode3: 'CHL', numericCode: '152', indicative: '(+ 56)', currencyId: '380', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1800', is_active: false, name: 'COUNTRIES.CYPRUS', alfaCode2: 'CY', alfaCode3: 'CYP', numericCode: '196', indicative: '(+357)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '1900', is_active: true, name: 'COUNTRIES.COLOMBIA', alfaCode2: 'CO', alfaCode3: 'COL', numericCode: '170', indicative: '(+ 57)', currencyId: '390', itemsWithDifferentTax: false, cronCheckCurrentMedals: '0 7 */2 * *', cronCheckNegativeMedals: '* 8 * * *' },
            { _id: '2000', is_active: false, name: 'COUNTRIES.COSTA_RICA', alfaCode2: 'CR', alfaCode3: 'CRI', numericCode: '188', indicative: '(+ 506)', currencyId: '40', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2100', is_active: false, name: 'COUNTRIES.CROATIA', alfaCode2: 'HR', alfaCode3: 'HRV', numericCode: '191', indicative: '(+ 385)', currencyId: '250', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2200', is_active: false, name: 'COUNTRIES.DENMARK', alfaCode2: 'DK', alfaCode3: 'DNK', numericCode: '208', indicative: '(+ 45)', currencyId: '70', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2300', is_active: false, name: 'COUNTRIES.ECUADOR', alfaCode2: 'EC', alfaCode3: 'ECU', numericCode: '218', indicative: '(+ 593)', currencyId: '160', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2400', is_active: false, name: 'COUNTRIES.EL_SALVADOR', alfaCode2: 'SV', alfaCode3: 'SLV', numericCode: '222', indicative: '(+ 503)', currencyId: '160', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2500', is_active: false, name: 'COUNTRIES.SLOVAKIA', alfaCode2: 'SK', alfaCode3: 'SVK', numericCode: '703', indicative: '(+ 421)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2600', is_active: false, name: 'COUNTRIES.SLOVENIA', alfaCode2: 'SI', alfaCode3: 'SVN', numericCode: '705', indicative: '(+ 386)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2700', is_active: false, name: 'COUNTRIES.SPAIN', alfaCode2: 'ES', alfaCode3: 'ESP', numericCode: '724', indicative: '(+ 34)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2800', is_active: false, name: 'COUNTRIES.UNITED_STATES', alfaCode2: 'US', alfaCode3: 'USA', numericCode: '840', indicative: '(+ 1)', currencyId: '160', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '2900', is_active: false, name: 'COUNTRIES.ESTONIA', alfaCode2: 'EE', alfaCode3: 'EST', numericCode: '233', indicative: '(+ 372)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3000', is_active: false, name: 'COUNTRIES.FINLAND', alfaCode2: 'FI', alfaCode3: 'FIN', numericCode: '246', indicative: '(+ 358)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3100', is_active: false, name: 'COUNTRIES.FRANCE', alfaCode2: 'FR', alfaCode3: 'FRA', numericCode: '250', indicative: '(+ 33)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3200', is_active: false, name: 'COUNTRIES.GEORGIA', alfaCode2: 'GE', alfaCode3: 'GEO', numericCode: '268', indicative: '(+ 995)', currencyId: '260', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3300', is_active: false, name: 'COUNTRIES.GREECE', alfaCode2: 'GR', alfaCode3: 'GRC', numericCode: '300', indicative: '(+ 30)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3400', is_active: false, name: 'COUNTRIES.GREENLAND', alfaCode2: 'GL', alfaCode3: 'GRL', numericCode: '304', indicative: '(+ 299)', currencyId: '70', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3500', is_active: false, name: 'COUNTRIES.GUATEMALA', alfaCode2: 'GT', alfaCode3: 'GTM', numericCode: '320', indicative: '(+ 502)', currencyId: '420', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3600', is_active: false, name: 'COUNTRIES.FRENCH_GUIANA', alfaCode2: 'GF', alfaCode3: 'GUF', numericCode: '254', indicative: '(+ 594)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3700', is_active: false, name: 'COUNTRIES.GUYANA', alfaCode2: 'GY', alfaCode3: 'GUY', numericCode: '328', indicative: '(+ 592)', currencyId: '170', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3800', is_active: false, name: 'COUNTRIES.HONDURAS', alfaCode2: 'HN', alfaCode3: 'HND', numericCode: '340', indicative: '(+ 504)', currencyId: '280', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '3900', is_active: false, name: 'COUNTRIES.HUNGARY', alfaCode2: 'HU', alfaCode3: 'HUN', numericCode: '348', indicative: '(+ 36)', currencyId: '210', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4000', is_active: false, name: 'COUNTRIES.IRELAND', alfaCode2: 'IE', alfaCode3: 'IRL', numericCode: '372', indicative: '(+ 353)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4100', is_active: false, name: 'COUNTRIES.ICELAND', alfaCode2: 'IS', alfaCode3: 'ISL', numericCode: '352', indicative: '(+ 354)', currencyId: '80', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4200', is_active: false, name: 'COUNTRIES.FALKLAND_ISLANDS', alfaCode2: 'FK', alfaCode3: 'FLK', numericCode: '238', indicative: '(+ 500)', currencyId: '330', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4300', is_active: false, name: 'COUNTRIES.ITALY', alfaCode2: 'IT', alfaCode3: 'ITA', numericCode: '380', indicative: '(+ 39)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4400', is_active: false, name: 'COUNTRIES.KAZAKHSTAN', alfaCode2: 'KZ', alfaCode3: 'KAZ', numericCode: '398', indicative: '(+ 731)', currencyId: '470', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4500', is_active: false, name: 'COUNTRIES.LATVIA', alfaCode2: 'LV', alfaCode3: 'LVA', numericCode: '428', indicative: '(+ 371)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4600', is_active: false, name: 'COUNTRIES.LIECHTENSTEIN', alfaCode2: 'LI', alfaCode3: 'LIE', numericCode: '438', indicative: '(+ 417)', currencyId: '220', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4700', is_active: false, name: 'COUNTRIES.LITHUANIA', alfaCode2: 'LT', alfaCode3: 'LTU', numericCode: '440', indicative: '(+ 370)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4800', is_active: false, name: 'COUNTRIES.LUXEMBOURG', alfaCode2: 'LU', alfaCode3: 'LUX', numericCode: '442', indicative: '(+ 352)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '4900', is_active: false, name: 'COUNTRIES.MACEDONIA', alfaCode2: 'MK', alfaCode3: 'MKD', numericCode: '807', indicative: '(+ 389)', currencyId: '110', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5000', is_active: false, name: 'COUNTRIES.MALTA', alfaCode2: 'MT', alfaCode3: 'MLT', numericCode: '470', indicative: '(+ 356)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5100', is_active: false, name: 'COUNTRIES.MEXICO', alfaCode2: 'MX', alfaCode3: 'MEX', numericCode: '484', indicative: '(+ 52)', currencyId: '400', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5200', is_active: false, name: 'COUNTRIES.MOLDAVIA', alfaCode2: 'MD', alfaCode3: 'MDA', numericCode: '498', indicative: '(+ 373)', currencyId: '290', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5300', is_active: false, name: 'COUNTRIES.MONACO', alfaCode2: 'MC', alfaCode3: 'MCO', numericCode: '492', indicative: '(+ 377)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5400', is_active: false, name: 'COUNTRIES.MONTENEGRO', alfaCode2: 'ME', alfaCode3: 'MNE', numericCode: '499', indicative: '(+ 382)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5500', is_active: false, name: 'COUNTRIES.NICARAGUA', alfaCode2: 'NI', alfaCode3: 'NIC', numericCode: '558', indicative: '(+ 505)', currencyId: '50', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5600', is_active: false, name: 'COUNTRIES.NORWAY', alfaCode2: 'NO', alfaCode3: 'NOR', numericCode: '578', indicative: '(+ 47)', currencyId: '90', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5700', is_active: false, name: 'COUNTRIES.NETHERLANDS', alfaCode2: 'NL', alfaCode3: 'NLD', numericCode: '528', indicative: '(+ 31)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5800', is_active: false, name: 'COUNTRIES.PANAMA', alfaCode2: 'PA', alfaCode3: 'PAN', numericCode: '591', indicative: '(+ 507)', currencyId: '10', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '5900', is_active: false, name: 'COUNTRIES.PARAGUAY', alfaCode2: 'PY', alfaCode3: 'PRY', numericCode: '600', indicative: '(+ 595)', currencyId: '240', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6000', is_active: false, name: 'COUNTRIES.PERU', alfaCode2: 'PE', alfaCode3: 'PER', numericCode: '604', indicative: '(+ 51)', currencyId: '460', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6100', is_active: false, name: 'COUNTRIES.POLAND', alfaCode2: 'PL', alfaCode3: 'POL', numericCode: '616', indicative: '(+ 48)', currencyId: '480', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6200', is_active: false, name: 'COUNTRIES.PORTUGAL', alfaCode2: 'PT', alfaCode3: 'PRT', numericCode: '620', indicative: '(+ 351)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6300', is_active: false, name: 'COUNTRIES.UNITED_KINGDOM', alfaCode2: 'GB', alfaCode3: 'GBR', numericCode: '826', indicative: '(+ 44)', currencyId: '320', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6400', is_active: false, name: 'COUNTRIES.CZECH_REPUBLIC', alfaCode2: 'CZ', alfaCode3: 'CZE', numericCode: '203', indicative: '(+ 42)', currencyId: '60', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6500', is_active: false, name: 'COUNTRIES.ROMANIA', alfaCode2: 'RO', alfaCode3: 'ROU', numericCode: '642', indicative: '(+ 40)', currencyId: '300', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6600', is_active: false, name: 'COUNTRIES.RUSSIA', alfaCode2: 'RU', alfaCode3: 'RUS', numericCode: '643', indicative: '(+ 7)', currencyId: '450', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6700', is_active: false, name: 'COUNTRIES.SAN_MARINO', alfaCode2: 'SM', alfaCode3: 'SMR', numericCode: '674', indicative: '(+ 378)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6800', is_active: false, name: 'COUNTRIES.SAINT_PIERRE_MIQUELON', alfaCode2: 'PM', alfaCode3: 'SPM', numericCode: '666', indicative: '(+ 508)', currencyId: '200', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '6900', is_active: false, name: 'COUNTRIES.SERBIA', alfaCode2: 'RS', alfaCode3: 'SRB', numericCode: '688', indicative: '(+ 381)', currencyId: '120', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '7000', is_active: false, name: 'COUNTRIES.SWEDEN', alfaCode2: 'SE', alfaCode3: 'SWE', numericCode: '752', indicative: '(+ 46)', currencyId: '100', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '7100', is_active: false, name: 'COUNTRIES.SWITZERLAND', alfaCode2: 'CH', alfaCode3: 'CHE', numericCode: '756', indicative: '(+ 41)', currencyId: '220', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '7200', is_active: false, name: 'COUNTRIES.SURINAM', alfaCode2: 'SR', alfaCode3: 'SUR', numericCode: '740', indicative: '(+ 597)', currencyId: '180', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '7300', is_active: false, name: 'COUNTRIES.TURKEY', alfaCode2: 'TR', alfaCode3: 'TUR', numericCode: '792', indicative: '(+ 90)', currencyId: '340', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '7400', is_active: false, name: 'COUNTRIES.UKRAINE', alfaCode2: 'UA', alfaCode3: 'UKR', numericCode: '804', indicative: '(+ 380)', currencyId: '230', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '7500', is_active: false, name: 'COUNTRIES.URUGUAY', alfaCode2: 'UY', alfaCode3: 'URY', numericCode: '858', indicative: '(+ 598)', currencyId: '410', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' },
            { _id: '7600', is_active: false, name: 'COUNTRIES.VENEZUELA', alfaCode2: 'VE', alfaCode3: 'VEN', numericCode: '862', indicative: '(+ 58)', currencyId: '20', itemsWithDifferentTax: false, cronCheckCurrentMedals: '', cronCheckNegativeMedals: '' }
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
                    { label: 'resetPasswordSubjectVar', traduction: 'Reset your password on' },
                    { label: 'reminderCurrentMedals1', traduction: 'Soon you will finish your medals for ' },
                    { label: 'reminderCurrentMedals2', traduction: 'You only have ' },
                    { label: 'reminderCurrentMedals3', traduction: ' medals' },
                    { label: 'reminderCurrentMedals4', traduction: 'Select the menu Packages > Buy packages and continues loyalty your customers with comeygana' },
                    { label: 'checkMedalsSubjectVar', traduction: 'Your medals will end soon' },
                    { label: 'reminderNegativeMedals1', traduction: 'You have finished your medals for ' },
                    { label: 'reminderNegativeMedals2', traduction: 'But do not worry, we have lent you ' },
                    { label: 'reminderNegativeMedals3', traduction: 'medals while you buy a new package' },
                    { label: 'reminderNegativeMedals4', traduction: 'To buy a new package select the menu Packages > Buy packages and continues loyalty your customers with comeygana' },
                    { label: 'checkNegativeSubjectVar', traduction: 'Your medals are over' }
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
                    { label: 'resetPasswordSubjectVar', traduction: 'Cambio de contraseña en' },
                    { label: 'reminderCurrentMedals1', traduction: 'Pronto terminarás tus medallas para ' },
                    { label: 'reminderCurrentMedals2', traduction: 'Únicamente tienes ' },
                    { label: 'reminderCurrentMedals3', traduction: ' medallas' },
                    { label: 'reminderCurrentMedals4', traduction: 'Selecciona el menú Paquetes > Compra de paquetes, y continua fidelizando a tus clientes con comeygana' },
                    { label: 'checkMedalsSubjectVar', traduction: 'Tus medallas comeygana están próximas a terminar' },
                    { label: 'reminderNegativeMedals1', traduction: 'Has terminado las medallas para ' },
                    { label: 'reminderNegativeMedals2', traduction: 'Pero no te preocupes te préstamos las ' },
                    { label: 'reminderNegativeMedals3', traduction: 'medallas que has usado, mientras adquieres un nuevo paquete' },
                    { label: 'reminderNegativeMedals4', traduction: 'Para comprar un nuevo paquete selecciona el menu Paquetes > Compra de paquetes, y continua fidelizando tu cliente con comeygana' },
                    { label: 'checkNegativeSubjectVar', traduction: 'Tus medallas se han acabado' }
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
            { _id: '1700', name: 'facebook_link', value: 'https://www.facebook.com/comeygana/', description: 'facebook link for comeygana' },
            { _id: '1800', name: 'twitter_link', value: 'https://twitter.com/ComeyganaApp', description: 'twitter link for comeygana' },
            { _id: '1900', name: 'instagram_link', value: 'https://www.instagram.com/comeygana', description: 'instagram link for comeygana' },
            { _id: '1610', name: 'iurest_img_url', value: ' http://app.comeygana.com/images/', description: 'comeygana images url' },
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
            { _id: '30000', name: 'terms_url', value: 'http://www.comeygana.com/signin/', description: 'url to see terms and conditions' },
            { _id: '40000', name: 'policy_url', value: 'http://www.comeygana.com/signup/', description: 'url to see privacy policy' },
            { _id: '50000', name: 'QR_code_url', value: 'http://www.comeygana.com/gana-por-comer', description: 'This url redirect to page the comeygana/download when scanned QR code from other application' },
            { _id: '2300', name: 'user_start_points', value: '1', description: 'User start points' },
            { _id: '5000', name: 'max_medals_to_advice', value: '50', description: 'Max medals to evaluate on cron to send email' },
            { _id: '5500', name: 'max_days_to_advice', value: '2', description: 'Max day to advice pending medals' }
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
                value_points: 35,
                active: true,
            },
            {
                _id: '200',
                name: 'small',
                label: 'BAG_PLAN.SMALL',
                price: [{
                        country_id: "1900",
                        price: 45900,
                        currency: 'COP'
                    }],
                value_points: 50,
                active: true,
            },
            {
                _id: '300',
                name: 'medium',
                label: 'BAG_PLAN.MEDIUM',
                price: [{
                        country_id: "1900",
                        price: 50900,
                        currency: 'COP'
                    }],
                value_points: 80,
                active: true,
            },
            {
                _id: '400',
                name: 'large',
                label: 'BAG_PLAN.LARGE',
                price: [{
                        country_id: "1900",
                        price: 54900,
                        currency: 'COP'
                    }],
                value_points: 100,
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
        /**This cron evaluates the current medals of the establishment to advice to purchase more*/
        percolate_synced_cron_1.SyncedCron.add({
            name: 'cronCheckCurrentMedals.' + country.name,
            schedule: function (parser) {
                return parser.cron(country.cronCheckCurrentMedals);
            },
            job: function () {
                Meteor.call('checkCurrentMedals', country._id);
            }
        });
        /**
         * This cron evaluates de negative medals of the establishment to advite to pay pending
        */
        percolate_synced_cron_1.SyncedCron.add({
            name: 'cronCheckNegativeMedals.' + country.name,
            schedule: function (parser) {
                return parser.cron(country.cronCheckNegativeMedals);
            },
            job: function () {
                Meteor.call('checkNegativeMedals', country._id);
            }
        });
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
        /**
         SyncedCron.add({
           name: 'cronPointsExpire.' + country.name,
           schedule: function (parser) {
             return parser.cron(country.cronPointsExpire);
           },
           job: function () {
             Meteor.call('checkPointsToExpire', country._id);
           }
         });
          */
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvUVIvY29kZUdlbmVyYXRvci50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvYXV0aC9jb2xsYWJvcmF0b3JzLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9hdXRoL21lbnUubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXRhaWwubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXZpY2VzLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9hdXRoL3VzZXItbG9naW4ubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jaGFuZ2UtZW1haWwubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2dlbmVyYWwvY291bnRyeS5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jcm9uLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2N5Zy1pbnZvaWNlLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2VtYWlsLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL3B1c2gtbm90aWZpY2F0aW9ucy5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvbWVudS9pdGVtLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9yZXdhcmQvcmV3YXJkLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9kZXZpY2UuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3JvbGUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWxvZ2luLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLXBlbmFsdHkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3dhaXRlci1jYWxsLWRldGFpbC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY3VycmVuY3kuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2hvdXJzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wb2ludC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcXVldWUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL21lbnUvYWRkaXRpb24uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9tZW51L2NhdGVnb3J5LmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvbWVudS9vcHRpb24tdmFsdWUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9tZW51L29wdGlvbi5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc2VjdGlvbi5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc3ViY2F0ZWdvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kcy5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvY3lnLWludm9pY2VzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L3BheW1lbnQtdHJhbnNhY3Rpb24uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWwuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludHMuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnRzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvcmV3YXJkLWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tb2RlbHMvYXV0aC9kZXZpY2UubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2F1dGgvdXNlci1sb2dpbi5tb2RlbC50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tb2RlbHMvYXV0aC91c2VyLXByb2ZpbGUubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbC50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9ub2RlLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21vZGVscy9wYXltZW50L3Jlc3BvbnNlLXF1ZXJ5Lm1vZGVsLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL3NoYXJlZC1jb21wb25lbnRzL3ZhbGlkYXRvcnMvY3VzdG9tLXZhbGlkYXRvci50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9hY2NvdW50LWNyZWF0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9maXh0dXJlcy9hdXRoL2VtYWlsLWNvbmZpZy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9tZW51cy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9yb2xlcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9jb3VudHJpZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvY3VycmVuY2llcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9lbWFpbC1jb250ZW50cy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9ob3Vycy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9sYW5ndWFnZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvcGFyYW1ldGVycy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9wYXltZW50TWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9wb2ludC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC90eXBlLW9mLWZvb2QudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL3BheW1lbnRzL2NjLXBheW1lbnQtbWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvcGF5bWVudHMvaW52b2ljZXMtaW5mby50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvcG9pbnRzL2JhZ19wbGFucy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvcmVtb3ZlLWZpeHR1cmVzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9jb2xsYWJvcmF0b3JzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9tZW51cy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2F1dGgvcm9sZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3VzZXItZGV0YWlscy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2F1dGgvdXNlcnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC90YWJsZS50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvd2FpdGVyLWNhbGwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2NvdW50cmllcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvY3VycmVuY3kudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2hvdXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2xhbmd1YWdlcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvcGFyYW1ldGVyLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wb2ludC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvdHlwZS1vZi1mb29kLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9hZGRpdGlvbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L2NhdGVnb3JpZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L2l0ZW0udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L29wdGlvbi12YWx1ZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L29wdGlvbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L3NlY3Rpb25zLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9zdWJjYXRlZ29yaWVzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvY3lnLWludm9pY2VzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9pbnZvaWNlLWluZm8udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L3BheW1lbnQtaGlzdG9yeS50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvcGF5bWVudC10cmFuc2FjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9iYWdfcGxhbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudF9wb2ludHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9yZXdhcmQtaGlzdG9yeS50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvaW5kZXhlcy9pbmRleGRiLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvY3Jvbi1jb25maWcudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9jcm9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNkRBQTBEO0FBRTFELHNEQUF1RDtBQUV2RDtJQVlJLFlBQWEsaUJBQXdCO1FBVDdCLGVBQVUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQWUsQ0FBQztRQUN2RCxhQUFRLEdBQWUsSUFBSSxLQUFLLEVBQVEsQ0FBQztRQUN6QyxRQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFpQixDQUFDO1FBQ2xELGNBQVMsR0FBUSxJQUFJLFdBQUksRUFBRSxDQUFDO1FBQzVCLGVBQVUsR0FBRyxFQUFFLENBQUM7UUFDaEIsc0JBQWlCLEdBQVUsQ0FBQyxDQUFDO1FBS2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsaUJBQWlCLENBQUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU0sWUFBWTtRQUNmLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFJ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QUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDblAsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNsUCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ25QLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDcFAsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVB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QUUsVUFBVSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUN0UCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3BQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDbFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNwUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxT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QUU7WUFDMVAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUN0UCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3ZQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDdFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNsUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ2xQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDclAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNuUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3ZQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDclAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNqUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3ZQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDbFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNyUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ2hQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDbFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNyUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQzFQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDelAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNuUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ2pQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDdlAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGlDQUFpQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNsUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ25QLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDbFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUN2UCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3BQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDbFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNwUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3BQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7U0FDdlAsQ0FBQztRQUNGLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFnQixFQUFFLEVBQUUsQ0FBQyw4QkFBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7QUFDTCxDQUFDO0FBbEZELHNDQWtGQzs7Ozs7Ozs7Ozs7Ozs7QUNwRkQsa0dBQXNGO0FBRXRGO0lBQ0ksRUFBRSxFQUFFLGdDQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUUsQ0FBQyxFQUFDO1FBQ3pDLE1BQU0sVUFBVSxHQUFlO1lBQzNCLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUN4RyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDekcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQzNHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUNsSCxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDekcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGtDQUFrQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ3ZILEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUMvRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDNUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQzlHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUMvRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDeEcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQy9HLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUNoSCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDbkgsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDRCQUE0QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ2xILEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxpQ0FBaUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUN2SCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDaEgsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDRCQUE0QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ2xILEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUNoSCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDdkcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDJCQUEyQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ2pILEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUN4RyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsNEJBQTRCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDbEgsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQ3ZHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUN2RyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDdkcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ3RHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUMxRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDOUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQy9HLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUMvRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsMkJBQTJCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDakgsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLG1DQUFtQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ3pILEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUMvRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsOEJBQThCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDcEgsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDZCQUE2QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ25ILEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSwyQkFBMkIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUNqSCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDMUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ2hILEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUM5RyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUseUJBQXlCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDL0csRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQzFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSwyQkFBMkIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUNqSCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDaEgsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ2hILEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtZQUN0RyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDeEcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1NBQzNHLENBQUM7UUFDRixVQUFVLENBQUMsT0FBTyxDQUFFLENBQUUsR0FBWSxFQUFHLEVBQUUsQ0FBQyxnQ0FBVSxDQUFDLE1BQU0sQ0FBRSxHQUFHLENBQUUsQ0FBRSxDQUFDO0lBQ3ZFLENBQUM7QUFDTCxDQUFDO0FBdERELHdDQXNEQzs7Ozs7Ozs7Ozs7Ozs7QUN4REQsNEdBQThGO0FBRTlGO0lBQ0ksRUFBRSxDQUFDLENBQUMsd0NBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxNQUFNLGFBQWEsR0FBbUI7WUFDbEM7Z0JBQ0ksR0FBRyxFQUFFLEtBQUs7Z0JBQ1YsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsZUFBZSxFQUFFO29CQUNiLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLFVBQVUsRUFBRSwrQ0FBK0MsRUFBRTtvQkFDbkcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUU7b0JBQzFDLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsK0VBQStFLEVBQUU7b0JBQ3ZILEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFO29CQUM1QyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLGlFQUFpRSxFQUFFO29CQUN4RyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLHlCQUF5QixFQUFFO29CQUM3RCxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLDhCQUE4QixFQUFFO29CQUNyRSxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxVQUFVLEVBQUUsb0RBQW9ELEVBQUU7b0JBQ3ZHLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUU7b0JBQy9ELEVBQUUsS0FBSyxFQUFFLDZCQUE2QixFQUFFLFVBQVUsRUFBRSxpTEFBaUwsRUFBRTtvQkFDdk8sRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsVUFBVSxFQUFFLG9EQUFvRCxFQUFFO29CQUN2RyxFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFO29CQUNsRSxFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxVQUFVLEVBQUUsNElBQTRJLEVBQUU7b0JBQ2hNLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLFVBQVUsRUFBRSx5Q0FBeUMsRUFBRTtvQkFDN0YsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsVUFBVSxFQUFFLHNDQUFzQyxFQUFFO29CQUN2RixFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFO29CQUMvRCxFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsd0lBQXdJLEVBQUU7b0JBQzFMLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFFLFVBQVUsRUFBRSxvQ0FBb0MsRUFBRTtvQkFDekYsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixFQUFFO29CQUMxRSxFQUFFLEtBQUssRUFBRSx3QkFBd0IsRUFBRSxVQUFVLEVBQUUsdUNBQXVDLEVBQUU7b0JBQ3hGLEVBQUUsS0FBSyxFQUFFLHdCQUF3QixFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRTtvQkFDakUsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRTtvQkFDMUQsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsVUFBVSxFQUFFLDZGQUE2RixFQUFFO29CQUM5SSxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxVQUFVLEVBQUUsMkJBQTJCLEVBQUU7b0JBQzNFLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixFQUFFLFVBQVUsRUFBRSxvQ0FBb0MsRUFBRTtvQkFDdEYsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLHFDQUFxQyxFQUFFO29CQUN2RixFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsb0NBQW9DLEVBQUU7b0JBQ3RGLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixFQUFFLFVBQVUsRUFBRSxrSEFBa0gsRUFBRTtvQkFDcEssRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLHNCQUFzQixFQUFFO2lCQUMzRTthQUNKO1lBQ0Q7Z0JBQ0ksR0FBRyxFQUFFLEtBQUs7Z0JBQ1YsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsZUFBZSxFQUFFO29CQUNiLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLFVBQVUsRUFBRSxtREFBbUQsRUFBRTtvQkFDdkcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7b0JBQ3pDLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsa0dBQWtHLEVBQUU7b0JBQzFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFO29CQUM5QyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLDJEQUEyRCxFQUFFO29CQUNsRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLDJCQUEyQixFQUFFO29CQUMvRCxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLDRCQUE0QixFQUFFO29CQUNuRSxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxVQUFVLEVBQUUsc0RBQXNELEVBQUU7b0JBQ3pHLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUU7b0JBQ25FLEVBQUUsS0FBSyxFQUFFLDZCQUE2QixFQUFFLFVBQVUsRUFBRSwwTEFBMEwsRUFBRTtvQkFDaFAsRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsVUFBVSxFQUFFLHNEQUFzRCxFQUFFO29CQUN6RyxFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFO29CQUNqRSxFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxVQUFVLEVBQUUsMElBQTBJLEVBQUU7b0JBQzlMLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLFVBQVUsRUFBRSx1Q0FBdUMsRUFBRTtvQkFDM0YsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsVUFBVSxFQUFFLHlDQUF5QyxFQUFFO29CQUMxRixFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFO29CQUMvRCxFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsMElBQTBJLEVBQUU7b0JBQzVMLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFFLFVBQVUsRUFBRSxzQ0FBc0MsRUFBRTtvQkFDM0YsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLHlCQUF5QixFQUFFO29CQUMzRSxFQUFFLEtBQUssRUFBRSx3QkFBd0IsRUFBRSxVQUFVLEVBQUUsc0NBQXNDLEVBQUU7b0JBQ3ZGLEVBQUUsS0FBSyxFQUFFLHdCQUF3QixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRTtvQkFDckUsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRTtvQkFDNUQsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsVUFBVSxFQUFFLHVHQUF1RyxFQUFFO29CQUN4SixFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxVQUFVLEVBQUUsa0RBQWtELEVBQUU7b0JBQ2xHLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixFQUFFLFVBQVUsRUFBRSxrQ0FBa0MsRUFBRTtvQkFDcEYsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLHdDQUF3QyxFQUFFO29CQUMxRixFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsNkRBQTZELEVBQUU7b0JBQy9HLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixFQUFFLFVBQVUsRUFBRSxpSUFBaUksRUFBRTtvQkFDbkwsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLDZCQUE2QixFQUFFO2lCQUNsRjthQUNKO1NBQ0osQ0FBQztRQUNGLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUEwQixFQUFFLEVBQUUsQ0FBQyx3Q0FBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDTCxDQUFDO0FBNUVELDhDQTRFQzs7Ozs7Ozs7Ozs7Ozs7QUM5RUQsNEZBQThFO0FBRTlFO0lBRUksRUFBRSxFQUFDLHdCQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUUsQ0FBQyxFQUFDO1FBQ25DLE1BQU0sS0FBSyxHQUFXO1lBQ2xCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFP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LHdCQUFZLEVBQUUsQ0FBQztJQUNmLHlCQUFlLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiIvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L25vZGUnO1xuaW1wb3J0IHsgQnl0ZXNJbmZvLCBRUkNvZGVJbmZvcm1hdGlvbiB9IGZyb20gJy4uLy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3RhYmxlLm1vZGVsJztcbmltcG9ydCBDb2xsZWN0aW9ucyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnKTtcblxuZXhwb3J0IGNsYXNzIENvZGVHZW5lcmF0b3Ige1xuICAgIFxuICAgIHByaXZhdGUgc3RyaW5nVG9Db252ZXJ0OnN0cmluZztcbiAgICBwcml2YXRlIGRpY2Npb25hcnkgPSBuZXcgQ29sbGVjdGlvbnMuRGljdGlvbmFyeTxTdHJpbmcsTm9kZT4oKTtcbiAgICBwcml2YXRlIHNvcnRMaXN0OkFycmF5PE5vZGU+ID0gbmV3IEFycmF5PE5vZGU+KCk7XG4gICAgcHJpdmF0ZSBtYXAgPSBuZXcgQ29sbGVjdGlvbnMuRGljdGlvbmFyeTxTdHJpbmcsU3RyaW5nPigpO1xuICAgIHByaXZhdGUgZmluYWxUcmVlOk5vZGUgPSBuZXcgTm9kZSgpO1xuICAgIHByaXZhdGUgYmluYXJ5Q29kZSA9ICcnO1xuICAgIHByaXZhdGUgc2lnbmlmaWNhdGl2ZUJpdHM6bnVtYmVyID0gMDtcbiAgICBwcml2YXRlIGZpbmFsQnl0ZXM6IEJ5dGVzSW5mb1tdO1xuICAgIHByaXZhdGUgUVJDb2RlOnN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKCBfcFN0cmluZ1RvQ29udmVydDpzdHJpbmcgKXtcbiAgICAgICAgdGhpcy5zdHJpbmdUb0NvbnZlcnQgPSBfcFN0cmluZ1RvQ29udmVydDtcbiAgICAgICAgdGhpcy5maW5hbFRyZWUuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIHRoaXMuZmluYWxCeXRlcyA9IFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZW5lcmF0ZUNvZGUoKXtcbiAgICAgICAgdGhpcy5idWlsZEZyZWN1ZW5jeVRhYmxlKCk7XG4gICAgICAgIHRoaXMuc29ydERhdGEoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVUcmVlKCk7XG4gICAgICAgIHRoaXMuY29kZVRyZWUoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVRUkNvZGUoKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBidWlsZEZyZWN1ZW5jeVRhYmxlKCk6dm9pZHtcbiAgICAgICAgbGV0IF9sTm9kZTpOb2RlO1xuICAgICAgICBsZXQgX2xDaGFyczpudW1iZXIgPSAwO1xuXG4gICAgICAgIGZvcihsZXQgX2kgPSAwOyBfaSA8IHRoaXMuc3RyaW5nVG9Db252ZXJ0Lmxlbmd0aDsgX2krKyApe1xuICAgICAgICAgICAgX2xDaGFycyA9IHRoaXMuc3RyaW5nVG9Db252ZXJ0LmNoYXJDb2RlQXQoIF9pICk7XG4gICAgICAgICAgICBfbE5vZGUgPSB0aGlzLmRpY2Npb25hcnkuZ2V0VmFsdWUoICcnICsgX2xDaGFycyApO1xuXG4gICAgICAgICAgICBpZiggX2xOb2RlID09IG51bGwpe1xuICAgICAgICAgICAgICAgIGxldCBfbEF1eDpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgICAgICAgICBfbEF1eC5jcmVhdGVOb2RlKF9sQ2hhcnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGljY2lvbmFyeS5zZXRWYWx1ZSggX2xDaGFycyArICcnLCBfbEF1eCApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfbE5vZGUuc2V0RnJlY3VlbmN5KCBfbE5vZGUuZ2V0RnJlY3VlbmN5KCkgKyAxICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNvcnREYXRhKCk6dm9pZHtcbiAgICAgICAgbGV0IF9sTm9kZTpOb2RlO1xuICAgICAgICBsZXQgX2xGcmVjdWVuY3k6bnVtYmVyO1xuICAgICAgICBsZXQgX2xTb3J0RnJlY3VlbmN5Om51bWJlcltdID0gW107XG4gICAgICAgIGxldCBfbFNvcnRUTVA6QXJyYXk8bnVtYmVyPiA9IG5ldyBBcnJheTxudW1iZXI+KCk7XG4gICAgICAgIGxldCBfQXV4Q29udDpudW1iZXIgPSAwO1xuXG4gICAgICAgIGZvciggbGV0IF9pID0gMDsgX2kgPD0gMjU1OyBfaSsrICl7XG4gICAgICAgICAgICBfbFNvcnRUTVAuc3BsaWNlKCAwLCAwLCAwICk7XG4gICAgICAgIH0gICAgICAgIFxuXG4gICAgICAgIHRoaXMuZGljY2lvbmFyeS52YWx1ZXMoKS5mb3JFYWNoKChyZXMpPT4ge1xuICAgICAgICAgICAgX2xTb3J0RnJlY3VlbmN5LnNwbGljZSggX0F1eENvbnQsIDAsIHJlcy5nZXRGcmVjdWVuY3koKSApO1xuICAgICAgICAgICAgX2xTb3J0VE1QLnNwbGljZSggcmVzLmdldENoYXIoKSwgMSwgcmVzLmdldEZyZWN1ZW5jeSgpICk7IFxuICAgICAgICAgICAgX0F1eENvbnQrKztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2xTb3J0RnJlY3VlbmN5LnNvcnQoKTtcblxuICAgICAgICBfbFNvcnRGcmVjdWVuY3kuZm9yRWFjaCgobm9kKT0+e1xuICAgICAgICAgICAgbGV0IHRtcCA9IF9sU29ydFRNUC5pbmRleE9mKCBub2QgKTtcbiAgICAgICAgICAgIF9sU29ydFRNUC5zcGxpY2UoIHRtcCwgMSwgMCApO1xuICAgICAgICAgICAgbGV0IHRtcE5vZGU6Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgICAgICAgICB0bXBOb2RlLmNyZWF0ZU5vZGVFeHRlbmQoIG5vZCwgdG1wLCBudWxsLCBudWxsICk7XG4gICAgICAgICAgICB0aGlzLnNvcnRMaXN0LnB1c2godG1wTm9kZSk7XG4gICAgICAgIH0pOyAgICAgIFxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlTmV3Tm9kZSggX3BOb2RlTGVmdDpOb2RlLCBfcE5vZGVSaWdodDpOb2RlICk6Tm9kZXtcbiAgICAgICAgbGV0IF9sTmV3Tm9kZTpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgbGV0IF9sRnJlY3VlbmN5TmV3Tm9kZTpudW1iZXI7XG5cbiAgICAgICAgX2xGcmVjdWVuY3lOZXdOb2RlID0gKCBfcE5vZGVMZWZ0LmdldEZyZWN1ZW5jeSgpICsgX3BOb2RlUmlnaHQuZ2V0RnJlY3VlbmN5KCkgKTtcbiAgICAgICAgX2xOZXdOb2RlLmNyZWF0ZU5vZGVFeHRlbmQoIDAsIDI1NiwgbnVsbCwgbnVsbCApO1xuICAgICAgICBfbE5ld05vZGUuc2V0RnJlY3VlbmN5KCBfbEZyZWN1ZW5jeU5ld05vZGUgKTtcbiAgICAgICAgX2xOZXdOb2RlLnNldE5vZGVMZWZ0KCBfcE5vZGVMZWZ0ICk7XG4gICAgICAgIF9sTmV3Tm9kZS5zZXROb2RlUmlnaHQoIF9wTm9kZVJpZ2h0ICk7XG4gICAgICAgIHJldHVybiBfbE5ld05vZGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnNlcnROZXdOb2RlKCBfcE5ld05vZGU6Tm9kZSwgX3BTb3J0TGlzdDpBcnJheTxOb2RlPiApOkFycmF5PE5vZGU+e1xuICAgICAgICBsZXQgX2xGaXJzdE5vZGU6Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgICAgIGxldCBfbFNlY29uZE5vZGU6Tm9kZSA9IG5ldyBOb2RlKCk7XG5cbiAgICAgICAgX2xGaXJzdE5vZGUuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsKTtcbiAgICAgICAgX2xTZWNvbmROb2RlLmNyZWF0ZU5vZGVFeHRlbmQoIDAsIDI1NiwgbnVsbCwgbnVsbCApO1xuICAgICAgICBfcFNvcnRMaXN0LnNwbGljZSgwICwgMCwgX3BOZXdOb2RlICk7XG5cbiAgICAgICAgZm9yKCBsZXQgX2kgPSAwOyBfaSA8IF9wU29ydExpc3QubGVuZ3RoIC0gMTsgX2krKyApe1xuICAgICAgICAgICAgX2xGaXJzdE5vZGUgPSBfcFNvcnRMaXN0WyBfaSBdO1xuICAgICAgICAgICAgX2xTZWNvbmROb2RlID0gX3BTb3J0TGlzdFsgKF9pICsgMSkgXTtcblxuICAgICAgICAgICAgaWYoIF9sRmlyc3ROb2RlLmdldEZyZWN1ZW5jeSgpID49IF9sU2Vjb25kTm9kZS5nZXRGcmVjdWVuY3koKSApe1xuICAgICAgICAgICAgICAgIF9wU29ydExpc3Quc3BsaWNlKCAoIF9pICsgMSApLCAxLCBfbEZpcnN0Tm9kZSApO1xuICAgICAgICAgICAgICAgIF9wU29ydExpc3Quc3BsaWNlKCBfaSwgMSwgX2xTZWNvbmROb2RlICk7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcFNvcnRMaXN0O1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlVHJlZSgpOnZvaWQge1xuICAgICAgICBsZXQgX2xUZW1wTm9kZUxlZnQ6Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgICAgIGxldCBfbFRlbXBOb2RlUmlnaHQ6Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgICAgIGxldCBfbFRlbXBOZXdOb2RlOk5vZGUgPSBuZXcgTm9kZSgpO1xuXG4gICAgICAgIF9sVGVtcE5vZGVMZWZ0LmNyZWF0ZU5vZGVFeHRlbmQoIDAsIDI1NiwgbnVsbCwgbnVsbCApO1xuICAgICAgICBfbFRlbXBOb2RlUmlnaHQuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIF9sVGVtcE5ld05vZGUuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG5cbiAgICAgICAgd2hpbGUoIHRoaXMuc29ydExpc3QubGVuZ3RoICE9IDEgKXsgICAgICAgICAgICBcbiAgICAgICAgICAgIF9sVGVtcE5vZGVMZWZ0ID0gdGhpcy5zb3J0TGlzdC5zaGlmdCgpO1xuICAgICAgICAgICAgX2xUZW1wTm9kZVJpZ2h0ID0gdGhpcy5zb3J0TGlzdC5zaGlmdCgpO1xuICAgICAgICAgICAgX2xUZW1wTmV3Tm9kZSA9IHRoaXMuY3JlYXRlTmV3Tm9kZSggX2xUZW1wTm9kZUxlZnQsIF9sVGVtcE5vZGVSaWdodCApO1xuICAgICAgICAgICAgdGhpcy5zb3J0TGlzdCA9IHRoaXMuaW5zZXJ0TmV3Tm9kZSggX2xUZW1wTmV3Tm9kZSwgdGhpcy5zb3J0TGlzdCApO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgICAgdGhpcy5maW5hbFRyZWUgPSB0aGlzLnNvcnRMaXN0LnNoaWZ0KCk7XG4gICAgICAgIHRoaXMucHJlT3JkZXIoIHRoaXMuZmluYWxUcmVlLCBcIlwiICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcmVPcmRlciggX3BOb2RlOk5vZGUsIF9wVmFsOnN0cmluZyApOnZvaWR7XG4gICAgICAgIGlmKCBfcE5vZGUuZ2V0Tm9kZUxlZnQoKSA9PSBudWxsICYmIF9wTm9kZS5nZXROb2RlUmlnaHQoKSA9PSBudWxsICl7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRWYWx1ZSggX3BOb2RlLmdldENoYXIoKSArICcnLCBfcFZhbCApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlT3JkZXIoIF9wTm9kZS5nZXROb2RlTGVmdCgpLCBfcFZhbC5jb25jYXQoIFwiMVwiICkgKTtcbiAgICAgICAgdGhpcy5wcmVPcmRlciggX3BOb2RlLmdldE5vZGVSaWdodCgpLCBfcFZhbC5jb25jYXQoIFwiMFwiICkgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvZGVUcmVlKCk6dm9pZHtcbiAgICAgICAgbGV0IF9sQ29kZUJ5dGVzID0gJyc7XG4gICAgICAgIGxldCBfbENoYXJzID0gMDtcbiAgICAgICAgbGV0IF9sRW5kOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgbGV0IF9sQnl0ZTpudW1iZXI7XG4gICAgICAgIGxldCBfbENvZGU6c3RyaW5nID0gJyc7XG5cbiAgICAgICAgZm9yKCBsZXQgX2kgPSAwOyBfaSA8IHRoaXMuc3RyaW5nVG9Db252ZXJ0Lmxlbmd0aDsgX2krKyApe1xuICAgICAgICAgICAgX2xDaGFycyA9IHRoaXMuc3RyaW5nVG9Db252ZXJ0LmNoYXJDb2RlQXQoIF9pICk7XG4gICAgICAgICAgICB0aGlzLmJpbmFyeUNvZGUgKz0gdGhpcy5tYXAuZ2V0VmFsdWUoIF9sQ2hhcnMgKyAnJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgX2xDb2RlID0gdGhpcy5iaW5hcnlDb2RlO1xuXG4gICAgICAgIHdoaWxlKCAhX2xFbmQgKXtcblxuICAgICAgICAgICAgbGV0IEJ5dGVzSW5mbzpCeXRlc0luZm8gPSB7IGJpdHM6JycsIGZpbmFsQnl0ZTowLCBvcmlnaW5hbEJ5dGU6MCB9O1xuXG4gICAgICAgICAgICBmb3IoIGxldCBfaiA9IDA7IF9qIDwgODsgX2orKyApe1xuICAgICAgICAgICAgICAgIF9sQ29kZUJ5dGVzICs9IF9sQ29kZS5jaGFyQXQoIF9qICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfbEJ5dGUgPSBwYXJzZUludCggX2xDb2RlQnl0ZXMsIDIgKTtcbiAgICAgICAgICAgIEJ5dGVzSW5mby5vcmlnaW5hbEJ5dGUgPSBfbEJ5dGU7XG5cbiAgICAgICAgICAgIHdoaWxlKCB0cnVlICl7XG4gICAgICAgICAgICAgICAgX2xCeXRlID0gdGhpcy5ieXRlTml2ZWxhdG9yKCBfbEJ5dGUgKTtcbiAgICAgICAgICAgICAgICBpZiggX2xCeXRlID49IDY1ICYmIF9sQnl0ZSA8PSA5MCApe1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBCeXRlc0luZm8uZmluYWxCeXRlID0gX2xCeXRlO1xuICAgICAgICAgICAgQnl0ZXNJbmZvLmJpdHMgPSBfbENvZGVCeXRlcztcbiAgICAgICAgICAgIHRoaXMuZmluYWxCeXRlcy5wdXNoKCBCeXRlc0luZm8gKTtcbiAgICAgICAgICAgIF9sQ29kZUJ5dGVzID0gJyc7XG4gICAgICAgICAgICBfbENvZGUgPSBfbENvZGUuc3Vic3RyaW5nKCA4LCBfbENvZGUubGVuZ3RoICk7XG5cbiAgICAgICAgICAgIGlmKCBfbENvZGUubGVuZ3RoID09IDAgKXtcbiAgICAgICAgICAgICAgICBfbEVuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCBfbENvZGUubGVuZ3RoIDwgOCApe1xuICAgICAgICAgICAgICAgIF9sQ29kZSA9IHRoaXMuYWRkU2lnbmlmaWNhdGl2ZUJpdHMoIF9sQ29kZSApO1xuICAgICAgICAgICAgfSAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFNpZ25pZmljYXRpdmVCaXRzKCBfY29kZTpzdHJpbmcgKTpzdHJpbmd7XG4gICAgICAgIHdoaWxlKCBfY29kZS5sZW5ndGggPCA4ICl7XG4gICAgICAgICAgICBfY29kZSArPSBcIjBcIjtcbiAgICAgICAgICAgIHRoaXMuc2lnbmlmaWNhdGl2ZUJpdHMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2NvZGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBieXRlTml2ZWxhdG9yKCBfcEJ5dGU6bnVtYmVyICk6bnVtYmVye1xuICAgICAgICBsZXQgX2xOdW1iZXJDb252ZXJ0Om51bWJlciA9IDA7XG4gICAgICAgIGlmKCBfcEJ5dGUgPCA2NSApe1xuICAgICAgICAgICAgX2xOdW1iZXJDb252ZXJ0ID0gX3BCeXRlICsgMTA7XG4gICAgICAgIH0gZWxzZSBpZiggX3BCeXRlID4gOTAgKSB7XG4gICAgICAgICAgICBfbE51bWJlckNvbnZlcnQgPSBfcEJ5dGUgLSAxMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2xOdW1iZXJDb252ZXJ0ID0gX3BCeXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfbE51bWJlckNvbnZlcnQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVRUkNvZGUoKTp2b2lke1xuICAgICAgICBsZXQgX2xRUkNvZGU6c3RyaW5nID0gJyc7XG5cbiAgICAgICAgdGhpcy5maW5hbEJ5dGVzLmZvckVhY2goIChieXRlKSA9PiB7XG4gICAgICAgICAgICBfbFFSQ29kZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUuZmluYWxCeXRlKVxuICAgICAgICB9KTtcbiAgICAgICAgX2xRUkNvZGUgKz0gKCB0aGlzLmZpbmFsQnl0ZXNbIDAgXS5maW5hbEJ5dGUgKyAnJyApO1xuICAgICAgICBfbFFSQ29kZSArPSAoIHRoaXMuZmluYWxCeXRlc1sgdGhpcy5maW5hbEJ5dGVzLmxlbmd0aCAtIDEgXS5maW5hbEJ5dGUgKyAnJyApO1xuICAgICAgICB0aGlzLlFSQ29kZSA9IF9sUVJDb2RlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRGaW5hbEJ5dGVzKCk6Qnl0ZXNJbmZvW117XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmFsQnl0ZXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNpZ25pZmljYXRpdmVCaXRzKCk6bnVtYmVye1xuICAgICAgICByZXR1cm4gdGhpcy5zaWduaWZpY2F0aXZlQml0cztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UVJDb2RlKCk6c3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5RUkNvZGU7XG4gICAgfVxufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ29kZUdlbmVyYXRvciB9IGZyb20gJy4vUVIvY29kZUdlbmVyYXRvcic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuaW1wb3J0IHsgVXNlclBlbmFsdHkgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLXBlbmFsdHkubW9kZWwnO1xuaW1wb3J0IHsgVXNlclBlbmFsdGllcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1wZW5hbHR5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFFSIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC1xci5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UVJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LXFyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudE1lZGFsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRNZWRhbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZSByYW5kb20gY29kZSB3aXRoIDkgbGVuZ3RoIHRvIGVzdGFibGlzaG1lbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFc3RhYmxpc2htZW50Q29kZSgpOiBzdHJpbmcge1xuICAgIGxldCBfbFRleHQgPSAnJztcbiAgICBsZXQgX2xQb3NzaWJsZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XG5cbiAgICBmb3IgKGxldCBfaSA9IDA7IF9pIDwgOTsgX2krKykge1xuICAgICAgICBfbFRleHQgKz0gX2xQb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogX2xQb3NzaWJsZS5sZW5ndGgpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9sVGV4dDtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZSByYW5kb20gY29kZSB3aXRoIDUgbGVuZ3RoIHRvIGVzdGFibGlzaG1lbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUYWJsZUNvZGUoKTogc3RyaW5nIHtcbiAgICBsZXQgX2xUZXh0ID0gJyc7XG4gICAgbGV0IF9sUG9zc2libGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xuXG4gICAgZm9yIChsZXQgX2kgPSAwOyBfaSA8IDU7IF9pKyspIHtcbiAgICAgICAgX2xUZXh0ICs9IF9sUG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIF9sUG9zc2libGUubGVuZ3RoKSk7XG4gICAgfVxuICAgIHJldHVybiBfbFRleHQ7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBjcmVhdGUgcmFuZG9tIGNvZGUgd2l0aCAxNCBsZW5ndGggdG8gZXN0YWJsaXNobWVudCBRUlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29kZVRvRXN0YWJsaXNobWVudFFSKCk6IHN0cmluZyB7XG4gICAgbGV0IF9sVGV4dCA9ICcnO1xuICAgIGxldCBfbFBvc3NpYmxlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJztcblxuICAgIGZvciAobGV0IF9pID0gMDsgX2kgPCAxNDsgX2krKykge1xuICAgICAgICBfbFRleHQgKz0gX2xQb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogX2xQb3NzaWJsZS5sZW5ndGgpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9sVGV4dDtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZSBRUiBDb2RlcyB0byBlc3RhYmxpc2htZW50c1xuICogQHBhcmFtIHtzdHJpbmd9IF9wU3RyaW5nVG9Db2RlXG4gKiBAcmV0dXJuIHtUYWJsZX0gZ2VuZXJhdGVRUkNvZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUVJDb2RlKF9wU3RyaW5nVG9Db2RlOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCBfbENvZGVHZW5lcmF0b3IgPSBuZXcgQ29kZUdlbmVyYXRvcihfcFN0cmluZ1RvQ29kZSk7XG4gICAgX2xDb2RlR2VuZXJhdG9yLmdlbmVyYXRlQ29kZSgpO1xuICAgIHJldHVybiBfbENvZGVHZW5lcmF0b3I7XG59XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1ldGVvciBtZXRob2QgdG8gdmFsaWRhdGUgZXN0YWJsaXNobWVudCBRUiBjb2RlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBfcXJjb2RlXG4gICAgICAgICAqL1xuICAgICAgICB2ZXJpZnlFc3RhYmxpc2htZW50UVJDb2RlOiBmdW5jdGlvbiAoX3FyQ29kZTogc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgX2xFc3RhYmxpc2htZW50UVI6IEVzdGFibGlzaG1lbnRRUiA9IEVzdGFibGlzaG1lbnRRUnMuZmluZE9uZSh7IFFSX2NvZGU6IF9xckNvZGUgfSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIF9sRXN0YWJsaXNobWVudFFSICE9PSB1bmRlZmluZWQgfHwgX2xFc3RhYmxpc2htZW50UVIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2xFc3RhYmxpc2htZW50UVI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIE1ldGVvciBNZXRob2QgcmV0dXJuIGVzdGFibGlzaG1lbnQgb2JqZWN0IHdpdGggUVIgQ29kZSBjb25kaXRpb25cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9xckNvZGVcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAgICAgICAgICovXG4gICAgICAgIGdldEVzdGFibGlzaG1lbnRCeVFSQ29kZTogZnVuY3Rpb24gKF9xckNvZGU6IHN0cmluZywgX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgX2VzdGFibGlzaG1lbnQ6IEVzdGFibGlzaG1lbnQ7XG4gICAgICAgICAgICBsZXQgX2xFc3RhYmxpc2htZW50UVI6IEVzdGFibGlzaG1lbnRRUiA9IEVzdGFibGlzaG1lbnRRUnMuZmluZE9uZSh7IFFSX2NvZGU6IF9xckNvZGUgfSk7XG4gICAgICAgICAgICBsZXQgX2xVc2VyRGV0YWlsOiBVc2VyRGV0YWlsID0gVXNlckRldGFpbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQgfSk7XG5cbiAgICAgICAgICAgIGlmIChfbFVzZXJEZXRhaWwucGVuYWx0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBfbFVzZXJQZW5hbHR5OiBVc2VyUGVuYWx0eSA9IFVzZXJQZW5hbHRpZXMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQsIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAoX2xVc2VyUGVuYWx0eSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2xVc2VyUGVuYWx0eURheXM6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdwZW5hbHR5X2RheXMnIH0pO1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2xDdXJyZW50RGF0ZTogRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfbERhdGVUb0NvbXBhcmU6IERhdGUgPSBuZXcgRGF0ZShfbFVzZXJQZW5hbHR5Lmxhc3RfZGF0ZS5zZXREYXRlKChfbFVzZXJQZW5hbHR5Lmxhc3RfZGF0ZS5nZXREYXRlKCkgKyBOdW1iZXIoX2xVc2VyUGVuYWx0eURheXMudmFsdWUpKSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2xEYXRlVG9Db21wYXJlLmdldFRpbWUoKSA+PSBfbEN1cnJlbnREYXRlLmdldFRpbWUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sRGF5OiBudW1iZXIgPSBfbERhdGVUb0NvbXBhcmUuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sTW9udGg6IG51bWJlciA9IF9sRGF0ZVRvQ29tcGFyZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbFllYXI6IG51bWJlciA9IF9sRGF0ZVRvQ29tcGFyZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNTAwJywgX2xEYXkgKyAnLycgKyBfbE1vbnRoICsgJy8nICsgX2xZZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJQZW5hbHRpZXMudXBkYXRlKHsgX2lkOiBfbFVzZXJQZW5hbHR5Ll9pZCB9LCB7ICRzZXQ6IHsgaXNfYWN0aXZlOiBmYWxzZSB9IH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX2xFc3RhYmxpc2htZW50UVIpIHtcbiAgICAgICAgICAgICAgICBfZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2xFc3RhYmxpc2htZW50UVIuZXN0YWJsaXNobWVudF9pZCB9KTtcbiAgICAgICAgICAgICAgICBpZiAoX2VzdGFibGlzaG1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9lc3RhYmxpc2htZW50LmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xFc3RhYmxpc2htZW50TWVkYWw6IEVzdGFibGlzaG1lbnRNZWRhbCA9IEVzdGFibGlzaG1lbnRNZWRhbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQsIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50Ll9pZCB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9sRXN0YWJsaXNobWVudE1lZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sTmV3UXVhbnRpdHk6IG51bWJlciA9IF9sRXN0YWJsaXNobWVudE1lZGFsLm1lZGFscyArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudE1lZGFscy51cGRhdGUoeyBfaWQ6IF9sRXN0YWJsaXNobWVudE1lZGFsLl9pZCB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWNhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX3VzZXI6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IF9sTmV3UXVhbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50TWVkYWxzLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW9uX3VzZXI6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50Ll9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVkYWxzOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9sVXNlckRldGFpbC5ncmFudF9zdGFydF9wb2ludHMgIT09IHVuZGVmaW5lZCAmJiBfbFVzZXJEZXRhaWwuZ3JhbnRfc3RhcnRfcG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sRXhwaXJlRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sVXNlclN0YXJ0UG9pbnRzOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAndXNlcl9zdGFydF9wb2ludHMnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbEN1cnJlbnRFc3RhYmxpc2htZW50TWVkYWw6IEVzdGFibGlzaG1lbnRNZWRhbCA9IEVzdGFibGlzaG1lbnRNZWRhbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQsIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50Ll9pZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xOZXdRdWFudGl0eTogbnVtYmVyID0gX2xDdXJyZW50RXN0YWJsaXNobWVudE1lZGFsLm1lZGFscyArIE51bWJlci5wYXJzZUludChfbFVzZXJTdGFydFBvaW50cy52YWx1ZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50TWVkYWxzLnVwZGF0ZSh7IF9pZDogX2xDdXJyZW50RXN0YWJsaXNobWVudE1lZGFsLl9pZCB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWNhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX3VzZXI6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IF9sTmV3UXVhbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJEZXRhaWxzLnVwZGF0ZSh7IF9pZDogX2xVc2VyRGV0YWlsLl9pZCB9LCB7ICRzZXQ6IHsgZ3JhbnRfc3RhcnRfcG9pbnRzOiBmYWxzZSB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9lc3RhYmxpc2htZW50O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignMjAwJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCczMDAnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIG1ldGhvZCBhbGxvdyByZXN0YXVyYW50IGdpdmUgbWVkYWwgdG8gc3BlY2lmaWMgdXNlclxuICAgICAgICAgKi9cbiAgICAgICAgZ2l2ZU1lZGFsVG9Vc2VyOiBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nLCBfdXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBfZXN0YWJsaXNobWVudDogRXN0YWJsaXNobWVudDtcbiAgICAgICAgICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcblxuICAgICAgICAgICAgX2VzdGFibGlzaG1lbnQgPSBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IF9lc3RhYmxpc2htZW50SWQgfSk7XG4gICAgICAgICAgICBpZiAoX2VzdGFibGlzaG1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoX2VzdGFibGlzaG1lbnQuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9sRXN0YWJsaXNobWVudE1lZGFsOiBFc3RhYmxpc2htZW50TWVkYWwgPSBFc3RhYmxpc2htZW50TWVkYWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkLCBlc3RhYmxpc2htZW50X2lkOiBfZXN0YWJsaXNobWVudC5faWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF9sRXN0YWJsaXNobWVudE1lZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xOZXdRdWFudGl0eTogbnVtYmVyID0gX2xFc3RhYmxpc2htZW50TWVkYWwubWVkYWxzICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMudXBkYXRlKHsgX2lkOiBfbEVzdGFibGlzaG1lbnRNZWRhbC5faWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWNhdGlvbl91c2VyOiBfdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IF9sTmV3UXVhbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGlvbl91c2VyOiBfdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50X2lkOiBfZXN0YWJsaXNobWVudC5faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVkYWxzOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCcxNjAnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzE1MCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIG1ldGhvZCByZXR1cm4gZXN0YWJsaXNobWVudCBpZiBleGlzdCBvIG51bGwgaWYgbm90XG4gICAgICAgICAqL1xuXG4gICAgICAgIGdldEN1cnJlbnRFc3RhYmxpc2htZW50QnlVc2VyOiBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlc3RhYmxpc2htZW50ICE9IFwidW5kZWZpbmVkXCIgfHwgZXN0YWJsaXNobWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVzdGFibGlzaG1lbnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlRXN0YWJsaXNobWVudElzQWN0aXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgaWYgKHVzZXJEZXRhaWwpIHtcbiAgICAgICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogdXNlckRldGFpbC5lc3RhYmxpc2htZW50X3dvcmsgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVzdGFibGlzaG1lbnQuaXNBY3RpdmU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIGNyZWF0ZUNvbGxhYm9yYXRvclVzZXI6IGZ1bmN0aW9uICggX2luZm8gOiBhbnkgKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gQWNjb3VudHMuY3JlYXRlVXNlcih7XG4gICAgICAgICAgICAgICAgZW1haWw6IF9pbmZvLmVtYWlsLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBfaW5mby5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogX2luZm8udXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcHJvZmlsZTogX2luZm8ucHJvZmlsZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuICAgIFxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvcm9sZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE1lbnVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC9tZW51LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTWVudSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL21lbnUubW9kZWwnO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuXG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIGdldE1lbnVzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGxldCBtZW51TGlzdDogTWVudVtdID0gW107XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgbGV0IHJvbGUgPSBSb2xlcy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IHVzZXJEZXRhaWwucm9sZV9pZCB9KTtcbiAgICAgICAgICAgIE1lbnVzLmNvbGxlY3Rpb24uZmluZCh7IF9pZDogeyAkaW46IHJvbGUubWVudXMgfSwgaXNfYWN0aXZlOiB0cnVlIH0sIHsgc29ydDogeyBvcmRlcjogMSB9IH0pLmZvckVhY2goZnVuY3Rpb24gPE1lbnU+KG1lbnUsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgIG1lbnVMaXN0LnB1c2gobWVudSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBtZW51TGlzdDtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbCB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgZ2V0Um9sZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHJvbGU6IHN0cmluZyA9IFwiXCI7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgaWYodXNlckRldGFpbCl7XG4gICAgICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByb2xlO1xuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0ZUFkbWluOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcm9sZTogc3RyaW5nO1xuICAgICAgICAgICAgbGV0IHVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmRPbmUoeyB1c2VyX2lkOiB0aGlzLnVzZXJJZCB9KTtcbiAgICAgICAgICAgIHJvbGUgPSB1c2VyRGV0YWlsLnJvbGVfaWQ7XG4gICAgICAgICAgICBpZiAocm9sZSA9PT0gJzEwMCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0ZVdhaXRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHJvbGU6IHN0cmluZztcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICByb2xlID0gdXNlckRldGFpbC5yb2xlX2lkO1xuICAgICAgICAgICAgaWYgKHJvbGUgPT09ICcyMDAnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRhdGVDYXNoaWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcm9sZTogc3RyaW5nO1xuICAgICAgICAgICAgbGV0IHVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmRPbmUoeyB1c2VyX2lkOiB0aGlzLnVzZXJJZCB9KTtcbiAgICAgICAgICAgIHJvbGUgPSB1c2VyRGV0YWlsLnJvbGVfaWQ7XG4gICAgICAgICAgICBpZiAocm9sZSA9PT0gJzMwMCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0ZUN1c3RvbWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcm9sZTogc3RyaW5nO1xuICAgICAgICAgICAgbGV0IHVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmRPbmUoeyB1c2VyX2lkOiB0aGlzLnVzZXJJZCB9KTtcbiAgICAgICAgICAgIHJvbGUgPSB1c2VyRGV0YWlsLnJvbGVfaWQ7XG4gICAgICAgICAgICBpZiAocm9sZSA9PT0gJzQwMCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0ZUNoZWY6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnNTAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQWRtaW5PclN1cGVydmlzb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnMTAwJyB8fCByb2xlID09PSAnNjAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldERldGFpbHNDb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGNvdW50OiBudW1iZXI7XG4gICAgICAgICAgICBjb3VudCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZCh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pLmNvdW50KCk7XG4gICAgICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWYWxpZGF0ZSB1c2VyIGlzIGFjdGl2ZVxuICAgICAgICAgKi9cbiAgICAgICAgdmFsaWRhdGVVc2VySXNBY3RpdmUgOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IHVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmRPbmUoeyB1c2VyX2lkOiB0aGlzLnVzZXJJZCB9KTtcbiAgICAgICAgICAgIGlmKHVzZXJEZXRhaWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiB1c2VyRGV0YWlsLmlzX2FjdGl2ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbi8vaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuLy9pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwnO1xuXG5pbXBvcnQgeyBVc2VyRGV2aWNlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvZGV2aWNlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldmljZSwgRGV2aWNlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvZGV2aWNlLm1vZGVsJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgdXNlckRldmljZXNWYWxpZGF0aW9uOiBmdW5jdGlvbiAoIF9kYXRhIDogYW55ICkge1xuICAgICAgICAgICAgdmFyIF9kZXZpY2UgPSBuZXcgRGV2aWNlKCk7XG4gICAgICAgICAgICB2YXIgX3VzZXJEZXZpY2UgPSBVc2VyRGV2aWNlcy5jb2xsZWN0aW9uLmZpbmQoe3VzZXJfaWQ6IHRoaXMudXNlcklkfSk7XG5cbiAgICAgICAgICAgIF9kZXZpY2UucGxheWVyX2lkID0gX2RhdGEudXNlcklkO1xuICAgICAgICAgICAgX2RldmljZS5pc19hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggX3VzZXJEZXZpY2UuY291bnQoKSA9PT0gMCApIHtcblxuICAgICAgICAgICAgICAgIFVzZXJEZXZpY2VzLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQgOiBNZXRlb3IudXNlcklkKCksXG4gICAgICAgICAgICAgICAgICAgIGRldmljZXM6IFsgX2RldmljZSBdLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfdXNlckRldmljZS5jb3VudCgpID4gMCApIHtcbiAgICAgICAgICAgICAgICBfdXNlckRldmljZS5mZXRjaCgpLmZvckVhY2goICh1c3JfZGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfZGV2X3ZhbCA9IFVzZXJEZXZpY2VzLmNvbGxlY3Rpb24uZmluZCh7IFwiZGV2aWNlcy5wbGF5ZXJfaWRcIiA6IF9kYXRhLnVzZXJJZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfZGV2X3ZhbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBVc2VyRGV2aWNlcy51cGRhdGUoeyBfaWQgOiB1c3JfZGV2Ll9pZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJGFkZFRvU2V0IDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzOiAgX2RldmljZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBVc2VyRGV2aWNlcy51cGRhdGUoeyBcImRldmljZXMucGxheWVyX2lkXCIgOiBfZGF0YS51c2VySWQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ICRzZXQgOiB7IFwiZGV2aWNlcy4kLmlzX2FjdGl2ZVwiIDogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuICAgIFxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VyTG9naW4gwqB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItbG9naW4ubW9kZWwnO1xuaW1wb3J0IHsgVXNlcnNMb2dpbiB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1sb2dpbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBpbnNlcnRVc2VyTG9naW5JbmZvOiBmdW5jdGlvbiAoX3BVc2VyTG9naW46IFVzZXJMb2dpbikge1xuICAgICAgICAgICAgVXNlcnNMb2dpbi5pbnNlcnQoX3BVc2VyTG9naW4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNoYW5nZVVzZXJQYXNzd29yZDogZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZywgX25ld1Bhc3N3b3JkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIEFjY291bnRzLnNldFBhc3N3b3JkKF91c2VySWQsIF9uZXdQYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLm1vZGVsJztcbmltcG9ydCB7IFVzZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbCwgVXNlckRldGFpbFBlbmFsdHkgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBXYWl0ZXJDYWxsRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvd2FpdGVyLWNhbGwtZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVGFibGUgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC90YWJsZS5tb2RlbCc7XG5pbXBvcnQgeyBUYWJsZXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3RhYmxlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlclBlbmFsdGllcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1wZW5hbHR5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGFyYW1ldGVyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvcGFyYW1ldGVyLm1vZGVsJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgcGVuYWxpemVDdXN0b21lcjogZnVuY3Rpb24gKF9wQ3VzdG9tZXJVc2VyOiBVc2VyKSB7XG4gICAgICAgICAgICBsZXQgX2xVc2VyRGV0YWlsOiBVc2VyRGV0YWlsID0gVXNlckRldGFpbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF9wQ3VzdG9tZXJVc2VyLl9pZCB9KTtcbiAgICAgICAgICAgIGxldCBfbFVzZXJEZXRhaWxQZW5hbHR5OiBVc2VyRGV0YWlsUGVuYWx0eSA9IHsgZGF0ZTogbmV3IERhdGUoKSB9O1xuICAgICAgICAgICAgVXNlckRldGFpbHMudXBkYXRlKHsgX2lkOiBfbFVzZXJEZXRhaWwuX2lkIH0sIHsgJHB1c2g6IHsgcGVuYWx0aWVzOiBfbFVzZXJEZXRhaWxQZW5hbHR5IH0gfSk7XG5cbiAgICAgICAgICAgIGxldCBfbFVzZXJEZXRhaWxBdXg6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgX2lkOiBfbFVzZXJEZXRhaWwuX2lkIH0pO1xuICAgICAgICAgICAgbGV0IF9sTWF4VXNlclBlbmFsdGllczogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ21heF91c2VyX3BlbmFsdGllcycgfSk7XG4gICAgICAgICAgICBpZiAoX2xVc2VyRGV0YWlsQXV4LnBlbmFsdGllcy5sZW5ndGggPj0gTnVtYmVyKF9sTWF4VXNlclBlbmFsdGllcy52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgX2xMYXN0X2RhdGU6IERhdGUgPSBuZXcgRGF0ZShNYXRoLm1heC5hcHBseShudWxsLCBfbFVzZXJEZXRhaWxBdXgucGVuYWx0aWVzLm1hcChmdW5jdGlvbiAocCkgeyByZXR1cm4gbmV3IERhdGUocC5kYXRlKTsgfSkpKTtcbiAgICAgICAgICAgICAgICBVc2VyUGVuYWx0aWVzLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IF9wQ3VzdG9tZXJVc2VyLl9pZCxcbiAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsYXN0X2RhdGU6IF9sTGFzdF9kYXRlLFxuICAgICAgICAgICAgICAgICAgICBwZW5hbHRpZXM6IF9sVXNlckRldGFpbEF1eC5wZW5hbHRpZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBVc2VyRGV0YWlscy51cGRhdGUoeyBfaWQ6IF9sVXNlckRldGFpbC5faWQgfSwgeyAkc2V0OiB7IHBlbmFsdGllczogW10gfSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kVXNlcnMoX3BVc2VyRmlsdGVyOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAgICAgbGV0IF9sVXNlcnNJZDogc3RyaW5nW10gPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgICAgIGxldCBfbFVzZXJGaWx0ZXIgPSBVc2Vycy5jb2xsZWN0aW9uLmZpbmQoe1xuICAgICAgICAgICAgICAgICRvcjogW3sgXCJ1c2VybmFtZVwiOiB7ICRyZWdleDogX3BVc2VyRmlsdGVyIH0gfSxcbiAgICAgICAgICAgICAgICB7IFwiZW1haWxzLmFkZHJlc3NcIjogeyAkcmVnZXg6IF9wVXNlckZpbHRlciB9IH0sXG4gICAgICAgICAgICAgICAgeyBcInByb2ZpbGUubmFtZVwiOiB7ICRyZWdleDogX3BVc2VyRmlsdGVyIH0gfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKF9sVXNlckZpbHRlci5jb3VudCgpID4gMCkge1xuICAgICAgICAgICAgICAgIF9sVXNlckZpbHRlci5mb3JFYWNoKCh1c2VyOiBVc2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIF9sVXNlcnNJZC5wdXNoKHVzZXIuX2lkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfbFVzZXJzSWQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci5tb2RlbCc7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcblxuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgYWRkRW1haWw6IGZ1bmN0aW9uICggbmV3RW1haWwgOiBzdHJpbmcgKSB7XG4gICAgICAgICAgICBBY2NvdW50cy5hZGRFbWFpbChNZXRlb3IudXNlcklkKCksIG5ld0VtYWlsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgcmVtb3ZlRW1haWw6IGZ1bmN0aW9uICggb2xkRW1haWwgOiBzdHJpbmcgKSB7XG4gICAgICAgICAgICBBY2NvdW50cy5yZW1vdmVFbWFpbChNZXRlb3IudXNlcklkKCksIG9sZEVtYWlsKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL2NvdW50cnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDb3VudHJ5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvY291bnRyeS5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFRhYmxlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBUYWJsZSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3RhYmxlLm1vZGVsJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuXG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBnZXRDb3VudHJ5QnlFc3RhYmxpc2htZW50SWQ6IGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcblxuICAgICAgICAgICAgbGV0IHRhYmxlc19sZW5ndGg6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCBjb3VudHJ5OiBDb3VudHJ5O1xuICAgICAgICAgICAgbGV0IGVzdGFibGlzaG1lbnQ6IEVzdGFibGlzaG1lbnQ7XG5cbiAgICAgICAgICAgIGVzdGFibGlzaG1lbnQgPSBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IF9lc3RhYmxpc2htZW50SWQgfSk7XG4gICAgICAgICAgICBjb3VudHJ5ID0gQ291bnRyaWVzLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnQuY291bnRyeUlkIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gY291bnRyeS5uYW1lO1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBFbWFpbCB9IGZyb20gJ21ldGVvci9lbWFpbCc7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9lbWFpbC1jb250ZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWxDb250ZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvZW1haWwtY29udGVudC5tb2RlbCc7XG5pbXBvcnQgeyBMYW5nRGljdGlvbmFyeSB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBUYWJsZXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3RhYmxlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVGFibGUgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC90YWJsZS5tb2RlbCc7XG5pbXBvcnQgeyBQYXltZW50c0hpc3RvcnkgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wYXltZW50L3BheW1lbnQtaGlzdG9yeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBheW1lbnRIaXN0b3J5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5Lm1vZGVsJztcbmltcG9ydCB7IFVzZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXIubW9kZWwnO1xuaW1wb3J0IHsgUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGFyYW1ldGVyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvcGFyYW1ldGVyLm1vZGVsJztcbmltcG9ydCB7IFNTUiB9IGZyb20gJ21ldGVvci9tZXRlb3JoYWNrczpzc3InO1xuaW1wb3J0IHsgUmV3YXJkUG9pbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQubW9kZWwnO1xuaW1wb3J0IHsgUmV3YXJkUG9pbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwnO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LXBvaW50cy5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludC5tb2RlbCc7XG5cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gZXZhbHVhdGVzIGRlIHRoZSBjdXJyZW50IG1lZGFscyBmb3Igc2VuZCB3YXJuaW5nIHRvIHVzZXIgZXZlcnkgdHdvIGRheXNcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrQ3VycmVudE1lZGFsczogZnVuY3Rpb24gKF9jb3VudHJ5SWQ6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IHBhcmFtZXRlcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZnJvbV9lbWFpbCcgfSk7XG4gICAgICAgICAgICBsZXQgaXVyZXN0X3VybDogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X3VybCcgfSk7XG4gICAgICAgICAgICBsZXQgZmFjZWJvb2s6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2ZhY2Vib29rX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IHR3aXR0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ3R3aXR0ZXJfbGluaycgfSk7XG4gICAgICAgICAgICBsZXQgaW5zdGFncmFtOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpbnN0YWdyYW1fbGluaycgfSk7XG4gICAgICAgICAgICBsZXQgaXVyZXN0SW1nVmFyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpdXJlc3RfaW1nX3VybCcgfSk7XG4gICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudHNBcnJheTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBtYXhfbWVkYWxzOiBudW1iZXIgPSBwYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdtYXhfbWVkYWxzX3RvX2FkdmljZScgfSkudmFsdWUpO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjb3VudHJ5SWQ6IF9jb3VudHJ5SWQsIGlzX2JldGFfdGVzdGVyOiBmYWxzZSwgaXNBY3RpdmU6IHRydWUgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudHNBcnJheS5wdXNoKGVzdGFibGlzaG1lbnQuX2lkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50UG9pbnRzLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IHsgJGluOiBlc3RhYmxpc2htZW50c0FycmF5IH0sIG5lZ2F0aXZlX2JhbGFuY2U6IGZhbHNlLCBuZWdhdGl2ZV9hZHZpY2VfY291bnRlcjogeyAkZXE6IDAgfSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50UG9pbnQ+KGVzdGFibGlzaG1lbnRQb2ludCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVzdGFibGlzaG1lbnRQb2ludC5jdXJyZW50X3BvaW50cyA8PSBtYXhfbWVkYWxzICYmIGVzdGFibGlzaG1lbnRQb2ludC5jdXJyZW50X3BvaW50cyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgX2lkOiBlc3RhYmxpc2htZW50UG9pbnQuZXN0YWJsaXNobWVudF9pZCB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50Pihlc3RhYmxpc2htZW50MiwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXNlcjogVXNlciA9IFVzZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogZXN0YWJsaXNobWVudDIuY3JlYXRpb25fdXNlciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCA9IEVtYWlsQ29udGVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgbGFuZ3VhZ2U6IHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdyZWV0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdncmVldFZhcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdyZWV0aW5nOiBzdHJpbmcgPSAodXNlci5wcm9maWxlICYmIHVzZXIucHJvZmlsZS5mdWxsX25hbWUpID8gKGdyZWV0VmFyICsgJyAnICsgdXNlci5wcm9maWxlLmZ1bGxfbmFtZSArIFwiLFwiKSA6IGdyZWV0VmFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgU1NSLmNvbXBpbGVUZW1wbGF0ZSgnY2hlY2tNZWRhbHNFbWFpbEh0bWwnLCBBc3NldHMuZ2V0VGV4dCgnY2hlY2stbWVkYWxzLWVtYWlsLmh0bWwnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbWFpbERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JlZXRpbmc6IGdyZWV0aW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWluZGVyTXNnVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlbWluZGVyQ3VycmVudE1lZGFsczEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50TmFtZTogZXN0YWJsaXNobWVudDIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJDdXJyZW50TWVkYWxzMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNZWRhbHM6IGVzdGFibGlzaG1lbnRQb2ludC5jdXJyZW50X3BvaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjM6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJDdXJyZW50TWVkYWxzMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWluZGVyTXNnVmFyNDogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdyZW1pbmRlckN1cnJlbnRNZWRhbHM0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnYXJkVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlZ2FyZFZhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbGxvd01zZ1ZhcjogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdmb2xsb3dNc2dWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdXJlc3RVcmw6IGl1cmVzdF91cmwudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFjZWJvb2tMaW5rOiBmYWNlYm9vay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTGluazogdHdpdHRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWdyYW1MaW5rOiBpbnN0YWdyYW0udmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXVyZXN0SW1nVmFyOiBpdXJlc3RJbWdWYXIudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIEVtYWlsLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiB1c2VyLmVtYWlsc1swXS5hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IHBhcmFtZXRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0OiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2NoZWNrTWVkYWxzU3ViamVjdFZhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6IFNTUi5yZW5kZXIoJ2NoZWNrTWVkYWxzRW1haWxIdG1sJywgZW1haWxEYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gZXZhbHVhdGVzIGRlIHRoZSBjdXJyZW50IG1lZGFscyBmb3Igc2VuZCB3YXJuaW5nIHRvIHVzZXIgZXZlcnkgdHdvIGRheXNcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrTmVnYXRpdmVNZWRhbHM6IGZ1bmN0aW9uIChfY291bnRyeUlkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2Zyb21fZW1haWwnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdF91cmw6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2l1cmVzdF91cmwnIH0pO1xuICAgICAgICAgICAgbGV0IGZhY2Vib29rOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmYWNlYm9va19saW5rJyB9KTtcbiAgICAgICAgICAgIGxldCB0d2l0dGVyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICd0d2l0dGVyX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGluc3RhZ3JhbTogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaW5zdGFncmFtX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdEltZ1ZhcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X2ltZ191cmwnIH0pO1xuICAgICAgICAgICAgbGV0IG1heF9kYXlzOiBudW1iZXIgPSBwYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdtYXhfZGF5c190b19hZHZpY2UnIH0pLnZhbHVlKTtcbiAgICAgICAgICAgIGxldCBlc3RhYmxpc2htZW50c0FycmF5OiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjb3VudHJ5SWQ6IF9jb3VudHJ5SWQsIGlzX2JldGFfdGVzdGVyOiBmYWxzZSwgaXNBY3RpdmU6IHRydWUgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudHNBcnJheS5wdXNoKGVzdGFibGlzaG1lbnQuX2lkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50UG9pbnRzLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IHsgJGluOiBlc3RhYmxpc2htZW50c0FycmF5IH0sIG5lZ2F0aXZlX2JhbGFuY2U6IHRydWUsIG5lZ2F0aXZlX2FkdmljZV9jb3VudGVyOiB7ICRndGU6IDAgfSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50UG9pbnQ+KGVzdGFibGlzaG1lbnRQb2ludCwgaW5kZXgsIGFyKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgYWR2aWNlX2F1eDogbnVtYmVyID0gZXN0YWJsaXNobWVudFBvaW50Lm5lZ2F0aXZlX2FkdmljZV9jb3VudGVyICsgMTtcbiAgICAgICAgICAgICAgICBpZiAoZXN0YWJsaXNobWVudFBvaW50Lm5lZ2F0aXZlX2FkdmljZV9jb3VudGVyIDw9IG1heF9kYXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRQb2ludHMuY29sbGVjdGlvbi51cGRhdGUoeyBfaWQ6IGVzdGFibGlzaG1lbnRQb2ludC5faWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lZ2F0aXZlX2FkdmljZV9jb3VudGVyOiBlc3RhYmxpc2htZW50UG9pbnQubmVnYXRpdmVfYWR2aWNlX2NvdW50ZXIgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IF9pZDogZXN0YWJsaXNobWVudFBvaW50LmVzdGFibGlzaG1lbnRfaWQgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudDIsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVzZXI6IFVzZXIgPSBVc2Vycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnQyLmNyZWF0aW9uX3VzZXIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQgPSBFbWFpbENvbnRlbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IGxhbmd1YWdlOiB1c2VyLnByb2ZpbGUubGFuZ3VhZ2VfY29kZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBncmVldFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnZ3JlZXRWYXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBncmVldGluZzogc3RyaW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUuZnVsbF9uYW1lKSA/IChncmVldFZhciArICcgJyArIHVzZXIucHJvZmlsZS5mdWxsX25hbWUgKyBcIixcIikgOiBncmVldFZhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNTUi5jb21waWxlVGVtcGxhdGUoJ2NoZWNrTmVnYXRpdmVFbWFpbEh0bWwnLCBBc3NldHMuZ2V0VGV4dCgnY2hlY2stbmVnYXRpdmUtZW1haWwuaHRtbCcpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVtYWlsRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmVldGluZzogZ3JlZXRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtaW5kZXJNc2dWYXI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50TmFtZTogZXN0YWJsaXNobWVudDIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TWVkYWxzOiBlc3RhYmxpc2htZW50UG9pbnQuY3VycmVudF9wb2ludHMgKiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjM6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjQ6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdhcmRWYXI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVnYXJkVmFyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9sbG93TXNnVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2ZvbGxvd01zZ1ZhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl1cmVzdFVybDogaXVyZXN0X3VybC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWNlYm9va0xpbms6IGZhY2Vib29rLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR3aXR0ZXJMaW5rOiB0d2l0dGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhZ3JhbUxpbms6IGluc3RhZ3JhbS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdXJlc3RJbWdWYXI6IGl1cmVzdEltZ1Zhci52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgRW1haWwuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IHVzZXIuZW1haWxzWzBdLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogcGFyYW1ldGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3Q6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnY2hlY2tOZWdhdGl2ZVN1YmplY3RWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sOiBTU1IucmVuZGVyKCdjaGVja05lZ2F0aXZlRW1haWxIdG1sJywgZW1haWxEYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogZXN0YWJsaXNobWVudFBvaW50LmVzdGFibGlzaG1lbnRfaWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gZ2V0cyB0aGUgdmFsdWUgZnJvbSBFbWFpbENvbnRlbnQgY29sbGVjdGlvblxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gX2NvdW50cnlJZFxuICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRFbWFpbENvbnRlbnQoX2xhbmdEaWN0aW9uYXJ5OiBMYW5nRGljdGlvbmFyeVtdLCBfbGFiZWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBfbGFuZ0RpY3Rpb25hcnkuZmlsdGVyKGZ1bmN0aW9uICh3b3JkVHJhZHVjZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29yZFRyYWR1Y2VkLmxhYmVsID09IF9sYWJlbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlWzBdLnRyYWR1Y3Rpb247XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGNvbnZlcnQgdGhlIGRheSBhbmQgcmV0dXJuaW5nIGluIGZvcm1hdCB5eXl5LW0tZFxuICAgICAgICAgKiBAcGFyYW0ge0RhdGV9IF9kYXRlXG4gICAgICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIGNvbnZlcnREYXRlVG9TaW1wbGU6IGZ1bmN0aW9uIChfZGF0ZTogRGF0ZSkge1xuICAgICAgICAgICAgbGV0IHllYXIgPSBfZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgbGV0IG1vbnRoID0gX2RhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgICAgICBsZXQgZGF5ID0gX2RhdGUuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGRheS50b1N0cmluZygpICsgJy8nICsgbW9udGgudG9TdHJpbmcoKSArICcvJyArIHllYXIudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUGF5bWVudHNIaXN0b3J5IH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL2NvdW50cnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBJbnZvaWNlc0luZm8gfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wYXltZW50L2ludm9pY2VzLWluZm8uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDeWdJbnZvaWNlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BheW1lbnQvY3lnLWludm9pY2VzLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ29tcGFueUluZm8sIENsaWVudEluZm8sIEVzdGFibGlzaG1lbnRJbmZvIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BheW1lbnQvY3lnLWludm9pY2UubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBCYWdQbGFucyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9iYWctcGxhbnMuY29sbGVjdGlvbic7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFsbG93IGdlbmVyYXRlIGl1cmVzdCBpbnZvaWNlIGZvciBhZG1pbiBlc3RhYmxpc2htZW50XG4gICAgICAgICAqIEBwYXJhbSB7IHN0cmluZyB9IF9wYXltZW50SGlzdG9yeUlkXG4gICAgICAgICAqIEBwYXJhbSB7IHN0cmluZyB9IF91c2VySWQgXG4gICAgICAgICAqL1xuICAgICAgICBnZW5lcmF0ZUludm9pY2VJbmZvOiBmdW5jdGlvbiAoX3BheW1lbnRIaXN0b3J5SWQ6IHN0cmluZywgX3VzZXJJZDogc3RyaW5nKSB7XG5cbiAgICAgICAgICAgIGxldCBfY3VycmVudERhdGU6IERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgbGV0IF9maXJzdE1vbnRoRGF5OiBEYXRlID0gbmV3IERhdGUoX2N1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCksIF9jdXJyZW50RGF0ZS5nZXRNb250aCgpLCAxKTtcbiAgICAgICAgICAgIGxldCBfbGFzdE1vbnRoRGF5OiBEYXRlID0gbmV3IERhdGUoX2N1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCksIF9jdXJyZW50RGF0ZS5nZXRNb250aCgpICsgMSwgMCk7XG5cbiAgICAgICAgICAgIGxldCBsVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuICAgICAgICAgICAgbGV0IGxDb3VudHJ5ID0gQ291bnRyaWVzLmZpbmRPbmUoeyBfaWQ6IGxVc2VyRGV0YWlsLmNvdW50cnlfaWQgfSk7XG4gICAgICAgICAgICBsZXQgbFBheW1lbnRIaXN0b3J5ID0gUGF5bWVudHNIaXN0b3J5LmZpbmRPbmUoeyBfaWQ6IF9wYXltZW50SGlzdG9yeUlkIH0pO1xuICAgICAgICAgICAgbGV0IGludm9pY2VJbmZvID0gSW52b2ljZXNJbmZvLmZpbmRPbmUoeyBjb3VudHJ5X2lkOiBsQ291bnRyeS5faWQgfSk7XG5cbiAgICAgICAgICAgIGxldCB2YXJfcmVzb2x1dGlvbjogc3RyaW5nO1xuICAgICAgICAgICAgbGV0IHZhcl9wcmVmaXg6IHN0cmluZztcbiAgICAgICAgICAgIGxldCB2YXJfc3RhcnRfdmFsdWU6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCB2YXJfY3VycmVudF92YWx1ZTogbnVtYmVyO1xuICAgICAgICAgICAgbGV0IHZhcl9lbmRfdmFsdWU6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCB2YXJfc3RhcnRfZGF0ZTogRGF0ZTtcbiAgICAgICAgICAgIGxldCB2YXJfZW5kX2RhdGU6IERhdGU7XG4gICAgICAgICAgICBsZXQgdmFyX2VuYWJsZV90d286IGJvb2xlYW47XG4gICAgICAgICAgICBsZXQgdmFyX3N0YXJ0X25ldzogYm9vbGVhbjtcblxuICAgICAgICAgICAgbGV0IGNvbXBhbnlfbmFtZSA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X25hbWUnIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfYWRkcmVzcyA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2FkZHJlc3MnIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfcGhvbmUgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9waG9uZScgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9jb3VudHJ5ID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfY291bnRyeScgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9jaXR5ID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfY2l0eScgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9uaXQgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9uaXQnIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfcmVnaW1lID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfcmVnaW1lJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X2NvbnRyaWJ1dGlvbiA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2NvbnRyaWJ1dGlvbicgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9yZXRhaW5lciA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X3JldGFpbmVyJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X2FnZW50X3JldGFpbmVyID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfYWdlbnRfcmV0YWluZXInIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGludm9pY2VfZ2VuZXJhdGVkX21zZyA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdpbnZvaWNlX2dlbmVyYXRlZF9tc2cnIH0pLnZhbHVlO1xuXG4gICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudHNJbmZvQXJyYXk6IEVzdGFibGlzaG1lbnRJbmZvW10gPSBbXTtcblxuICAgICAgICAgICAgLy9HZW5lcmF0ZSBjb25zZWN1dGl2ZVxuICAgICAgICAgICAgaWYgKGludm9pY2VJbmZvLmVuYWJsZV90d28gPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW52b2ljZUluZm8uc3RhcnRfbmV3X3ZhbHVlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyX2N1cnJlbnRfdmFsdWUgPSBpbnZvaWNlSW5mby5zdGFydF92YWx1ZV9vbmU7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9lbmFibGVfdHdvID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXJfY3VycmVudF92YWx1ZSA9IGludm9pY2VJbmZvLmN1cnJlbnRfdmFsdWUgKyAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFyX2N1cnJlbnRfdmFsdWUgPT0gaW52b2ljZUluZm8uZW5kX3ZhbHVlX29uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX2VuYWJsZV90d28gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX3N0YXJ0X25ldyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJfZW5hYmxlX3R3byA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX3N0YXJ0X25ldyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhcl9yZXNvbHV0aW9uID0gaW52b2ljZUluZm8ucmVzb2x1dGlvbl9vbmU7XG4gICAgICAgICAgICAgICAgdmFyX3ByZWZpeCA9IGludm9pY2VJbmZvLnByZWZpeF9vbmU7XG4gICAgICAgICAgICAgICAgdmFyX3N0YXJ0X3ZhbHVlID0gaW52b2ljZUluZm8uc3RhcnRfdmFsdWVfb25lO1xuICAgICAgICAgICAgICAgIHZhcl9lbmRfdmFsdWUgPSBpbnZvaWNlSW5mby5lbmRfdmFsdWVfb25lO1xuICAgICAgICAgICAgICAgIHZhcl9zdGFydF9kYXRlID0gaW52b2ljZUluZm8uc3RhcnRfZGF0ZV9vbmU7XG4gICAgICAgICAgICAgICAgdmFyX2VuZF9kYXRlID0gaW52b2ljZUluZm8uZW5kX2RhdGVfb25lO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaW52b2ljZUluZm8uc3RhcnRfbmV3X3ZhbHVlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyX2N1cnJlbnRfdmFsdWUgPSBpbnZvaWNlSW5mby5zdGFydF92YWx1ZV90d287XG4gICAgICAgICAgICAgICAgICAgIHZhcl9lbmFibGVfdHdvID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyX3N0YXJ0X25ldyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9jdXJyZW50X3ZhbHVlID0gaW52b2ljZUluZm8uY3VycmVudF92YWx1ZSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YXJfY3VycmVudF92YWx1ZSA9PSBpbnZvaWNlSW5mby5lbmRfdmFsdWVfdHdvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJfZW5hYmxlX3R3byA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX3N0YXJ0X25ldyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJfZW5hYmxlX3R3byA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJfc3RhcnRfbmV3ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyX3Jlc29sdXRpb24gPSBpbnZvaWNlSW5mby5yZXNvbHV0aW9uX3R3bztcbiAgICAgICAgICAgICAgICB2YXJfcHJlZml4ID0gaW52b2ljZUluZm8ucHJlZml4X3R3bztcbiAgICAgICAgICAgICAgICB2YXJfc3RhcnRfdmFsdWUgPSBpbnZvaWNlSW5mby5zdGFydF92YWx1ZV90d287XG4gICAgICAgICAgICAgICAgdmFyX2VuZF92YWx1ZSA9IGludm9pY2VJbmZvLmVuZF92YWx1ZV90d287XG4gICAgICAgICAgICAgICAgdmFyX3N0YXJ0X2RhdGUgPSBpbnZvaWNlSW5mby5zdGFydF9kYXRlX3R3bztcbiAgICAgICAgICAgICAgICB2YXJfZW5kX2RhdGUgPSBpbnZvaWNlSW5mby5lbmRfZGF0ZV90d287XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEludm9pY2VzSW5mby5jb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogaW52b2ljZUluZm8uX2lkIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X3ZhbHVlOiB2YXJfY3VycmVudF92YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZV90d286IHZhcl9lbmFibGVfdHdvLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRfbmV3X3ZhbHVlOiB2YXJfc3RhcnRfbmV3XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGNvbXBhbnlfaW5mbzogQ29tcGFueUluZm8gPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogY29tcGFueV9uYW1lLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IGNvbXBhbnlfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBwaG9uZTogY29tcGFueV9waG9uZSxcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiBjb21wYW55X2NvdW50cnksXG4gICAgICAgICAgICAgICAgY2l0eTogY29tcGFueV9jaXR5LFxuICAgICAgICAgICAgICAgIG5pdDogY29tcGFueV9uaXQsXG4gICAgICAgICAgICAgICAgcmVnaW1lOiBjb21wYW55X3JlZ2ltZSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb246IGNvbXBhbnlfY29udHJpYnV0aW9uLFxuICAgICAgICAgICAgICAgIHJldGFpbmVyOiBjb21wYW55X3JldGFpbmVyLFxuICAgICAgICAgICAgICAgIGFnZW50X3JldGFpbnRlcjogY29tcGFueV9hZ2VudF9yZXRhaW5lcixcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uX251bWJlcjogdmFyX3Jlc29sdXRpb24sXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9wcmVmaXg6IHZhcl9wcmVmaXgsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9zdGFydF9kYXRlOiB2YXJfc3RhcnRfZGF0ZSxcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uX2VuZF9kYXRlOiB2YXJfZW5kX2RhdGUsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9zdGFydF92YWx1ZTogdmFyX3N0YXJ0X3ZhbHVlLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9lbmRfdmFsdWU6IHZhcl9lbmRfdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IGNsaWVudF9pbmZvOiBDbGllbnRJbmZvID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IE1ldGVvci51c2VyKCkucHJvZmlsZS5mdWxsX25hbWUsXG4gICAgICAgICAgICAgICAgYWRkcmVzczogbFVzZXJEZXRhaWwuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiBsQ291bnRyeS5uYW1lLFxuICAgICAgICAgICAgICAgIGNpdHk6IGxVc2VyRGV0YWlsLmNpdHlfaWQsXG4gICAgICAgICAgICAgICAgaWRlbnRpZmljYXRpb246IGxVc2VyRGV0YWlsLmRuaV9udW1iZXIsXG4gICAgICAgICAgICAgICAgcGhvbmU6IGxVc2VyRGV0YWlsLmNvbnRhY3RfcGhvbmUsXG4gICAgICAgICAgICAgICAgZW1haWw6IE1ldGVvci51c2VyKCkuZW1haWxzWzBdLmFkZHJlc3NcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxQYXltZW50SGlzdG9yeS5lc3RhYmxpc2htZW50X2lkcy5mb3JFYWNoKChlc3RhYmxpc2htZW50RWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBlc3RhYmxpc2htZW50SW5mbzogRXN0YWJsaXNobWVudEluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfbmFtZTogRXN0YWJsaXNobWVudHMuZmluZE9uZSh7IF9pZDogZXN0YWJsaXNobWVudEVsZW1lbnQuZXN0YWJsaXNobWVudElkIH0pLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGJhZ19wbGFuX25hbWU6IEJhZ1BsYW5zLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnRFbGVtZW50LmJhZ1BsYW5JZCB9KS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBiYWdfcGxhbl9jdXJyZW5jeTogZXN0YWJsaXNobWVudEVsZW1lbnQuYmFnUGxhbkN1cnJlbmN5LFxuICAgICAgICAgICAgICAgICAgICBiYWdfcGxhbl9wb2ludHM6IGVzdGFibGlzaG1lbnRFbGVtZW50LmJhZ1BsYW5Qb2ludHMudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgYmFnX3BsYW5fcHJpY2U6IGVzdGFibGlzaG1lbnRFbGVtZW50LmJhZ1BsYW5QcmljZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBjcmVkaXRfcG9pbnRzOiBlc3RhYmxpc2htZW50RWxlbWVudC5jcmVkaXRQb2ludHMudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0X3ByaWNlOiBlc3RhYmxpc2htZW50RWxlbWVudC5jcmVkaXRQcmljZS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50c0luZm9BcnJheS5wdXNoKGVzdGFibGlzaG1lbnRJbmZvKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBDeWdJbnZvaWNlcy5jb2xsZWN0aW9uLmluc2VydCh7XG4gICAgICAgICAgICAgICAgY3JlYXRpb25fdXNlcjogTWV0ZW9yLnVzZXJJZCgpLFxuICAgICAgICAgICAgICAgIGNyZWF0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgcGF5bWVudF9oaXN0b3J5X2lkOiBsUGF5bWVudEhpc3RvcnkuX2lkLFxuICAgICAgICAgICAgICAgIGNvdW50cnlfaWQ6IGxDb3VudHJ5Ll9pZCxcbiAgICAgICAgICAgICAgICBudW1iZXI6IHZhcl9jdXJyZW50X3ZhbHVlLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIHBheW1lbnRfbWV0aG9kOiAnUkVTX1BBWU1FTlRfSElTVE9SWS5DQ19QQVlNRU5UX01FVEhPRCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSRVNfUEFZTUVOVF9ISVNUT1JZLkRFU0NSSVBUSU9OJyxcbiAgICAgICAgICAgICAgICBwZXJpb2Q6IF9maXJzdE1vbnRoRGF5LmdldERhdGUoKSArICcvJyArIChfZmlyc3RNb250aERheS5nZXRNb250aCgpICsgMSkgKyAnLycgKyBfZmlyc3RNb250aERheS5nZXRGdWxsWWVhcigpICtcbiAgICAgICAgICAgICAgICAgICAgJyAtICcgKyBfbGFzdE1vbnRoRGF5LmdldERhdGUoKSArICcvJyArIChfbGFzdE1vbnRoRGF5LmdldE1vbnRoKCkgKyAxKSArICcvJyArIF9sYXN0TW9udGhEYXkuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgICAgICAgICBhbW91bnRfbm9faXZhOiBNZXRlb3IuY2FsbCgnZ2V0UmV0dXJuQmFzZScsIGxQYXltZW50SGlzdG9yeS5wYXltZW50VmFsdWUpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgc3VidG90YWw6IFwiMFwiLFxuICAgICAgICAgICAgICAgIGl2YTogXCIwXCIsXG4gICAgICAgICAgICAgICAgdG90YWw6IGxQYXltZW50SGlzdG9yeS5wYXltZW50VmFsdWUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBjdXJyZW5jeTogbFBheW1lbnRIaXN0b3J5LmN1cnJlbmN5LFxuICAgICAgICAgICAgICAgIGNvbXBhbnlfaW5mbzogY29tcGFueV9pbmZvLFxuICAgICAgICAgICAgICAgIGNsaWVudF9pbmZvOiBjbGllbnRfaW5mbyxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZWRfY29tcHV0ZXJfbXNnOiBpbnZvaWNlX2dlbmVyYXRlZF9tc2csXG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudHNJbmZvOiBlc3RhYmxpc2htZW50c0luZm9BcnJheVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAqIFRoaXMgZnVuY3Rpb24gZ2V0cyB0aGUgdGF4IHZhbHVlIGFjY29yZGluZyB0byB0aGUgdmFsdWVcbiAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gX3BheW1lbnRWYWx1ZVxuICAgICAgICAqL1xuICAgICAgICBnZXRWYWx1ZVRheDogZnVuY3Rpb24gKF9wYXltZW50VmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgICAgICBsZXQgcGFyYW1ldGVyVGF4ID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbG9tYmlhX3RheF9pdmEnIH0pO1xuICAgICAgICAgICAgbGV0IHBlcmNlbnRWYWx1ZSA9IE51bWJlcihwYXJhbWV0ZXJUYXgudmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIChfcGF5bWVudFZhbHVlICogcGVyY2VudFZhbHVlKSAvIDEwMDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICogVGhpcyBmdW5jdGlvbiBnZXRzIHRoZSB0YXggdmFsdWUgYWNjb3JkaW5nIHRvIHRoZSB2YWx1ZVxuICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBfcGF5bWVudFZhbHVlXG4gICAgICAgICovXG4gICAgICAgIGdldFJldHVybkJhc2U6IGZ1bmN0aW9uIChfcGF5bWVudFZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICAgICAgbGV0IGFtb3VudFBlcmNlbnQ6IG51bWJlciA9IE1ldGVvci5jYWxsKCdnZXRWYWx1ZVRheCcsIF9wYXltZW50VmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIF9wYXltZW50VmFsdWUgLSBhbW91bnRQZXJjZW50O1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBFbWFpbCB9IGZyb20gJ21ldGVvci9lbWFpbCc7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9lbWFpbC1jb250ZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWxDb250ZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvZW1haWwtY29udGVudC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFVzZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXIubW9kZWwnO1xuaW1wb3J0IHsgUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGFyYW1ldGVyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvcGFyYW1ldGVyLm1vZGVsJztcbmltcG9ydCB7IFNTUiB9IGZyb20gJ21ldGVvci9tZXRlb3JoYWNrczpzc3InO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiB2YWxpZGF0ZSBpZiBlc3RhYmxpc2htZW50IHRyaWFsIHBlcmlvZCBoYXMgZW5kZWRcbiAgICAgICAgICovXG4gICAgICAgIHZhbGlkYXRlVHJpYWxQZXJpb2Q6IGZ1bmN0aW9uIChfY291bnRyeUlkOiBzdHJpbmcpIHtcblxuICAgICAgICAgICAgdmFyIGN1cnJlbnREYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U3RyaW5nOiBzdHJpbmcgPSBNZXRlb3IuY2FsbCgnY29udmVydERhdGUnLCBjdXJyZW50RGF0ZSk7XG4gICAgICAgICAgICB2YXIgdHJpYWxEYXlzOiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAndHJpYWxfZGF5cycgfSkudmFsdWUpO1xuICAgICAgICAgICAgdmFyIGZpcnN0QWR2aWNlRGF5czogbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2ZpcnN0X2FkdmljZV9kYXlzJyB9KS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgc2Vjb25kQWR2aWNlRGF5czogbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ3NlY29uZF9hZHZpY2VfZGF5cycgfSkudmFsdWUpO1xuICAgICAgICAgICAgdmFyIHRoaXJkQWR2aWNlRGF5czogbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ3RoaXJkX2FkdmljZV9kYXlzJyB9KS52YWx1ZSk7XG5cbiAgICAgICAgICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IGNvdW50cnlJZDogX2NvdW50cnlJZCwgaXNBY3RpdmU6IHRydWUsIHRzdFBlcmlvZDogdHJ1ZSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50Pihlc3RhYmxpc2htZW50LCBpbmRleCwgYXIpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IE1hdGgucm91bmQoKGN1cnJlbnREYXRlLnZhbHVlT2YoKSAtIGVzdGFibGlzaG1lbnQuY3JlYXRpb25fZGF0ZS52YWx1ZU9mKCkpIC8gKDEwMDAgKiA2MCAqIDYwICogMjQpKTtcbiAgICAgICAgICAgICAgICBsZXQgZm9yd2FyZERhdGU6IERhdGUgPSBNZXRlb3IuY2FsbCgnYWRkRGF5cycsIGVzdGFibGlzaG1lbnQuY3JlYXRpb25fZGF0ZSwgdHJpYWxEYXlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZm9yd2FyZFN0cmluZzogc3RyaW5nID0gTWV0ZW9yLmNhbGwoJ2NvbnZlcnREYXRlJywgZm9yd2FyZERhdGUpO1xuICAgICAgICAgICAgICAgIGxldCBmaXJzdEFkdmljZURhdGU6IERhdGUgPSBNZXRlb3IuY2FsbCgnc3Vic3RyYWN0RGF5cycsIGZvcndhcmREYXRlLCBmaXJzdEFkdmljZURheXMpO1xuICAgICAgICAgICAgICAgIGxldCBmaXJzdEFkdmljZVN0cmluZzogc3RyaW5nID0gTWV0ZW9yLmNhbGwoJ2NvbnZlcnREYXRlJywgZmlyc3RBZHZpY2VEYXRlKTtcbiAgICAgICAgICAgICAgICBsZXQgc2Vjb25kQWR2aWNlRGF0ZTogRGF0ZSA9IE1ldGVvci5jYWxsKCdzdWJzdHJhY3REYXlzJywgZm9yd2FyZERhdGUsIHNlY29uZEFkdmljZURheXMpO1xuICAgICAgICAgICAgICAgIGxldCBzZWNvbmRBZHZpY2VTdHJpbmc6IHN0cmluZyA9IE1ldGVvci5jYWxsKCdjb252ZXJ0RGF0ZScsIHNlY29uZEFkdmljZURhdGUpO1xuICAgICAgICAgICAgICAgIGxldCB0aGlyZEFkdmljZURhdGU6IERhdGUgPSBNZXRlb3IuY2FsbCgnc3Vic3RyYWN0RGF5cycsIGZvcndhcmREYXRlLCB0aGlyZEFkdmljZURheXMpO1xuICAgICAgICAgICAgICAgIGxldCB0aGlyZEFkdmljZVN0cmluZzogc3RyaW5nID0gTWV0ZW9yLmNhbGwoJ2NvbnZlcnREYXRlJywgdGhpcmRBZHZpY2VEYXRlKTtcblxuICAgICAgICAgICAgICAgIGlmIChkaWZmID4gdHJpYWxEYXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24udXBkYXRlKHsgX2lkOiBlc3RhYmxpc2htZW50Ll9pZCB9LCB7ICRzZXQ6IHsgaXNBY3RpdmU6IGZhbHNlLCB0c3RQZXJpb2Q6IGZhbHNlIH0gfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFN0cmluZyA9PSBmaXJzdEFkdmljZVN0cmluZyB8fCBjdXJyZW50U3RyaW5nID09IHNlY29uZEFkdmljZVN0cmluZyB8fCBjdXJyZW50U3RyaW5nID09IHRoaXJkQWR2aWNlU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBNZXRlb3IuY2FsbCgnc2VuZFRyaWFsRW1haWwnLCBlc3RhYmxpc2htZW50LmNyZWF0aW9uX3VzZXIsIGZvcndhcmRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBcImVtYWlsU2VuZFwiO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBjb252ZXJ0IHRoZSBkYXkgYW5kIHJldHVybmluZyBpbiBmb3JtYXQgeXl5eS1tLWRcbiAgICAgICAgICovXG4gICAgICAgIGNvbnZlcnREYXRlOiBmdW5jdGlvbiAoX2RhdGU6IERhdGUpIHtcbiAgICAgICAgICAgIGxldCB5ZWFyID0gX2RhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIGxldCBtb250aCA9IF9kYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgbGV0IGRheSA9IF9kYXRlLmdldERhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHllYXIudG9TdHJpbmcoKSArICctJyArIG1vbnRoLnRvU3RyaW5nKCkgKyAnLScgKyBkYXkudG9TdHJpbmcoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gYWRkIGRheXMgdG8gdGhlIHBhc3NlZCBkYXRlXG4gICAgICAgICAqL1xuICAgICAgICBhZGREYXlzOiBmdW5jdGlvbiAoX2RhdGU6IERhdGUsIF9kYXlzOiBudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgRGF0ZShfZGF0ZSk7XG4gICAgICAgICAgICByZXN1bHQuc2V0RGF0ZShyZXN1bHQuZ2V0RGF0ZSgpICsgX2RheXMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gc3Vic3RyYWN0IGRheXMgdG8gdGhlIHBhc3NlZCBkYXRlXG4gICAgICAgICAqL1xuICAgICAgICBzdWJzdHJhY3REYXlzOiBmdW5jdGlvbiAoX2RhdGU6IERhdGUsIF9kYXlzOiBudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgRGF0ZShfZGF0ZSk7XG4gICAgICAgICAgICByZXN1bHQuc2V0RGF0ZShyZXN1bHQuZ2V0RGF0ZSgpIC0gX2RheXMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gc2VuZCBkZSBlbWFpbCB0byB0aGUgYWNjb3VudCBhZG1pbiByZWdpc3RlcmVkIGlmIHRyaWFsIHBlcmlvZCBpcyBnb2luZyB0byBlbmRcbiAgICAgICAgICovXG4gICAgICAgIHNlbmRUcmlhbEVtYWlsOiBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nLCBfZm9yd2FyZERhdGU6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IHVzZXI6IFVzZXIgPSBVc2Vycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IF91c2VySWQgfSk7XG4gICAgICAgICAgICBsZXQgcGFyYW1ldGVyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmcm9tX2VtYWlsJyB9KTtcbiAgICAgICAgICAgIGxldCBlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCA9IEVtYWlsQ29udGVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgbGFuZ3VhZ2U6IHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlIH0pO1xuICAgICAgICAgICAgdmFyIHRyaWFsX2VtYWlsX3N1YmplY3Q6IHN0cmluZyA9IGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnlbMF0udHJhZHVjdGlvbjtcbiAgICAgICAgICAgIHZhciBncmVldGluZzogc3RyaW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSkgPyAoZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeVsxXS50cmFkdWN0aW9uICsgJyAnICsgdXNlci5wcm9maWxlLmZpcnN0X25hbWUgKyBcIixcIikgOiBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5WzFdLnRyYWR1Y3Rpb247XG5cbiAgICAgICAgICAgIFNTUi5jb21waWxlVGVtcGxhdGUoJ2h0bWxFbWFpbCcsIEFzc2V0cy5nZXRUZXh0KCdodG1sLWVtYWlsLmh0bWwnKSk7XG5cbiAgICAgICAgICAgIHZhciBlbWFpbERhdGEgPSB7XG4gICAgICAgICAgICAgICAgZ3JlZXRpbmc6IGdyZWV0aW5nLFxuICAgICAgICAgICAgICAgIHJlbWluZGVyTXNnVmFyOiBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5WzddLnRyYWR1Y3Rpb24sXG4gICAgICAgICAgICAgICAgZGF0ZVZhcjogX2ZvcndhcmREYXRlLFxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9uTXNnVmFyOiBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5WzhdLnRyYWR1Y3Rpb24sXG4gICAgICAgICAgICAgICAgcmVnYXJkVmFyOiBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5WzVdLnRyYWR1Y3Rpb24sXG4gICAgICAgICAgICAgICAgZm9sbG93TXNnVmFyOiBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5WzZdLnRyYWR1Y3Rpb25cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgRW1haWwuc2VuZCh7XG4gICAgICAgICAgICAgICAgdG86IHVzZXIuZW1haWxzWzBdLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgZnJvbTogcGFyYW1ldGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgIHN1YmplY3Q6IHRyaWFsX2VtYWlsX3N1YmplY3QsXG4gICAgICAgICAgICAgICAgaHRtbDogU1NSLnJlbmRlcignaHRtbEVtYWlsJywgZW1haWxEYXRhKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBPbmVTaWduYWwgfSBmcm9tICdtZXRlb3IvYXN0cm9jb2RlcnM6b25lLXNpZ25hbCc7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyAoe1xuICAgICAgICBzZW5kUHVzaDogZnVuY3Rpb24gKCBfdXNlckRldmljZUlkIDogc3RyaW5nW10sIGNvbnRlbnQgOiBzdHJpbmcgKXtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgY29udGVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgZW46IGNvbnRlbnQsICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgT25lU2lnbmFsLk5vdGlmaWNhdGlvbnMuY3JlYXRlKCBfdXNlckRldmljZUlkLCBkYXRhICk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEl0ZW1zIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIE1ldGVvci5tZXRob2RzKHtcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byB1cGRhdGUgaXRlbSBhdmFpbGFibGUgZm9yIHN1cGVydmlzb3JcbiAgICAgKiBAcGFyYW0ge1VzZXJEZXRhaWx9IF91c2VyRGV0YWlsXG4gICAgICogQHBhcmFtIHtJdGVtfSBfaXRlbVxuICAgICAqL1xuICAgIHVwZGF0ZUl0ZW1BdmFpbGFibGU6IGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcsIF9pdGVtSWQ6IHN0cmluZykge1xuICAgICAgbGV0IF9pdGVtRXN0YWJsaXNobWVudCA9IEl0ZW1zLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2l0ZW1JZCB9LCB7IGZpZWxkczogeyBfaWQ6IDAsIGVzdGFibGlzaG1lbnRzOiAxIH0gfSk7XG4gICAgICBsZXQgYXV4ID0gX2l0ZW1Fc3RhYmxpc2htZW50LmVzdGFibGlzaG1lbnRzLmZpbmQoZWxlbWVudCA9PiBlbGVtZW50LmVzdGFibGlzaG1lbnRfaWQgPT09IF9lc3RhYmxpc2htZW50SWQpO1xuICAgICAgSXRlbXMudXBkYXRlKHsgX2lkOiBfaXRlbUlkLCBcImVzdGFibGlzaG1lbnRzLmVzdGFibGlzaG1lbnRfaWRcIjogX2VzdGFibGlzaG1lbnRJZCB9LCB7ICRzZXQ6IHsgJ2VzdGFibGlzaG1lbnRzLiQuaXNBdmFpbGFibGUnOiAhYXV4LmlzQXZhaWxhYmxlLCBtb2RpZmljYXRpb25fZGF0ZTogbmV3IERhdGUoKSwgbW9kaWZpY2F0aW9uX3VzZXI6IE1ldGVvci51c2VySWQoKSB9IH0pO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gdXBkYXRlIGl0ZW0gcmVjb21tZW5kZWRcbiAgICAgKiBAcGFyYW0ge1VzZXJEZXRhaWx9IF91c2VyRGV0YWlsXG4gICAgICogQHBhcmFtIHtJdGVtfSBfaXRlbVxuICAgICAqL1xuICAgIHVwZGF0ZVJlY29tbWVuZGVkOiBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nLCBfaXRlbUlkOiBzdHJpbmcpIHtcbiAgICAgIGxldCBfaXRlbUVzdGFibGlzaG1lbnQgPSBJdGVtcy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IF9pdGVtSWQgfSwgeyBmaWVsZHM6IHsgX2lkOiAwLCBlc3RhYmxpc2htZW50czogMSB9IH0pO1xuICAgICAgbGV0IGF1eCA9IF9pdGVtRXN0YWJsaXNobWVudC5lc3RhYmxpc2htZW50cy5maW5kKGVsZW1lbnQgPT4gZWxlbWVudC5lc3RhYmxpc2htZW50X2lkID09PSBfZXN0YWJsaXNobWVudElkKTtcbiAgICAgIEl0ZW1zLnVwZGF0ZSh7IF9pZDogX2l0ZW1JZCwgXCJlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkXCI6IF9lc3RhYmxpc2htZW50SWQgfSwgeyAkc2V0OiB7ICdlc3RhYmxpc2htZW50cy4kLnJlY29tbWVuZGVkJzogIWF1eC5yZWNvbW1lbmRlZCwgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksIG1vZGlmaWNhdGlvbl91c2VyOiBNZXRlb3IudXNlcklkKCkgfSB9KTtcbiAgICB9XG4gIH0pXG59XG5cblxuXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJld2FyZEhpc3RvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL3Jld2FyZC1oaXN0b3J5Lm1vZGVsJztcbmltcG9ydCB7IFJld2FyZEhpc3RvcmllcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9yZXdhcmQtaGlzdG9yeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSXRlbSB9IGZyb20gJy4uLy4uL21vZGVscy9tZW51L2l0ZW0ubW9kZWwnO1xuaW1wb3J0IHsgSXRlbXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9tZW51L2l0ZW0uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSZXdhcmQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9yZXdhcmQubW9kZWwnO1xuaW1wb3J0IHsgUmV3YXJkcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudE1lZGFsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRNZWRhbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFJld2FyZENvbmZpcm1hdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbi5tb2RlbCc7XG5pbXBvcnQgeyBSZXdhcmRzQ29uZmlybWF0aW9ucyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9yZXdhcmQtY29uZmlybWF0aW9uLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9lc3RhYmxpc2htZW50LXBvaW50Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRQb2ludHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludHMuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBOZWdhdGl2ZVBvaW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9uZWdhdGl2ZS1wb2ludHMuY29sbGVjdGlvbic7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0b24gYWxsb3cgZ2VuZXJhdGUgcmV3YXJkIGhpc3RvcnlcbiAgICAgICAgICogQHBhcmFtIHtSZXdhcmRDb25maXJtYXRpb259IF9wUmV3YXJkQ29uZmlybWF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBnZW5lcmF0ZVJld2FyZEhpc3Rvcnk6IGZ1bmN0aW9uIChfcFJld2FyZENvbmZpcm1hdGlvbjogUmV3YXJkQ29uZmlybWF0aW9uKSB7XG4gICAgICAgICAgICBsZXQgX2xFc3RhYmxpc2htZW50OiBFc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuZmluZE9uZSh7IF9pZDogX3BSZXdhcmRDb25maXJtYXRpb24uZXN0YWJsaXNobWVudF9pZCB9KTtcbiAgICAgICAgICAgIGxldCBfbFJld2FyZDogUmV3YXJkID0gUmV3YXJkcy5maW5kT25lKHsgX2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi5yZXdhcmRfaWQgfSk7XG4gICAgICAgICAgICBsZXQgX2xJdGVtOiBJdGVtID0gSXRlbXMuZmluZE9uZSh7IF9pZDogX2xSZXdhcmQuaXRlbV9pZCB9KTtcblxuICAgICAgICAgICAgUmV3YXJkSGlzdG9yaWVzLmluc2VydCh7XG4gICAgICAgICAgICAgICAgY3JlYXRpb25fdXNlcjogX3BSZXdhcmRDb25maXJtYXRpb24udXNlcl9pZCxcbiAgICAgICAgICAgICAgICBjcmVhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfaWQ6IF9sRXN0YWJsaXNobWVudC5faWQsXG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudF9uYW1lOiBfbEVzdGFibGlzaG1lbnQubmFtZSxcbiAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50X2FkZHJlc3M6IF9sRXN0YWJsaXNobWVudC5hZGRyZXNzLFxuICAgICAgICAgICAgICAgIGl0ZW1fbmFtZTogX2xJdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgaXRlbV9xdWFudGl0eTogX2xSZXdhcmQuaXRlbV9xdWFudGl0eSxcbiAgICAgICAgICAgICAgICByZWRlZW1lZF9tZWRhbHM6IF9wUmV3YXJkQ29uZmlybWF0aW9uLm1lZGFsc190b19yZWRlZW1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGdW5jdGlvbiB0byByZWRlZW0gdXNlciBtZWRhbHNcbiAgICAgICAgICogQHBhcmFtIHtSZXdhcmRDb25maXJtYXRpb259IF9wUmV3YXJkQ29uZmlybWF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICByZWRlZW1Vc2VyTWVkYWxzOiBmdW5jdGlvbiAoX3BSZXdhcmRDb25maXJtYXRpb246IFJld2FyZENvbmZpcm1hdGlvbikge1xuICAgICAgICAgICAgbGV0IF9lc3RhYmxpc2htZW50UG9pbnRzOiBFc3RhYmxpc2htZW50UG9pbnQgPSBFc3RhYmxpc2htZW50UG9pbnRzLmZpbmRPbmUoeyBlc3RhYmxpc2htZW50X2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi5lc3RhYmxpc2htZW50X2lkIH0pO1xuICAgICAgICAgICAgbGV0IF9wb2ludHNSZXN1bHQ6IG51bWJlciA9IE51bWJlci5wYXJzZUludChfZXN0YWJsaXNobWVudFBvaW50cy5jdXJyZW50X3BvaW50cy50b1N0cmluZygpKSAtIE51bWJlci5wYXJzZUludChfcFJld2FyZENvbmZpcm1hdGlvbi5tZWRhbHNfdG9fcmVkZWVtLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgbGV0IF9sRXN0YWJsaXNobWVudE1lZGFsOiBFc3RhYmxpc2htZW50TWVkYWwgPSBFc3RhYmxpc2htZW50TWVkYWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi51c2VyX2lkLCBlc3RhYmxpc2htZW50X2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi5lc3RhYmxpc2htZW50X2lkIH0pO1xuXG4gICAgICAgICAgICBpZiAoX3BvaW50c1Jlc3VsdCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudFBvaW50cy51cGRhdGUoeyBfaWQ6IF9lc3RhYmxpc2htZW50UG9pbnRzLl9pZCB9LCB7ICRzZXQ6IHsgY3VycmVudF9wb2ludHM6IF9wb2ludHNSZXN1bHQgfSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IF9uZWdhdGl2ZVBvaW50czogbnVtYmVyO1xuICAgICAgICAgICAgICAgIGlmIChfZXN0YWJsaXNobWVudFBvaW50cy5jdXJyZW50X3BvaW50cyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgX25lZ2F0aXZlUG9pbnRzID0gTnVtYmVyLnBhcnNlSW50KF9wUmV3YXJkQ29uZmlybWF0aW9uLm1lZGFsc190b19yZWRlZW0udG9TdHJpbmcoKSkgLSBOdW1iZXIucGFyc2VJbnQoX2VzdGFibGlzaG1lbnRQb2ludHMuY3VycmVudF9wb2ludHMudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfbmVnYXRpdmVQb2ludHMgPCAwKSB7IF9uZWdhdGl2ZVBvaW50cyA9IChfbmVnYXRpdmVQb2ludHMgKiAoLTEpKTsgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9uZWdhdGl2ZVBvaW50cyA9IE51bWJlci5wYXJzZUludChfcFJld2FyZENvbmZpcm1hdGlvbi5tZWRhbHNfdG9fcmVkZWVtLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBOZWdhdGl2ZVBvaW50cy5pbnNlcnQoe1xuICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50X2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi5lc3RhYmxpc2htZW50X2lkLFxuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICBwb2ludHM6IF9uZWdhdGl2ZVBvaW50cyxcbiAgICAgICAgICAgICAgICAgICAgcGFpZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50UG9pbnRzLnVwZGF0ZSh7IF9pZDogX2VzdGFibGlzaG1lbnRQb2ludHMuX2lkIH0sIHsgJHNldDogeyBjdXJyZW50X3BvaW50czogX3BvaW50c1Jlc3VsdCwgbmVnYXRpdmVfYmFsYW5jZTogdHJ1ZSB9IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgX2xOZXdNZWRhbHM6IG51bWJlciA9IE51bWJlci5wYXJzZUludChfbEVzdGFibGlzaG1lbnRNZWRhbC5tZWRhbHMudG9TdHJpbmcoKSkgLSBOdW1iZXIucGFyc2VJbnQoX3BSZXdhcmRDb25maXJtYXRpb24ubWVkYWxzX3RvX3JlZGVlbS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMudXBkYXRlKHsgX2lkOiBfbEVzdGFibGlzaG1lbnRNZWRhbC5faWQgfSwge1xuICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX3VzZXI6IF9sRXN0YWJsaXNobWVudE1lZGFsLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWNhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IF9sTmV3TWVkYWxzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNZXRlb3IuY2FsbCgnZ2VuZXJhdGVSZXdhcmRIaXN0b3J5JywgX3BSZXdhcmRDb25maXJtYXRpb24pO1xuICAgICAgICAgICAgUmV3YXJkc0NvbmZpcm1hdGlvbnMudXBkYXRlKHsgX2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi5faWQgfSwge1xuICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX3VzZXI6IF9sRXN0YWJsaXNobWVudE1lZGFsLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWNhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICBpc19jb25maXJtZWQ6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFVzZXJEZXZpY2UgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC9kZXZpY2UubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgVXNlckRldmljZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248VXNlckRldmljZT4oJ3VzZXJfZGV2aWNlcycpO1xuXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cblVzZXJEZXZpY2VzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJbixcbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1lbnUgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC9tZW51Lm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IE1lbnVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPE1lbnU+KCdtZW51cycpO1xuIiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgUm9sZSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3JvbGUubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgUm9sZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248Um9sZT4oJ3JvbGVzJyk7XG4iLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgVXNlckRldGFpbHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248VXNlckRldGFpbD4oJ3VzZXJfZGV0YWlscycpO1xuXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cblVzZXJEZXRhaWxzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJbixcbn0pO1xuIiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlwqB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvcsKgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJMb2dpbiB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItbG9naW4ubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBVc2VyIExvZ2luIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFVzZXJzTG9naW4gPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248VXNlckxvZ2luPigndXNlcnNfbG9naW4nKTtcblxuVXNlcnNMb2dpbi5hbGxvdyh7XG4gICAgaW5zZXJ0OmxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlclBlbmFsdHkgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLXBlbmFsdHkubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBVc2VyIFBlbmFsdGllcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBVc2VyUGVuYWx0aWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFVzZXJQZW5hbHR5PigndXNlcl9wZW5hbHRpZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBVc2VyIFBlbmFsdGllcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Vc2VyUGVuYWx0aWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pO1xuIiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFVzZXJzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFVzZXJzID0gTW9uZ29PYnNlcnZhYmxlLmZyb21FeGlzdGluZyhNZXRlb3IudXNlcnMpO1xuXG4vKipcbiAqIEFsbG93IFVzZXJzIGNvbGxlY3Rpb24gdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Vc2Vycy5hbGxvdyh7XG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UVIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LXFyLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRRUnMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgRXN0YWJsaXNobWVudFFScyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxFc3RhYmxpc2htZW50UVI+KCdlc3RhYmxpc2htZW50X3FycycpO1xuXG4vKipcbiAqIEFsbG93IEVzdGFibGlzaG1lbnRRUnMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuRXN0YWJsaXNobWVudFFScy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50LCBFc3RhYmxpc2htZW50VHVybiwgRXN0YWJsaXNobWVudFByb2ZpbGUsIEVzdGFibGlzaG1lbnRQcm9maWxlSW1hZ2UgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudHMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgRXN0YWJsaXNobWVudHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248RXN0YWJsaXNobWVudD4oJ2VzdGFibGlzaG1lbnRzJyk7XG5cbi8qKlxuICogQWxsb3cgRXN0YWJsaXNobWVudCBjb2xsZWNpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkVzdGFibGlzaG1lbnRzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pO1xuXG4vKipcbiAqIEVzdGFibGlzaG1lbnQgVHVybnMgQ29sbGVjdGlvblxuICovXG5cbmV4cG9ydCBjb25zdCBFc3RhYmxpc2htZW50VHVybnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248RXN0YWJsaXNobWVudFR1cm4+KCdlc3RhYmxpc2htZW50X3R1cm5zJyk7XG5cbi8qKlxuICogQWxsb3cgRXN0YWJsaXNobWVudCBUdXJucyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Fc3RhYmxpc2htZW50VHVybnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTtcblxuLyoqXG4gKiBFc3RhYmxpc2htZW50IFByb2ZpbGUgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgRXN0YWJsaXNobWVudHNQcm9maWxlID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEVzdGFibGlzaG1lbnRQcm9maWxlPignZXN0YWJsaXNobWVudF9wcm9maWxlJyk7XG5cbi8qKlxuICogQWxsb3cgRXN0YWJsaXNobWVudCBQcm9maWxlIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkVzdGFibGlzaG1lbnRzUHJvZmlsZS5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTtcbiIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgT3JkZXJIaXN0b3J5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvb3JkZXItaGlzdG9yeS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIE9yZGVySGlzdG9yaWVzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IE9yZGVySGlzdG9yaWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPE9yZGVySGlzdG9yeT4oJ29yZGVyX2hpc3RvcmllcycpO1xuXG4vKipcbiAqIEFsbG93IE9yZGVySGlzdG9yaWVzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbk9yZGVySGlzdG9yaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE9yZGVyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvb3JkZXIubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBPcmRlcnMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgT3JkZXJzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPE9yZGVyPignb3JkZXJzJyk7XG5cbi8qKlxuICogQWxsb3cgT3JkZXJzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbk9yZGVycy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6bG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUmV3YXJkUG9pbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBSZXdhcmRQb2ludHMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgUmV3YXJkUG9pbnRzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFJld2FyZFBvaW50PigncmV3YXJkX3BvaW50cycpO1xuXG4vKipcbiAqIEFsbG93IFJld2FyZFBvaW50cyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5SZXdhcmRQb2ludHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOmxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJld2FyZCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3Jld2FyZC5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBSZXdhcmQgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgUmV3YXJkcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxSZXdhcmQ+KCdyZXdhcmRzJyk7XG5cbi8qKlxuICogQWxsb3cgUmV3YXJkIGNvbGxlY3Rpb24gaW5zZXJ0LCB1cGRhdGUgYW5kIHJlbW92ZSBmdW5jdGlvbnNcbiAqL1xuUmV3YXJkcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvdGFibGUubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFRhYmxlcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBUYWJsZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248VGFibGU+KCd0YWJsZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBUYWJsZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuVGFibGVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFdhaXRlckNhbGxEZXRhaWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC93YWl0ZXItY2FsbC1kZXRhaWwubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFdhaXRlckNhbGxEZXRhaWxzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFdhaXRlckNhbGxEZXRhaWxzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFdhaXRlckNhbGxEZXRhaWw+KCd3YWl0ZXJfY2FsbF9kZXRhaWxzJyk7XG5cbi8qKlxuICogQWxsb3cgV2FpdGVyQ2FsbERldGFpbHMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuV2FpdGVyQ2FsbERldGFpbHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnXG5pbXBvcnQgeyBDb3VudHJ5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvY291bnRyeS5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQ291bnRyaWVzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IENvdW50cmllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxDb3VudHJ5PignY291bnRyaWVzJyk7XG5cbi8qKlxuICogQWxsb3cgQ291bnRyaWVzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkNvdW50cmllcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBDdXJyZW5jeSB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL2N1cnJlbmN5Lm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5leHBvcnQgY29uc3QgQ3VycmVuY2llcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxDdXJyZW5jeT4oJ2N1cnJlbmNpZXMnKTtcblxuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG5DdXJyZW5jaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEVtYWlsQ29udGVudCB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmV4cG9ydCBjb25zdCBFbWFpbENvbnRlbnRzID0gIG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxFbWFpbENvbnRlbnQ+KCdlbWFpbF9jb250ZW50cycpO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBBbGxvdyBFbWFpbENvbnRlbnRzIGNvbGxlY2lvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuRW1haWxDb250ZW50cy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBIb3VyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvaG91ci5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuZXhwb3J0IGNvbnN0IEhvdXJzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEhvdXI+KCdob3VycycpO1xuXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbkhvdXJzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IExhbmd1YWdlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvbGFuZ3VhZ2UubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIExhbmd1YWdlcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBMYW5ndWFnZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248TGFuZ3VhZ2U+KCdsYW5ndWFnZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBMYW5ndWFnZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuTGFuZ3VhZ2VzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3BhcmFtZXRlci5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuZXhwb3J0IGNvbnN0IFBhcmFtZXRlcnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UGFyYW1ldGVyPigncGFyYW1ldGVycycpO1xuXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cblBhcmFtZXRlcnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZCB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3BheW1lbnRNZXRob2QubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmV4cG9ydCBjb25zdCBQYXltZW50TWV0aG9kcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxQYXltZW50TWV0aG9kPigncGF5bWVudE1ldGhvZHMnKTtcblxuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG5QYXltZW50TWV0aG9kcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3BvaW50Lm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBQb2ludHMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgUG9pbnRzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFBvaW50PigncG9pbnRzJyk7XG5cbi8qKlxuICogQWxsb3cgcG9pbnRzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblBvaW50cy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3ItcnhqcydcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvcXVldWUubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFF1ZXVlcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBRdWV1ZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UXVldWU+KCdxdWV1ZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBRdWV1ZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuUXVldWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFR5cGVPZkZvb2QgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC90eXBlLW9mLWZvb2QubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBUeXBlc09mRm9vZCBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBUeXBlc09mRm9vZCA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxUeXBlT2ZGb29kPigndHlwZXNfb2ZfZm9vZCcpO1xuXG4vKipcbiAqIEFsbG93IFR5cGVzT2ZGb29kIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblR5cGVzT2ZGb29kLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEFkZGl0aW9uIH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvYWRkaXRpb24ubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBBZGRpdGlvbiBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBBZGRpdGlvbnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248QWRkaXRpb24+KCdhZGRpdGlvbnMnKTtcblxuLyoqXG4gKiBBbGxvdyBBZGRpdGlvbiBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5BZGRpdGlvbnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gJy4uLy4uL21vZGVscy9tZW51L2NhdGVnb3J5Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQ2F0ZWdvcmllcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBDYXRlZ29yaWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPENhdGVnb3J5PignY2F0ZWdvcmllcycpO1xuXG4vKipcbiAqIEFsbG93IENhdGVnb3J5IGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkNhdGVnb3JpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBJdGVtLCBJdGVtSW1hZ2UgfSBmcm9tICcuLi8uLi9tb2RlbHMvbWVudS9pdGVtLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEl0ZW1zIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEl0ZW1zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEl0ZW0+KCdpdGVtcycpO1xuXG4vKipcbiAqIEFsbG93IEl0ZW1zIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkl0ZW1zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgT3B0aW9uVmFsdWUgfSBmcm9tICcuLi8uLi9tb2RlbHMvbWVudS9vcHRpb24tdmFsdWUubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogT3B0aW9uIFZhbHVlIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IE9wdGlvblZhbHVlcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxPcHRpb25WYWx1ZT4oJ29wdGlvbl92YWx1ZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBPcHRpb25WYWx1ZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuT3B0aW9uVmFsdWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvb3B0aW9uLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogT3B0aW9ucyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBPcHRpb25zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPE9wdGlvbj4oJ29wdGlvbnMnKTtcblxuLyoqXG4gKiBBbGxvdyBPcHRpb25zIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbk9wdGlvbnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBTZWN0aW9uIH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvc2VjdGlvbi5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFNlY3Rpb24gQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgU2VjdGlvbnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248U2VjdGlvbj4oJ3NlY3Rpb25zJyk7XG5cbi8qKlxuICogQWxsb3cgU2VjdGlvbiBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5TZWN0aW9ucy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFN1YmNhdGVnb3J5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvc3ViY2F0ZWdvcnkubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBTdWJjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBTdWJjYXRlZ29yaWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFN1YmNhdGVnb3J5Pignc3ViY2F0ZWdvcmllcycpO1xuXG4vKipcbiAqIEFsbG93IFN1YmNhdGVnb3J5IGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblN1YmNhdGVnb3JpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENjUGF5bWVudE1ldGhvZCB9IGZyb20gJy4uLy4uL21vZGVscy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kLm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IENjUGF5bWVudE1ldGhvZHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248Q2NQYXltZW50TWV0aG9kPignY2NfcGF5bWVudF9tZXRob2RzJyk7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEFsbG93IEhpc3RvcnlQYXltZW50Q29sbGVjdGlvbiBjb2xsZWNpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkNjUGF5bWVudE1ldGhvZHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDeWdJbnZvaWNlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BheW1lbnQvY3lnLWludm9pY2UubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgQ3lnSW52b2ljZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248Q3lnSW52b2ljZT4oJ2N5Z19pbnZvaWNlcycpO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQWxsb3cgSGlzdG9yeVBheW1lbnRDb2xsZWN0aW9uIGNvbGxlY2lvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuQ3lnSW52b2ljZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7XG4iLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEludm9pY2VJbmZvIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BheW1lbnQvaW52b2ljZS1pbmZvLm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IEludm9pY2VzSW5mbyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxJbnZvaWNlSW5mbz4oJ2ludm9pY2VzX2luZm8nKTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQWxsb3cgSGlzdG9yeVBheW1lbnRDb2xsZWN0aW9uIGNvbGxlY2lvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuSW52b2ljZXNJbmZvLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUGF5bWVudEhpc3RvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgUGF5bWVudHNIaXN0b3J5ID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFBheW1lbnRIaXN0b3J5PigncGF5bWVudHNfaGlzdG9yeScpO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBBbGxvdyBIaXN0b3J5UGF5bWVudENvbGxlY3Rpb24gY29sbGVjaW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5QYXltZW50c0hpc3RvcnkuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQYXltZW50VHJhbnNhY3Rpb24gfSBmcm9tICcuLi8uLi9tb2RlbHMvcGF5bWVudC9wYXltZW50LXRyYW5zYWN0aW9uLm1vZGVsJztcblxuZXhwb3J0IGNvbnN0IFBheW1lbnRUcmFuc2FjdGlvbnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UGF5bWVudFRyYW5zYWN0aW9uPigncGF5bWVudF90cmFuc2FjdGlvbicpO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBBbGxvdyBIaXN0b3J5UGF5bWVudENvbGxlY3Rpb24gY29sbGVjaW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5QYXltZW50VHJhbnNhY3Rpb25zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEJhZ1BsYW5IaXN0b3J5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9iYWctcGxhbi1oaXN0b3J5Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQmFnUGxhbkhpc3RvcmllcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBCYWdQbGFuSGlzdG9yaWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEJhZ1BsYW5IaXN0b3J5PignYmFnX3BsYW5faGlzdG9yaWVzJyk7XG5cbkJhZ1BsYW5IaXN0b3JpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluLFxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgQmFnUGxhbiB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvYmFnLXBsYW4ubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBCYWdQbGFucyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBCYWdQbGFucyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxCYWdQbGFuPignYmFnX3BsYW5zJyk7XG5cbkJhZ1BsYW5zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJbixcbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRNZWRhbCB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50TWVkYWxzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEVzdGFibGlzaG1lbnRNZWRhbHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248RXN0YWJsaXNobWVudE1lZGFsPignZXN0YWJsaXNobWVudF9tZWRhbHMnKTtcblxuLyoqXG4gKiBBbGxvdyBFc3RhYmxpc2htZW50TWVkYWxzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkVzdGFibGlzaG1lbnRNZWRhbHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9lc3RhYmxpc2htZW50LXBvaW50Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudFBvaW50cyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBFc3RhYmxpc2htZW50UG9pbnRzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEVzdGFibGlzaG1lbnRQb2ludD4oJ2VzdGFibGlzaG1lbnRfcG9pbnRzJyk7XG5cbi8qKlxuICogQWxsb3cgRXN0YWJsaXNobWVudFBvaW50cyBjb2xsZWN0aW9uIGluc2VydCwgdXBkYXRlIGFuZCByZW1vdmUgZnVuY3Rpb25zXG4gKi9cbkVzdGFibGlzaG1lbnRQb2ludHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluLFxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTmVnYXRpdmVQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvbmVnYXRpdmUtcG9pbnQubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBOZWdhdGl2ZVBvaW50cyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBOZWdhdGl2ZVBvaW50cyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxOZWdhdGl2ZVBvaW50PignbmVnYXRpdmVfcG9pbnRzJyk7XG5cbk5lZ2F0aXZlUG9pbnRzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJbixcbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFJld2FyZENvbmZpcm1hdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbi5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBSZXdhcmRzQ29uZmlybWF0aW9ucyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBSZXdhcmRzQ29uZmlybWF0aW9ucyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxSZXdhcmRDb25maXJtYXRpb24+KCdyZXdhcmRzX2NvbmZpcm1hdGlvbnMnKTtcblxuLyoqXG4gKiBBbGxvdyBSZXdhcmRzQ29uZmlybWF0aW9ucyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5SZXdhcmRzQ29uZmlybWF0aW9ucy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFJld2FyZEhpc3RvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL3Jld2FyZC1oaXN0b3J5Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFJld2FyZEhpc3RvcmllcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBSZXdhcmRIaXN0b3JpZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UmV3YXJkSGlzdG9yeT4oJ3Jld2FyZHNfaGlzdG9yaWVzJyk7XG5cbi8qKlxuICogQWxsb3cgUmV3YXJkSGlzdG9yaWVzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblJld2FyZEhpc3Rvcmllcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBDb2xsZWN0aW9uT2JqZWN0IH0gZnJvbSAnLi4vY29sbGVjdGlvbi1vYmplY3QubW9kZWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFVzZXJEZXZpY2UgZXh0ZW5kcyBDb2xsZWN0aW9uT2JqZWN0IHtcbiAgICB1c2VyX2lkOiBzdHJpbmc7XG4gICAgZGV2aWNlcyA6IERldmljZVtdO1xufVxuXG5leHBvcnQgY2xhc3MgRGV2aWNlIHtcbiAgICBwbGF5ZXJfaWQ6IHN0cmluZztcbiAgICBpc19hY3RpdmUgOiBib29sZWFuO1xufVxuXG4iLCJpbXBvcnQgeyBDb2xsZWN0aW9uT2JqZWN0IH0gZnJvbSAnLi4vY29sbGVjdGlvbi1vYmplY3QubW9kZWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFVzZXJEZXRhaWwgZXh0ZW5kcyBDb2xsZWN0aW9uT2JqZWN0IHtcbiAgICB1c2VyX2lkOiBzdHJpbmc7XG4gICAgcm9sZV9pZDogc3RyaW5nO1xuICAgIGlzX2FjdGl2ZTogYm9vbGVhbjtcblxuICAgIC8vZmllbGRzIGZvciBhZG1pbiByZWdpc3RlclxuICAgIGNvbnRhY3RfcGhvbmU/OiBzdHJpbmc7XG4gICAgZG5pX251bWJlcj86IHN0cmluZztcbiAgICBhZGRyZXNzPzogc3RyaW5nO1xuICAgIGNvdW50cnlfaWQ/OiBzdHJpbmc7XG4gICAgY2l0eV9pZD86IHN0cmluZztcbiAgICBvdGhlcl9jaXR5Pzogc3RyaW5nO1xuICAgIHNob3dfYWZ0ZXJfcmVzdF9jcmVhdGlvbj86IGJvb2xlYW47XG4gICAgLy9cblxuICAgIGVzdGFibGlzaG1lbnRfd29yaz86IHN0cmluZztcbiAgICBwZW5hbHRpZXM/OiBVc2VyRGV0YWlsUGVuYWx0eVtdO1xuICAgIGdyYW50X3N0YXJ0X3BvaW50cz86IGJvb2xlYW47XG4gICAgYmlydGhkYXRlPzogRGF0ZTtcbiAgICBwaG9uZT86IHN0cmluZztcbiAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICBpbWFnZT86IFVzZXJEZXRhaWxJbWFnZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVc2VyRGV0YWlsUGVuYWx0eSB7XG4gICAgZGF0ZTogRGF0ZTtcbn1cblxuLyoqXG4gKiBVc2VyIERldGFpbCBJbWFnZSBNb2RlbFxuICovXG5leHBvcnQgY2xhc3MgVXNlckRldGFpbEltYWdlIHtcbiAgICBfaWQ/OiBzdHJpbmc7XG4gICAgZmlsZW5hbWU6IHN0cmluZztcbiAgICBoYW5kbGU6IHN0cmluZztcbiAgICBtaW1ldHlwZTogc3RyaW5nO1xuICAgIG9yaWdpbmFsUGF0aDogc3RyaW5nO1xuICAgIHNpemU6IHN0cmluZztcbiAgICBzb3VyY2U6IHN0cmluZztcbiAgICB1cmw6IHN0cmluZztcbiAgICBvcmlnaW5hbEZpbGU/OiBPYmplY3Q7XG4gICAgc3RhdHVzPzogc3RyaW5nO1xuICAgIGtleT86IHN0cmluZztcbiAgICBjb250YWluZXI/OiBzdHJpbmc7XG4gICAgdXBsb2FkSWQ6IHN0cmluZztcbn0iLCIvKipcbiAqIFVzZXIgTG9naW4gTW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIFVzZXJMb2dpbiB7XG4gICAgdXNlcl9pZDogc3RyaW5nO1xuICAgIGxvZ2luX2RhdGU6IERhdGU7XG4gICAgYXBwX2NvZGVfbmFtZTogc3RyaW5nO1xuICAgIGFwcF9uYW1lOiBzdHJpbmc7XG4gICAgYXBwX3ZlcnNpb246IHN0cmluZztcbiAgICBjb29raWVfZW5hYmxlZDogYm9vbGVhbjtcbiAgICBsYW5ndWFnZTogc3RyaW5nO1xuICAgIHBsYXRmb3JtOiBzdHJpbmc7XG4gICAgY29yZG92YV92ZXJzaW9uPzogc3RyaW5nO1xuICAgIG1vZGVsPzogc3RyaW5nO1xuICAgIHBsYXRmb3JtX2RldmljZT86IHN0cmluZztcbiAgICB2ZXJzaW9uPzogc3RyaW5nO1xufSIsImltcG9ydCB7IENvbGxlY3Rpb25PYmplY3QgfSBmcm9tICcuLi9jb2xsZWN0aW9uLW9iamVjdC5tb2RlbCc7XG5cbi8qKlxuICogVXNlciBQcm9maWxlIE1vZGVsXG4gKi9cbmV4cG9ydCBjbGFzcyBVc2VyUHJvZmlsZSB7XG4gICAgZmlyc3RfbmFtZT86IHN0cmluZztcbiAgICBsYXN0X25hbWU/OiBzdHJpbmc7XG4gICAgbGFuZ3VhZ2VfY29kZT86IHN0cmluZztcbiAgICBnZW5kZXI/OiBzdHJpbmc7XG4gICAgZnVsbF9uYW1lOiBzdHJpbmc7XG59IiwiaW1wb3J0IHsgQ29sbGVjdGlvbk9iamVjdCB9IGZyb20gJy4uL2NvbGxlY3Rpb24tb2JqZWN0Lm1vZGVsJztcblxuLyoqXG4gKiBFc3RhYmxpc2htZW50IG1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudCBleHRlbmRzIENvbGxlY3Rpb25PYmplY3Qge1xuICAgIGNvdW50cnlJZDogc3RyaW5nO1xuICAgIGNpdHk6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgY3VycmVuY3lJZDogc3RyaW5nO1xuICAgIGFkZHJlc3M6IHN0cmluZztcbiAgICBpbmRpY2F0aXZlOiBzdHJpbmc7XG4gICAgcGhvbmU6IHN0cmluZztcbiAgICBlc3RhYmxpc2htZW50X2NvZGU6IHN0cmluZztcbiAgICBwYXltZW50TWV0aG9kczogc3RyaW5nW107XG4gICAgdGFibGVzX3F1YW50aXR5OiBudW1iZXI7XG4gICAgaW1hZ2U/OiBFc3RhYmxpc2htZW50SW1hZ2U7XG4gICAgaXNBY3RpdmU6IGJvb2xlYW47XG4gICAgZmlyc3RQYXk6IGJvb2xlYW47XG4gICAgZnJlZURheXM/OiBib29sZWFuO1xuICAgIGlzX3ByZW1pdW0/OiBib29sZWFuO1xuICAgIGlzX2JldGFfdGVzdGVyOiBib29sZWFuO1xuICAgIGJhZ19wbGFuc19pZDogc3RyaW5nO1xuICAgIGlzX2ZyZWVtaXVtOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRJbWFnZSBtb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnRJbWFnZSB7XG4gICAgX2lkPzogc3RyaW5nO1xuICAgIGZpbGVuYW1lOiBzdHJpbmc7XG4gICAgaGFuZGxlOiBzdHJpbmc7XG4gICAgbWltZXR5cGU6IHN0cmluZztcbiAgICBvcmlnaW5hbFBhdGg6IHN0cmluZztcbiAgICBzaXplOiBzdHJpbmc7XG4gICAgc291cmNlOiBzdHJpbmc7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgb3JpZ2luYWxGaWxlPzogT2JqZWN0O1xuICAgIHN0YXR1cz86IHN0cmluZztcbiAgICBrZXk/OiBzdHJpbmc7XG4gICAgY29udGFpbmVyPzogc3RyaW5nO1xuICAgIHVwbG9hZElkOiBzdHJpbmc7XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudExvY2F0aW9uIG1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudExvY2F0aW9uIHtcbiAgICBsYXQ6IG51bWJlcjtcbiAgICBsbmc6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50U2NoZWR1bGUgbW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50U2NoZWR1bGUge1xuICAgIG1vbmRheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgdHVlc2RheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgd2VkbmVzZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfSxcbiAgICB0aHVyc2RheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgZnJpZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfSxcbiAgICBzYXR1cmRheT86IHtcbiAgICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICAgIG9wZW5pbmdfdGltZTogc3RyaW5nLFxuICAgICAgICBjbG9zaW5nX3RpbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgc3VuZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfSxcbiAgICBob2xpZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfVxufTtcblxuLyoqXG4gKiBFc3RhYmxpc2htZW50VHVybiBtb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnRUdXJuIGV4dGVuZHMgQ29sbGVjdGlvbk9iamVjdCB7XG4gICAgZXN0YWJsaXNobWVudF9pZDogc3RyaW5nLFxuICAgIHR1cm46IG51bWJlcixcbiAgICBsYXN0X3dhaXRlcl9pZDogc3RyaW5nLFxufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRTb2NpYWxOZXR3b3JrIE1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudFNvY2lhbE5ldHdvcmsge1xuICAgIGZhY2Vib29rPzogc3RyaW5nO1xuICAgIHR3aXR0ZXI/OiBzdHJpbmc7XG4gICAgaW5zdGFncmFtPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnQgUHJvZmlsZSBNb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnRQcm9maWxlIGV4dGVuZHMgQ29sbGVjdGlvbk9iamVjdCB7XG4gICAgX2lkPzogc3RyaW5nO1xuICAgIGVzdGFibGlzaG1lbnRfaWQ6IHN0cmluZztcbiAgICBlc3RhYmxpc2htZW50X2Rlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgd2ViX3BhZ2U/OiBzdHJpbmc7XG4gICAgZW1haWw/OiBzdHJpbmc7XG4gICAgc29jaWFsX25ldHdvcmtzPzogRXN0YWJsaXNobWVudFNvY2lhbE5ldHdvcms7XG4gICAgaW1hZ2VzPzpFc3RhYmxpc2htZW50UHJvZmlsZUltYWdlW107XG4gICAgc2NoZWR1bGU6IEVzdGFibGlzaG1lbnRTY2hlZHVsZTtcbiAgICBsb2NhdGlvbjogRXN0YWJsaXNobWVudExvY2F0aW9uO1xuICAgIHR5cGVzX29mX2Zvb2Q/OiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50UHJvZmlsZUltYWdlIG1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudFByb2ZpbGVJbWFnZSB7XG4gICAgX2lkPzogc3RyaW5nO1xuICAgIGZpbGVuYW1lOiBzdHJpbmc7XG4gICAgaGFuZGxlOiBzdHJpbmc7XG4gICAgbWltZXR5cGU6IHN0cmluZztcbiAgICBvcmlnaW5hbFBhdGg6IHN0cmluZztcbiAgICBzaXplOiBzdHJpbmc7XG4gICAgc291cmNlOiBzdHJpbmc7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgb3JpZ2luYWxGaWxlPzogT2JqZWN0O1xuICAgIHN0YXR1cz86IHN0cmluZztcbiAgICBrZXk/OiBzdHJpbmc7XG4gICAgY29udGFpbmVyPzogc3RyaW5nO1xuICAgIHVwbG9hZElkOiBzdHJpbmc7XG59IiwiZXhwb3J0IGNsYXNzIE5vZGUge1xuICAgIHByaXZhdGUgZnJlY3VlbmN5Om51bWJlcjtcbiAgICBwcml2YXRlIGNoYXJzOm51bWJlcjtcbiAgICBwcml2YXRlIG5vZGVMZWZ0Ok5vZGU7XG4gICAgcHJpdmF0ZSBub2RlUmlnaHQ6Tm9kZTtcblxuICAgIGNyZWF0ZU5vZGUoIF9wQ2hhcnM6bnVtYmVyICk6dm9pZHtcbiAgICAgICAgdGhpcy5mcmVjdWVuY3kgPSAxO1xuICAgICAgICB0aGlzLmNoYXJzID0gX3BDaGFycztcbiAgICB9XG5cbiAgICBjcmVhdGVOb2RlRXh0ZW5kKCBfcEZyZWN1ZW5jeTpudW1iZXIsIF9wQ2hhcnM6bnVtYmVyLCBfcExlZnQ6Tm9kZSwgX3BSaWdodDpOb2RlICl7XG4gICAgICAgIHRoaXMuZnJlY3VlbmN5ID0gX3BGcmVjdWVuY3k7XG4gICAgICAgIHRoaXMuY2hhcnMgPSBfcENoYXJzO1xuICAgICAgICB0aGlzLm5vZGVMZWZ0ID0gX3BMZWZ0O1xuICAgICAgICB0aGlzLm5vZGVSaWdodCA9IF9wUmlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0Q2hhcigpOm51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhcnM7XG4gICAgfVxuXG4gICAgc2V0Q2hhciggX3BDaGFyOm51bWJlciApOnZvaWR7XG4gICAgICAgIHRoaXMuY2hhcnMgPSBfcENoYXI7XG4gICAgfVxuXG4gICAgZ2V0RnJlY3VlbmN5KCk6bnVtYmVye1xuICAgICAgICByZXR1cm4gdGhpcy5mcmVjdWVuY3k7XG4gICAgfVxuXG4gICAgc2V0RnJlY3VlbmN5KCBfcEZyZWN1ZW5jeTpudW1iZXIgKTp2b2lke1xuICAgICAgICB0aGlzLmZyZWN1ZW5jeSA9IF9wRnJlY3VlbmN5O1xuICAgIH1cblxuICAgIGdldE5vZGVMZWZ0KCk6Tm9kZXtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZUxlZnQ7XG4gICAgfVxuXG4gICAgc2V0Tm9kZUxlZnQoIF9wTGVmdDpOb2RlICk6dm9pZHtcbiAgICAgICAgdGhpcy5ub2RlTGVmdCA9IF9wTGVmdDtcbiAgICB9XG5cbiAgICBnZXROb2RlUmlnaHQoKTpOb2Rle1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlUmlnaHQ7XG4gICAgfVxuXG4gICAgc2V0Tm9kZVJpZ2h0KCBfcE5vZGVSaWdodDpOb2RlICk6dm9pZHtcbiAgICAgICAgdGhpcy5ub2RlUmlnaHQgPSBfcE5vZGVSaWdodDtcbiAgICB9ICBcbn0iLCIvKipcbiAqIFJlc3BvbnNlUXVlcnkgbW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc3BvbnNlUXVlcnkge1xuICAgIGxhbmd1YWdlOiBzdHJpbmc7XG4gICAgY29tbWFuZDogc3RyaW5nO1xuICAgIG1lcmNoYW50OiBNZXJjaGFudDtcbiAgICBkZXRhaWxzOiBEZXRhaWxzO1xuICAgIHRlc3Q6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTWVyY2hhbnQgbW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIE1lcmNoYW50IHtcbiAgICBhcGlLZXk6IHN0cmluZztcbiAgICBhcGlMb2dpbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIERldGFpbHMgbW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIERldGFpbHMge1xuICAgIHRyYW5zYWN0aW9uSWQ6IHN0cmluZztcbn0iLCJpbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wgfSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcblxuZXhwb3J0IGNsYXNzIEN1c3RvbVZhbGlkYXRvcnMge1xuXG4gIHB1YmxpYyBzdGF0aWMgZW1haWxWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUubWF0Y2goL1thLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSsoPzpcXC5bYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKSpAKD86W2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pP1xcLikrW2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pKz8vKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkRW1haWxBZGRyZXNzJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gIHB1YmxpYyBzdGF0aWMgbnVtZXJpY1ZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZS5tYXRjaCgvXigwfFsxLTldWzAtOV0qKSQvKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkTnVtZXJpY0ZpZWxkJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuICAqL1xuICBwdWJsaWMgc3RhdGljIG51bWVyaWNWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWROdW1lcmljRmllbGQnOiB0cnVlIH07XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBsZXR0ZXJWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUubWF0Y2goL15bQS16XSskLykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZExldHRlckZpZWxkJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbGV0dGVyU3BhY2VWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUubWF0Y2goL15bYS16QS1aXFxzXSokLykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZExldHRlclNwYWNlRmllbGQnOiB0cnVlIH07XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBkYXlPZkRhdGVWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUgPj0gMSAmJiBjb250cm9sLnZhbHVlIDw9IDMxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWREYXlGaWVsZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG1vbnRoT2ZEYXRlVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlID49IDEgJiYgY29udHJvbC52YWx1ZSA8PSAxMikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkTW9udGhGaWVsZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHllYXJPZkRhdGVWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUgPj0gMTk3MCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkWWVhckZpZWxkJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm9TcGFjZXNWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYoY29udHJvbC52YWx1ZSAhPT0gbnVsbCAmJiBjb250cm9sLnZhbHVlICE9PSB1bmRlZmluZWQpe1xuICAgICAgaWYgKGNvbnRyb2wudmFsdWUubWF0Y2goL15cXFMqJC8pKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHsgJ2ludmFsaWROb1NwYWNlc1ZhbGlkYXRvcic6IHRydWUgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKlBhc3N3b3JkIGNvbnN0cmFpbnRzXG4gICAgbWluIDYgY2hhcmFjdGVyc1xuICAgIG1heCAyMCBjaGFyYWN0ZXJzXG4gICAgbG93ZXIgYW5kIHVwcGVyIGxldHRlcnNcbiAgICBudW1iZXJzXG4gICAgYWxsb3dlZCBjaGFyYWN0ZXJzICFAIyQlXiYqXG4gICovXG4gIC8qcHVibGljIHN0YXRpYyBwYXNzd29yZFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcblx0ICAgIGlmIChjb250cm9sLnZhbHVlLm1hdGNoKC9eKD89LipbMC05XSlbYS16QS1aMC05IUAjJCVeJipdezYsMjB9JC8pKSB7XG5cdCAgICAgIHJldHVybiBudWxsO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgcmV0dXJuIHsnaW52YWxpZFBhc3N3b3JkJzogdHJ1ZSB9O1xuXHQgICAgfVxuICB9Ki9cbn0gIiwiaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSc7XG5cbkFjY291bnRzLm9uQ3JlYXRlVXNlcihmdW5jdGlvbiAob3B0aW9ucywgdXNlcikge1xuXG4gICAgdXNlci5wcm9maWxlID0gb3B0aW9ucy5wcm9maWxlIHx8IHt9O1xuICAgIHVzZXIucHJvZmlsZS5mdWxsX25hbWUgPSBvcHRpb25zLnByb2ZpbGUuZnVsbF9uYW1lO1xuICAgIHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlID0gb3B0aW9ucy5wcm9maWxlLmxhbmd1YWdlX2NvZGU7XG4gICAgdXNlci5wcm9maWxlLmdlbmRlciA9IG9wdGlvbnMucHJvZmlsZS5nZW5kZXI7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB1c2VyIG9iamVjdFxuICAgIHJldHVybiB1c2VyO1xufSk7IiwiaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBhcmFtZXRlciB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2dlbmVyYWwvcGFyYW1ldGVyLm1vZGVsJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWxDb250ZW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9lbWFpbC1jb250ZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWxDb250ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcblxuQWNjb3VudHMudXJscy5yZXNldFBhc3N3b3JkID0gZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgcmV0dXJuIE1ldGVvci5hYnNvbHV0ZVVybCgncmVzZXQtcGFzc3dvcmQvJyArIHRva2VuKTtcbn07XG5cbmZ1bmN0aW9uIGdyZWV0KCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodXNlciwgdXJsKSB7XG5cbiAgICAgICAgbGV0IGVtYWlsQ29udGVudDogRW1haWxDb250ZW50ID0gRW1haWxDb250ZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBsYW5ndWFnZTogdXNlci5wcm9maWxlLmxhbmd1YWdlX2NvZGUgfSk7XG4gICAgICAgIGxldCBncmVldFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnZ3JlZXRWYXInKTtcbiAgICAgICAgbGV0IHdlbGNvbWVNc2dWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3dlbGNvbWVNc2dWYXInKTtcbiAgICAgICAgbGV0IGJ0blRleHRWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2J0blRleHRWYXInKTtcbiAgICAgICAgbGV0IGJlZm9yZU1zZ1ZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnYmVmb3JlTXNnVmFyJyk7XG4gICAgICAgIGxldCByZWdhcmRWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlZ2FyZFZhcicpO1xuICAgICAgICBsZXQgZm9sbG93TXNnVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdmb2xsb3dNc2dWYXInKTtcblxuICAgICAgICBsZXQgZmFjZWJvb2tWYXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmYWNlYm9va19saW5rJyB9KS52YWx1ZTtcbiAgICAgICAgbGV0IHR3aXR0ZXJWYXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICd0d2l0dGVyX2xpbmsnIH0pLnZhbHVlO1xuICAgICAgICBsZXQgaW5zdGFncmFtVmFyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaW5zdGFncmFtX2xpbmsnIH0pLnZhbHVlO1xuICAgICAgICBsZXQgaXVyZXN0VmFyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X3VybCcgfSkudmFsdWU7XG4gICAgICAgIGxldCBpdXJlc3RJbWdWYXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpdXJlc3RfaW1nX3VybCcgfSkudmFsdWU7XG5cbiAgICAgICAgdmFyIGdyZWV0aW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSkgPyAoZ3JlZXRWYXIgKyAnICcgKyB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSArIFwiLFwiKSA6IGdyZWV0VmFyO1xuXG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIDx0YWJsZSBib3JkZXI9XCIwXCIgd2lkdGg9XCIxMDAlXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCIgYmdjb2xvcj1cIiNmNWY1ZjVcIj5cbiAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDIwcHggMCAzMHB4IDA7XCI+XG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT1cImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7IGJveC1zaGFkb3c6IDAgMnB4IDJweCAwIHJnYmEoMCwgMCwgMCwgMC4xNCksIDAgMXB4IDVweCAwIHJnYmEoMCwgMCwgMCwgMC4xMiksIDAgM3B4IDFweCAtMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyPVwiMFwiIHdpZHRoPVwiNjAlXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCIgYWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDEwcHggMCAxMHB4IDA7XCIgYWxpZ249XCJjZW50ZXJcIiBiZ2NvbG9yPVwiIzNjNDE0NlwiPjxpbWcgc3R5bGU9XCJkaXNwbGF5OiBibG9jaztcIiBzcmM9JHtpdXJlc3RJbWdWYXJ9bG9nb19pdXJlc3Rfd2hpdGUucG5nIGFsdD1cIlJlc2V0IHBhc3N3ZFwiIC8+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMTBweCAzMHB4IDEwcHggMzBweDtcIiBiZ2NvbG9yPVwiI2ZmZmZmZlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGJvcmRlcj1cIjBcIiB3aWR0aD1cIjEwMCVcIiBjZWxsc3BhY2luZz1cIjBcIiBjZWxscGFkZGluZz1cIjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDE1cHggMCAwIDA7IGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgZm9udC1zaXplOiAyNHB4OyBmb250LXdlaWdodDogYm9sZDtcIj4ke2dyZWV0aW5nfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDE1cHggMCAxMHB4IDA7IGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjtcIj4ke3dlbGNvbWVNc2dWYXJ9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMjBweCAwIDIwcHggMDsgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmO1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgYWxpZ249XCJjZW50ZXJcIj48YSBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6IHdoaXRlOyBib3JkZXItc3R5bGU6IHNvbGlkOyBib3JkZXItd2lkdGg6IDJweDsgY29sb3I6ICNFRjUzNTA7IHRleHQtYWxpZ246IGNlbnRlcjsgcGFkZGluZzogMTBweCAzMHB4OyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGZvbnQtd2VpZ2h0OiBib2xkIFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPVwiJHt1cmx9XCI+JHtidG5UZXh0VmFyfTwvYT48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDAgMCAwIDA7IGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2JlZm9yZU1zZ1Zhcn0gPGJyIC8+ICR7cmVnYXJkVmFyfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cInBhZGRpbmc6IDBweCAzMHB4IDEwcHggMzBweDtcIiBiZ2NvbG9yPVwiI2ZmZmZmZlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgYm9yZGVyPVwiMFwiIHdpZHRoPVwiMTAwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwiZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmO1wiPiR7Zm9sbG93TXNnVmFyfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgYWxpZ249XCJyaWdodFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBib3JkZXI9XCIwXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+PGEgaHJlZj0ke2ZhY2Vib29rVmFyfT4gPGltZyBzdHlsZT1cImRpc3BsYXk6IGJsb2NrO1wiIHNyYz0ke2l1cmVzdEltZ1Zhcn1mYWNlYm9va19yZWQucG5nIGFsdD1cIkZhY2Vib29rXCIgLz4gPC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwiZm9udC1zaXplOiAwOyBsaW5lLWhlaWdodDogMDtcIiB3aWR0aD1cIjIwXCI+Jm5ic3A7PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+PGEgaHJlZj0ke3R3aXR0ZXJWYXJ9PiA8aW1nIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7XCIgc3JjPSR7aXVyZXN0SW1nVmFyfXR3aXR0ZXJfcmVkLnBuZyBhbHQ9XCJUd2l0dGVyXCIgLz4gPC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwiZm9udC1zaXplOiAwOyBsaW5lLWhlaWdodDogMDtcIiB3aWR0aD1cIjIwXCI+Jm5ic3A7PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+PGEgaHJlZj0ke2luc3RhZ3JhbVZhcn0+IDxpbWcgc3R5bGU9XCJkaXNwbGF5OiBibG9jaztcIiBzcmM9JHtpdXJlc3RJbWdWYXJ9aW5zdGFncmFtX3JlZC5wbmcgYWx0PVwiSW5zdGFncmFtXCIgLz4gPC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7IHBhZGRpbmc6IDEwcHggMCAxMHB4IDA7XCI+PGEgc3R5bGU9XCJmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgZmxvYXQ6IGxlZnQ7XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj0ke2l1cmVzdFZhcn0+aXVyZXN0LmNvbTwvYT48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3Rib2R5PlxuICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICBgO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdyZWV0VGV4dCgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHVzZXIsIHVybCkge1xuXG4gICAgICAgIGxldCBlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCA9IEVtYWlsQ29udGVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgbGFuZ3VhZ2U6IHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlIH0pO1xuICAgICAgICBsZXQgZ3JlZXRWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2dyZWV0VmFyJyk7XG4gICAgICAgIGxldCB3ZWxjb21lTXNnVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICd3ZWxjb21lTXNnVmFyJyk7XG4gICAgICAgIGxldCBidG5UZXh0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdidG5UZXh0VmFyJyk7XG4gICAgICAgIGxldCBiZWZvcmVNc2dWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2JlZm9yZU1zZ1ZhcicpO1xuICAgICAgICBsZXQgcmVnYXJkVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdyZWdhcmRWYXInKTtcbiAgICAgICAgbGV0IGZvbGxvd01zZ1ZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnZm9sbG93TXNnVmFyJyk7XG5cbiAgICAgICAgdmFyIGdyZWV0aW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSkgPyAoZ3JlZXRWYXIgKyB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSArIFwiLFwiKSA6IGdyZWV0VmFyO1xuXG4gICAgICAgIHJldHVybiBgICAgICR7Z3JlZXRpbmd9XG4gICAgICAgICAgICAgICAgICAgICR7d2VsY29tZU1zZ1Zhcn1cbiAgICAgICAgICAgICAgICAgICAgJHt1cmx9XG4gICAgICAgICAgICAgICAgICAgICR7YmVmb3JlTXNnVmFyfVxuICAgICAgICAgICAgICAgICAgICAke3JlZ2FyZFZhcn1cbiAgICAgICAgICAgICAgIGA7XG4gICAgfVxufVxuXG5BY2NvdW50cy5lbWFpbFRlbXBsYXRlcyA9IHtcbiAgICBmcm9tOiAnJyxcbiAgICBzaXRlTmFtZTogTWV0ZW9yLmFic29sdXRlVXJsKCkucmVwbGFjZSgvXmh0dHBzPzpcXC9cXC8vLCAnJykucmVwbGFjZSgvXFwvJC8sICcnKSxcbiAgICByZXNldFBhc3N3b3JkOiB7XG4gICAgICAgIHN1YmplY3Q6IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICBsZXQgZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQgPSBFbWFpbENvbnRlbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IGxhbmd1YWdlOiB1c2VyLnByb2ZpbGUubGFuZ3VhZ2VfY29kZSB9KTtcbiAgICAgICAgICAgIGxldCBzdWJqZWN0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdyZXNldFBhc3N3b3JkU3ViamVjdFZhcicpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3ViamVjdFZhciArICcgJyArIEFjY291bnRzLmVtYWlsVGVtcGxhdGVzLnNpdGVOYW1lO1xuICAgICAgICB9LFxuICAgICAgICBodG1sOiBncmVldCgpLFxuICAgICAgICB0ZXh0OiBncmVldFRleHQoKSxcbiAgICB9LFxuICAgIHZlcmlmeUVtYWlsOiB7XG4gICAgICAgIHN1YmplY3Q6IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJIb3cgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3Mgb24gXCIgKyBBY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5zaXRlTmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgdGV4dDogZ3JlZXQoKVxuICAgIH0sXG4gICAgZW5yb2xsQWNjb3VudDoge1xuICAgICAgICBzdWJqZWN0OiBmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgcmV0dXJuIFwiQW4gYWNjb3VudCBoYXMgYmVlbiBjcmVhdGVkIGZvciB5b3Ugb24gXCIgKyBBY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5zaXRlTmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgdGV4dDogZ3JlZXQoKVxuICAgIH1cbn07XG5cblxuQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMucmVzZXRQYXNzd29yZC5mcm9tID0gKCkgPT4ge1xuICAgIGxldCBmcm9tVmFyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZnJvbV9lbWFpbCcgfSkudmFsdWU7XG4gICAgcmV0dXJuIGZyb21WYXI7XG59O1xuIiwiaW1wb3J0IHsgTWVudXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvbWVudS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE1lbnUgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL21lbnUubW9kZWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZE1lbnVzKCkge1xuXG4gICAgaWYgKE1lbnVzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuXG4gICAgICAgIGNvbnN0IG1lbnVzOiBNZW51W10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjkwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkRBU0hCT0FSRC5EQVNIQk9BUkRcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9kYXNoYm9hcmRcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwidHJlbmRpbmcgdXBcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogOTAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCI5MTBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5EQVNIQk9BUkQuREFTSEJPQVJEXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvZGFzaGJvYXJkc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJ0cmVuZGluZyB1cFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA5MTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjEwMDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuUkVXQVJEU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3Jld2FyZHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiZ3JhZGVcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTAwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjE1MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQVBQUk9WRV9SRVdBUkRTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvYXBwcm92ZS1yZXdhcmRzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImFzc2lnbm1lbnRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTUwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjE2MDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuR0lWRV9NRURBTFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2dpdmUtbWVkYWxzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImNhcmRfZ2lmdGNhcmRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTYwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjEwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5NQU5BR0VNRU5UXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJzdXBlcnZpc29yIGFjY291bnRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTAwMCxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjpcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uUkVTVEFVUkFOVFNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDExXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uTVlfUkVTVEFVUkFOVFNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9lc3RhYmxpc2htZW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAxMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAxMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLlBST0ZJTEVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9lc3RhYmxpc2htZW50LXByb2ZpbGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDEyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LyosIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMTNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5NT05USExZX0NPTkZJR1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2VzdGFibGlzaG1lbnQtbGlzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwMTNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9LyosIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLlRBQkxFU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMjFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5UQUJMRVNfU0VBUkNIXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvdGFibGVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAyMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAyMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLlRBQkxFX0NPTlRST0xcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9lc3RhYmxpc2htZW50LXRhYmxlLWNvbnRyb2xcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDIyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0qLywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uQ09MTEFCT1JBVE9SU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2NvbGxhYm9yYXRvcnNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTEwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFQUFJPVkVfUkVXQVJEU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3N1cGVydmlzb3ItYXBwcm92ZS1yZXdhcmRzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImFzc2lnbm1lbnRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTEwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTIwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkdJVkVfTUVEQUxcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9zdXBlcnZpc29yLWdpdmUtbWVkYWxzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImNhcmRfZ2lmdGNhcmRcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qe1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMjAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uVEFCTEVTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc3VwZXJ2aXNvci10YWJsZXNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwicmVzdGF1cmFudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMzAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uVEFCTEVfQ09OVFJPTFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3N1cGVydmlzb3ItZXN0YWJsaXNobWVudC10YWJsZS1jb250cm9sXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImxpc3RcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMTMwMFxuICAgICAgICAgICAgfSwqL1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIyMDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuUEFZTUVOVFMuQkFHU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwicGF5bWVudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAyMDAwLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOlxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjIwMDFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5QQVlNRU5UUy5QVVJDSEFTRV9CQUdTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvYmFncy1wYXltZW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAyMDAxXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIyMDAyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuUEFZTUVOVFMuUEFZTUVOVF9ISVNUT1JZXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvcGF5bWVudC1oaXN0b3J5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAyMDAyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjMwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uTUVOVV9ERUZJTklUSU9OXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDMwMDAsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46XG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5TRUNUSU9OU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3NlY3Rpb25zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAzMDAxXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjMwMDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uQ0FURUdPUklFU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2NhdGVnb3JpZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDMwMDJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwM1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5TVUJDQVRFR09SSUVTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc3ViY2F0ZWdvcmllc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwM1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIzMDA0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLkFERElUSU9OU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2FkZGl0aW9uc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwNFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIzMDA1XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLk9QVElPTlNfVkFMVUVTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwNTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLk9QVElPTlNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL29wdGlvbnNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAzMDA1MVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwNTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLlZBTFVFU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvb3B0aW9uLXZhbHVlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDMwMDUyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjMwMDZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uSVRFTVNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9pdGVtc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwNlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyp7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjMxMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uSVRFTVNfRU5BQkxFXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvaXRlbXMtZW5hYmxlLXN1cFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJkb25lIGFsbFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAzMTAwXG4gICAgICAgICAgICB9LCovXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjQwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5PUkRFUlNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9vcmRlcnNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiZG5zXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDQwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjYwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5XQUlURVJfQ0FMTFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3dhaXRlci1jYWxsXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInJlY29yZF92b2ljZV9vdmVyXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDYwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjcwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uT1JERVJTX0NIRUZcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9jaGVmLW9yZGVyc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDcwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjgwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5DQUxMU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2NhbGxzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInBhbl90b29sXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDgwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjkwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uTUVOVV9ERUZJTklUSU9OXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvbWVudS1saXN0XCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInJlc3RhdXJhbnRfbWVudVwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA5MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIyMDAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlNFVFRJTkdTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc2V0dGluZ3NcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwic2V0dGluZ3NcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMjAwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjExMDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuVEFCTEVTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvdGFibGUtY2hhbmdlXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImNvbXBhcmVfYXJyb3dzXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDExMDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMjAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlJFU1RBVVJBTlRfRVhJVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2VzdGFibGlzaG1lbnQtZXhpdFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJleGl0X3RvX2FwcFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMjAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTkwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5QT0lOVFNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9wb2ludHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwicGF5bWVudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxOTAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTMwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5PUkRFUlNfVE9EQVlcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9jYXNoaWVyLW9yZGVycy10b2RheVwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJhc3NpZ25tZW50XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEzMDAwXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIG1lbnVzLmZvckVhY2goKG1lbnU6IE1lbnUpID0+IE1lbnVzLmluc2VydChtZW51KSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUm9sZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvcm9sZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3JvbGUubW9kZWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFJvbGVzKCkge1xuXG4gICAgaWYgKFJvbGVzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuXG4gICAgICAgIGNvbnN0IHJvbGVzOiBSb2xlW10gPSBbe1xuICAgICAgICAgICAgX2lkOiBcIjEwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogXCJST0xFLkFETUlOSVNUUkFUT1JcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImVzdGFibGlzaG1lbnQgYWRtaW5pc3RyYXRvclwiLFxuICAgICAgICAgICAgbWVudXM6IFtcIjkwMFwiLCBcIjEwMDBcIiwgXCIyMDAwXCIsIFwiMzAwMFwiLCBcIjEwMDAwXCIsIFwiMTUwMDBcIiwgXCIxNjAwMFwiLCBcIjIwMDAwXCJdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIF9pZDogXCI0MDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IFwiUk9MRS5DVVNUT01FUlwiLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiZXN0YWJsaXNobWVudCBjdXN0b21lclwiLFxuICAgICAgICAgICAgbWVudXM6IFtcIjQwMDBcIiwgXCI2MDAwXCIsIFwiMTEwMDBcIiwgXCIxMjAwMFwiLCBcIjIwMDAwXCIsIFwiMTkwMDBcIl1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgX2lkOiBcIjYwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogXCJST0xFLlNVUEVSVklTT1JcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImVzdGFibGlzaG1lbnQgc3VwZXJ2aXNvclwiLFxuICAgICAgICAgICAgbWVudXM6IFtcIjkxMFwiLCBcIjExMDBcIiwgXCIxMjAwXCIsIFwiMjAwMDBcIl0sXG4gICAgICAgICAgICB1c2VyX3ByZWZpeDogJ3NwJ1xuICAgICAgICB9XTtcblxuICAgICAgICByb2xlcy5mb3JFYWNoKChyb2xlOiBSb2xlKSA9PiBSb2xlcy5pbnNlcnQocm9sZSkpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvdW50cnkgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL2NvdW50cnkubW9kZWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZENvdW50cmllcygpIHtcbiAgICBpZiAoQ291bnRyaWVzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBjb3VudHJpZXM6IENvdW50cnlbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BTEJBTklBJywgYWxmYUNvZGUyOiAnQUwnLCBhbGZhQ29kZTM6ICdBTEInLCBudW1lcmljQ29kZTogJzAwOCcsIGluZGljYXRpdmU6ICcoKyAzNTUpJywgY3VycmVuY3lJZDogJzI3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5HRVJNQU5ZJywgYWxmYUNvZGUyOiAnREUnLCBhbGZhQ29kZTM6ICdERVUnLCBudW1lcmljQ29kZTogJzI3NicsIGluZGljYXRpdmU6ICcoKyA0OSknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFORE9SUkEnLCBhbGZhQ29kZTI6ICdBRCcsIGFsZmFDb2RlMzogJ0FORCcsIG51bWVyaWNDb2RlOiAnMDIwJywgaW5kaWNhdGl2ZTogJygrIDM3NiknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFSR0VOVElOQScsIGFsZmFDb2RlMjogJ0FSJywgYWxmYUNvZGUzOiAnQVJHJywgbnVtZXJpY0NvZGU6ICcwMzInLCBpbmRpY2F0aXZlOiAnKCsgNTQpJywgY3VycmVuY3lJZDogJzM3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BUk1FTklBJywgYWxmYUNvZGUyOiAnQU0nLCBhbGZhQ29kZTM6ICdBUk0nLCBudW1lcmljQ29kZTogJzA1MScsIGluZGljYXRpdmU6ICcoKyAzNzQpJywgY3VycmVuY3lJZDogJzE5MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BVVNUUklBJywgYWxmYUNvZGUyOiAnQVQnLCBhbGZhQ29kZTM6ICdBVVQnLCBudW1lcmljQ29kZTogJzA0MCcsIGluZGljYXRpdmU6ICcoKyA0MyknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFaRVJCQUlKQU4nLCBhbGZhQ29kZTI6ICdBWicsIGFsZmFDb2RlMzogJ0FaRScsIG51bWVyaWNDb2RlOiAnMDMxJywgaW5kaWNhdGl2ZTogJygrIDk5NCknLCBjdXJyZW5jeUlkOiAnMzUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJFTEdJVU0nLCBhbGZhQ29kZTI6ICdCRScsIGFsZmFDb2RlMzogJ0JFTCcsIG51bWVyaWNDb2RlOiAnMDU2JywgaW5kaWNhdGl2ZTogJygrIDMyKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQkVMSVpFJywgYWxmYUNvZGUyOiAnQlonLCBhbGZhQ29kZTM6ICdCTFonLCBudW1lcmljQ29kZTogJzA4NCcsIGluZGljYXRpdmU6ICcoKyA1MDEpJywgY3VycmVuY3lJZDogJzEzMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQkVSTVVEQVMnLCBhbGZhQ29kZTI6ICdCTScsIGFsZmFDb2RlMzogJ0JNVScsIG51bWVyaWNDb2RlOiAnMDYwJywgaW5kaWNhdGl2ZTogJygrIDEwMDQpJywgY3VycmVuY3lJZDogJzE0MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTEwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQkVMQVJVUycsIGFsZmFDb2RlMjogJ0JZJywgYWxmYUNvZGUzOiAnQkxSJywgbnVtZXJpY0NvZGU6ICcxMTInLCBpbmRpY2F0aXZlOiAnKCsgMzc1KScsIGN1cnJlbmN5SWQ6ICc0NDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJPTElWSUEnLCBhbGZhQ29kZTI6ICdCTycsIGFsZmFDb2RlMzogJ0JPTCcsIG51bWVyaWNDb2RlOiAnMDY4JywgaW5kaWNhdGl2ZTogJygrIDU5MSknLCBjdXJyZW5jeUlkOiAnMzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJPU05JQV9IRVJaRUdPVklOQScsIGFsZmFDb2RlMjogJ0JBJywgYWxmYUNvZGUzOiAnQklIJywgbnVtZXJpY0NvZGU6ICcwNzAnLCBpbmRpY2F0aXZlOiAnKCsgMzg3KScsIGN1cnJlbmN5SWQ6ICczNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJSQVpJTCcsIGFsZmFDb2RlMjogJ0JSJywgYWxmYUNvZGUzOiAnQlJBJywgbnVtZXJpY0NvZGU6ICcwNzYnLCBpbmRpY2F0aXZlOiAnKCsgNTUpJywgY3VycmVuY3lJZDogJzQzMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQlVMR0FSSUEnLCBhbGZhQ29kZTI6ICdCRycsIGFsZmFDb2RlMzogJ0JHUicsIG51bWVyaWNDb2RlOiAnMTAwJywgaW5kaWNhdGl2ZTogJygrIDM1OSknLCBjdXJyZW5jeUlkOiAnMzEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5DQU5BREEnLCBhbGZhQ29kZTI6ICdDQScsIGFsZmFDb2RlMzogJ0NBTicsIG51bWVyaWNDb2RlOiAnMTI0JywgaW5kaWNhdGl2ZTogJygrIDAwMSknLCBjdXJyZW5jeUlkOiAnMTUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5DSElMRScsIGFsZmFDb2RlMjogJ0NMJywgYWxmYUNvZGUzOiAnQ0hMJywgbnVtZXJpY0NvZGU6ICcxNTInLCBpbmRpY2F0aXZlOiAnKCsgNTYpJywgY3VycmVuY3lJZDogJzM4MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQ1lQUlVTJywgYWxmYUNvZGUyOiAnQ1knLCBhbGZhQ29kZTM6ICdDWVAnLCBudW1lcmljQ29kZTogJzE5NicsIGluZGljYXRpdmU6ICcoKzM1NyknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxOTAwJywgaXNfYWN0aXZlOiB0cnVlLCBuYW1lOiAnQ09VTlRSSUVTLkNPTE9NQklBJywgYWxmYUNvZGUyOiAnQ08nLCBhbGZhQ29kZTM6ICdDT0wnLCBudW1lcmljQ29kZTogJzE3MCcsIGluZGljYXRpdmU6ICcoKyA1NyknLCBjdXJyZW5jeUlkOiAnMzkwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJzAgNyAqLzIgKiAqJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcqIDggKiAqIConIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNPU1RBX1JJQ0EnLCBhbGZhQ29kZTI6ICdDUicsIGFsZmFDb2RlMzogJ0NSSScsIG51bWVyaWNDb2RlOiAnMTg4JywgaW5kaWNhdGl2ZTogJygrIDUwNiknLCBjdXJyZW5jeUlkOiAnNDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIxMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNST0FUSUEnLCBhbGZhQ29kZTI6ICdIUicsIGFsZmFDb2RlMzogJ0hSVicsIG51bWVyaWNDb2RlOiAnMTkxJywgaW5kaWNhdGl2ZTogJygrIDM4NSknLCBjdXJyZW5jeUlkOiAnMjUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5ERU5NQVJLJywgYWxmYUNvZGUyOiAnREsnLCBhbGZhQ29kZTM6ICdETksnLCBudW1lcmljQ29kZTogJzIwOCcsIGluZGljYXRpdmU6ICcoKyA0NSknLCBjdXJyZW5jeUlkOiAnNzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkVDVUFET1InLCBhbGZhQ29kZTI6ICdFQycsIGFsZmFDb2RlMzogJ0VDVScsIG51bWVyaWNDb2RlOiAnMjE4JywgaW5kaWNhdGl2ZTogJygrIDU5MyknLCBjdXJyZW5jeUlkOiAnMTYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5FTF9TQUxWQURPUicsIGFsZmFDb2RlMjogJ1NWJywgYWxmYUNvZGUzOiAnU0xWJywgbnVtZXJpY0NvZGU6ICcyMjInLCBpbmRpY2F0aXZlOiAnKCsgNTAzKScsIGN1cnJlbmN5SWQ6ICcxNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlNMT1ZBS0lBJywgYWxmYUNvZGUyOiAnU0snLCBhbGZhQ29kZTM6ICdTVksnLCBudW1lcmljQ29kZTogJzcwMycsIGluZGljYXRpdmU6ICcoKyA0MjEpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjYwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0xPVkVOSUEnLCBhbGZhQ29kZTI6ICdTSScsIGFsZmFDb2RlMzogJ1NWTicsIG51bWVyaWNDb2RlOiAnNzA1JywgaW5kaWNhdGl2ZTogJygrIDM4NiknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TUEFJTicsIGFsZmFDb2RlMjogJ0VTJywgYWxmYUNvZGUzOiAnRVNQJywgbnVtZXJpY0NvZGU6ICc3MjQnLCBpbmRpY2F0aXZlOiAnKCsgMzQpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVU5JVEVEX1NUQVRFUycsIGFsZmFDb2RlMjogJ1VTJywgYWxmYUNvZGUzOiAnVVNBJywgbnVtZXJpY0NvZGU6ICc4NDAnLCBpbmRpY2F0aXZlOiAnKCsgMSknLCBjdXJyZW5jeUlkOiAnMTYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyOTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5FU1RPTklBJywgYWxmYUNvZGUyOiAnRUUnLCBhbGZhQ29kZTM6ICdFU1QnLCBudW1lcmljQ29kZTogJzIzMycsIGluZGljYXRpdmU6ICcoKyAzNzIpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuRklOTEFORCcsIGFsZmFDb2RlMjogJ0ZJJywgYWxmYUNvZGUzOiAnRklOJywgbnVtZXJpY0NvZGU6ICcyNDYnLCBpbmRpY2F0aXZlOiAnKCsgMzU4KScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMxMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkZSQU5DRScsIGFsZmFDb2RlMjogJ0ZSJywgYWxmYUNvZGUzOiAnRlJBJywgbnVtZXJpY0NvZGU6ICcyNTAnLCBpbmRpY2F0aXZlOiAnKCsgMzMpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR0VPUkdJQScsIGFsZmFDb2RlMjogJ0dFJywgYWxmYUNvZGUzOiAnR0VPJywgbnVtZXJpY0NvZGU6ICcyNjgnLCBpbmRpY2F0aXZlOiAnKCsgOTk1KScsIGN1cnJlbmN5SWQ6ICcyNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkdSRUVDRScsIGFsZmFDb2RlMjogJ0dSJywgYWxmYUNvZGUzOiAnR1JDJywgbnVtZXJpY0NvZGU6ICczMDAnLCBpbmRpY2F0aXZlOiAnKCsgMzApJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR1JFRU5MQU5EJywgYWxmYUNvZGUyOiAnR0wnLCBhbGZhQ29kZTM6ICdHUkwnLCBudW1lcmljQ29kZTogJzMwNCcsIGluZGljYXRpdmU6ICcoKyAyOTkpJywgY3VycmVuY3lJZDogJzcwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczNTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5HVUFURU1BTEEnLCBhbGZhQ29kZTI6ICdHVCcsIGFsZmFDb2RlMzogJ0dUTScsIG51bWVyaWNDb2RlOiAnMzIwJywgaW5kaWNhdGl2ZTogJygrIDUwMiknLCBjdXJyZW5jeUlkOiAnNDIwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczNjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5GUkVOQ0hfR1VJQU5BJywgYWxmYUNvZGUyOiAnR0YnLCBhbGZhQ29kZTM6ICdHVUYnLCBudW1lcmljQ29kZTogJzI1NCcsIGluZGljYXRpdmU6ICcoKyA1OTQpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzcwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR1VZQU5BJywgYWxmYUNvZGUyOiAnR1knLCBhbGZhQ29kZTM6ICdHVVknLCBudW1lcmljQ29kZTogJzMyOCcsIGluZGljYXRpdmU6ICcoKyA1OTIpJywgY3VycmVuY3lJZDogJzE3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuSE9ORFVSQVMnLCBhbGZhQ29kZTI6ICdITicsIGFsZmFDb2RlMzogJ0hORCcsIG51bWVyaWNDb2RlOiAnMzQwJywgaW5kaWNhdGl2ZTogJygrIDUwNCknLCBjdXJyZW5jeUlkOiAnMjgwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczOTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5IVU5HQVJZJywgYWxmYUNvZGUyOiAnSFUnLCBhbGZhQ29kZTM6ICdIVU4nLCBudW1lcmljQ29kZTogJzM0OCcsIGluZGljYXRpdmU6ICcoKyAzNiknLCBjdXJyZW5jeUlkOiAnMjEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0MDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5JUkVMQU5EJywgYWxmYUNvZGUyOiAnSUUnLCBhbGZhQ29kZTM6ICdJUkwnLCBudW1lcmljQ29kZTogJzM3MicsIGluZGljYXRpdmU6ICcoKyAzNTMpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDEwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuSUNFTEFORCcsIGFsZmFDb2RlMjogJ0lTJywgYWxmYUNvZGUzOiAnSVNMJywgbnVtZXJpY0NvZGU6ICczNTInLCBpbmRpY2F0aXZlOiAnKCsgMzU0KScsIGN1cnJlbmN5SWQ6ICc4MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuRkFMS0xBTkRfSVNMQU5EUycsIGFsZmFDb2RlMjogJ0ZLJywgYWxmYUNvZGUzOiAnRkxLJywgbnVtZXJpY0NvZGU6ICcyMzgnLCBpbmRpY2F0aXZlOiAnKCsgNTAwKScsIGN1cnJlbmN5SWQ6ICczMzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLklUQUxZJywgYWxmYUNvZGUyOiAnSVQnLCBhbGZhQ29kZTM6ICdJVEEnLCBudW1lcmljQ29kZTogJzM4MCcsIGluZGljYXRpdmU6ICcoKyAzOSknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5LQVpBS0hTVEFOJywgYWxmYUNvZGUyOiAnS1onLCBhbGZhQ29kZTM6ICdLQVonLCBudW1lcmljQ29kZTogJzM5OCcsIGluZGljYXRpdmU6ICcoKyA3MzEpJywgY3VycmVuY3lJZDogJzQ3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDUwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTEFUVklBJywgYWxmYUNvZGUyOiAnTFYnLCBhbGZhQ29kZTM6ICdMVkEnLCBudW1lcmljQ29kZTogJzQyOCcsIGluZGljYXRpdmU6ICcoKyAzNzEpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDYwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTElFQ0hURU5TVEVJTicsIGFsZmFDb2RlMjogJ0xJJywgYWxmYUNvZGUzOiAnTElFJywgbnVtZXJpY0NvZGU6ICc0MzgnLCBpbmRpY2F0aXZlOiAnKCsgNDE3KScsIGN1cnJlbmN5SWQ6ICcyMjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ3MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkxJVEhVQU5JQScsIGFsZmFDb2RlMjogJ0xUJywgYWxmYUNvZGUzOiAnTFRVJywgbnVtZXJpY0NvZGU6ICc0NDAnLCBpbmRpY2F0aXZlOiAnKCsgMzcwKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkxVWEVNQk9VUkcnLCBhbGZhQ29kZTI6ICdMVScsIGFsZmFDb2RlMzogJ0xVWCcsIG51bWVyaWNDb2RlOiAnNDQyJywgaW5kaWNhdGl2ZTogJygrIDM1MiknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0OTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NQUNFRE9OSUEnLCBhbGZhQ29kZTI6ICdNSycsIGFsZmFDb2RlMzogJ01LRCcsIG51bWVyaWNDb2RlOiAnODA3JywgaW5kaWNhdGl2ZTogJygrIDM4OSknLCBjdXJyZW5jeUlkOiAnMTEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1MDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NQUxUQScsIGFsZmFDb2RlMjogJ01UJywgYWxmYUNvZGUzOiAnTUxUJywgbnVtZXJpY0NvZGU6ICc0NzAnLCBpbmRpY2F0aXZlOiAnKCsgMzU2KScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUxMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLk1FWElDTycsIGFsZmFDb2RlMjogJ01YJywgYWxmYUNvZGUzOiAnTUVYJywgbnVtZXJpY0NvZGU6ICc0ODQnLCBpbmRpY2F0aXZlOiAnKCsgNTIpJywgY3VycmVuY3lJZDogJzQwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTU9MREFWSUEnLCBhbGZhQ29kZTI6ICdNRCcsIGFsZmFDb2RlMzogJ01EQScsIG51bWVyaWNDb2RlOiAnNDk4JywgaW5kaWNhdGl2ZTogJygrIDM3MyknLCBjdXJyZW5jeUlkOiAnMjkwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1MzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NT05BQ08nLCBhbGZhQ29kZTI6ICdNQycsIGFsZmFDb2RlMzogJ01DTycsIG51bWVyaWNDb2RlOiAnNDkyJywgaW5kaWNhdGl2ZTogJygrIDM3NyknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1NDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NT05URU5FR1JPJywgYWxmYUNvZGUyOiAnTUUnLCBhbGZhQ29kZTM6ICdNTkUnLCBudW1lcmljQ29kZTogJzQ5OScsIGluZGljYXRpdmU6ICcoKyAzODIpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTUwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTklDQVJBR1VBJywgYWxmYUNvZGUyOiAnTkknLCBhbGZhQ29kZTM6ICdOSUMnLCBudW1lcmljQ29kZTogJzU1OCcsIGluZGljYXRpdmU6ICcoKyA1MDUpJywgY3VycmVuY3lJZDogJzUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1NjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5OT1JXQVknLCBhbGZhQ29kZTI6ICdOTycsIGFsZmFDb2RlMzogJ05PUicsIG51bWVyaWNDb2RlOiAnNTc4JywgaW5kaWNhdGl2ZTogJygrIDQ3KScsIGN1cnJlbmN5SWQ6ICc5MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTcwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTkVUSEVSTEFORFMnLCBhbGZhQ29kZTI6ICdOTCcsIGFsZmFDb2RlMzogJ05MRCcsIG51bWVyaWNDb2RlOiAnNTI4JywgaW5kaWNhdGl2ZTogJygrIDMxKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzU4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlBBTkFNQScsIGFsZmFDb2RlMjogJ1BBJywgYWxmYUNvZGUzOiAnUEFOJywgbnVtZXJpY0NvZGU6ICc1OTEnLCBpbmRpY2F0aXZlOiAnKCsgNTA3KScsIGN1cnJlbmN5SWQ6ICcxMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuUEFSQUdVQVknLCBhbGZhQ29kZTI6ICdQWScsIGFsZmFDb2RlMzogJ1BSWScsIG51bWVyaWNDb2RlOiAnNjAwJywgaW5kaWNhdGl2ZTogJygrIDU5NSknLCBjdXJyZW5jeUlkOiAnMjQwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5QRVJVJywgYWxmYUNvZGUyOiAnUEUnLCBhbGZhQ29kZTM6ICdQRVInLCBudW1lcmljQ29kZTogJzYwNCcsIGluZGljYXRpdmU6ICcoKyA1MSknLCBjdXJyZW5jeUlkOiAnNDYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5QT0xBTkQnLCBhbGZhQ29kZTI6ICdQTCcsIGFsZmFDb2RlMzogJ1BPTCcsIG51bWVyaWNDb2RlOiAnNjE2JywgaW5kaWNhdGl2ZTogJygrIDQ4KScsIGN1cnJlbmN5SWQ6ICc0ODAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzYyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlBPUlRVR0FMJywgYWxmYUNvZGUyOiAnUFQnLCBhbGZhQ29kZTM6ICdQUlQnLCBudW1lcmljQ29kZTogJzYyMCcsIGluZGljYXRpdmU6ICcoKyAzNTEpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjMwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVU5JVEVEX0tJTkdET00nLCBhbGZhQ29kZTI6ICdHQicsIGFsZmFDb2RlMzogJ0dCUicsIG51bWVyaWNDb2RlOiAnODI2JywgaW5kaWNhdGl2ZTogJygrIDQ0KScsIGN1cnJlbmN5SWQ6ICczMjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNaRUNIX1JFUFVCTElDJywgYWxmYUNvZGUyOiAnQ1onLCBhbGZhQ29kZTM6ICdDWkUnLCBudW1lcmljQ29kZTogJzIwMycsIGluZGljYXRpdmU6ICcoKyA0MiknLCBjdXJyZW5jeUlkOiAnNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlJPTUFOSUEnLCBhbGZhQ29kZTI6ICdSTycsIGFsZmFDb2RlMzogJ1JPVScsIG51bWVyaWNDb2RlOiAnNjQyJywgaW5kaWNhdGl2ZTogJygrIDQwKScsIGN1cnJlbmN5SWQ6ICczMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY2MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlJVU1NJQScsIGFsZmFDb2RlMjogJ1JVJywgYWxmYUNvZGUzOiAnUlVTJywgbnVtZXJpY0NvZGU6ICc2NDMnLCBpbmRpY2F0aXZlOiAnKCsgNyknLCBjdXJyZW5jeUlkOiAnNDUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2NzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TQU5fTUFSSU5PJywgYWxmYUNvZGUyOiAnU00nLCBhbGZhQ29kZTM6ICdTTVInLCBudW1lcmljQ29kZTogJzY3NCcsIGluZGljYXRpdmU6ICcoKyAzNzgpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0FJTlRfUElFUlJFX01JUVVFTE9OJywgYWxmYUNvZGUyOiAnUE0nLCBhbGZhQ29kZTM6ICdTUE0nLCBudW1lcmljQ29kZTogJzY2NicsIGluZGljYXRpdmU6ICcoKyA1MDgpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0VSQklBJywgYWxmYUNvZGUyOiAnUlMnLCBhbGZhQ29kZTM6ICdTUkInLCBudW1lcmljQ29kZTogJzY4OCcsIGluZGljYXRpdmU6ICcoKyAzODEpJywgY3VycmVuY3lJZDogJzEyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU1dFREVOJywgYWxmYUNvZGUyOiAnU0UnLCBhbGZhQ29kZTM6ICdTV0UnLCBudW1lcmljQ29kZTogJzc1MicsIGluZGljYXRpdmU6ICcoKyA0NiknLCBjdXJyZW5jeUlkOiAnMTAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3MTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TV0lUWkVSTEFORCcsIGFsZmFDb2RlMjogJ0NIJywgYWxmYUNvZGUzOiAnQ0hFJywgbnVtZXJpY0NvZGU6ICc3NTYnLCBpbmRpY2F0aXZlOiAnKCsgNDEpJywgY3VycmVuY3lJZDogJzIyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU1VSSU5BTScsIGFsZmFDb2RlMjogJ1NSJywgYWxmYUNvZGUzOiAnU1VSJywgbnVtZXJpY0NvZGU6ICc3NDAnLCBpbmRpY2F0aXZlOiAnKCsgNTk3KScsIGN1cnJlbmN5SWQ6ICcxODAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzczMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlRVUktFWScsIGFsZmFDb2RlMjogJ1RSJywgYWxmYUNvZGUzOiAnVFVSJywgbnVtZXJpY0NvZGU6ICc3OTInLCBpbmRpY2F0aXZlOiAnKCsgOTApJywgY3VycmVuY3lJZDogJzM0MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVUtSQUlORScsIGFsZmFDb2RlMjogJ1VBJywgYWxmYUNvZGUzOiAnVUtSJywgbnVtZXJpY0NvZGU6ICc4MDQnLCBpbmRpY2F0aXZlOiAnKCsgMzgwKScsIGN1cnJlbmN5SWQ6ICcyMzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzc1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlVSVUdVQVknLCBhbGZhQ29kZTI6ICdVWScsIGFsZmFDb2RlMzogJ1VSWScsIG51bWVyaWNDb2RlOiAnODU4JywgaW5kaWNhdGl2ZTogJygrIDU5OCknLCBjdXJyZW5jeUlkOiAnNDEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3NjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5WRU5FWlVFTEEnLCBhbGZhQ29kZTI6ICdWRScsIGFsZmFDb2RlMzogJ1ZFTicsIG51bWVyaWNDb2RlOiAnODYyJywgaW5kaWNhdGl2ZTogJygrIDU4KScsIGN1cnJlbmN5SWQ6ICcyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfVxuICAgICAgICBdO1xuICAgICAgICBjb3VudHJpZXMuZm9yRWFjaCgoY291bnRyeTogQ291bnRyeSkgPT4gQ291bnRyaWVzLmluc2VydChjb3VudHJ5KSk7XG4gICAgfVxufSIsImltcG9ydCB7IEN1cnJlbmN5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9jdXJyZW5jeS5tb2RlbCc7XG5pbXBvcnQgeyBDdXJyZW5jaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEN1cnJlbmNpZXMoKXtcbiAgICBpZiggQ3VycmVuY2llcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDAgKXtcbiAgICAgICAgY29uc3QgY3VycmVuY2llczogQ3VycmVuY3lbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQkFMQk9BJywgY29kZTogJ1BBQicsIG51bWVyaWNDb2RlOiAnNTkwJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CT0xJVkFSJywgY29kZTogJ1ZFRicsIG51bWVyaWNDb2RlOiAnOTM3JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CT0xJVklBTk8nLCBjb2RlOiAnQk9CJywgbnVtZXJpY0NvZGU6ICcwNjgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPU1RBX1JJQ0FfQ09MT04nLCBjb2RlOiAnQ1JDJywgbnVtZXJpY0NvZGU6ICcxODgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPUkRPQkEnLCBjb2RlOiAnTklPJywgbnVtZXJpY0NvZGU6ICc1NTgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzYwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNaRUNIX1JFUFVCTElDX0tPUlVOQScsIGNvZGU6ICdDWksnLCBudW1lcmljQ29kZTogJzIwMycsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuREVOTUFSS19LUk9ORScsIGNvZGU6ICdES0snLCBudW1lcmljQ29kZTogJzIwOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnODAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuSUNFTEFORF9LUk9OQScsIGNvZGU6ICdJU0snLCBudW1lcmljQ29kZTogJzM1MicsIGRlY2ltYWw6IDAgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnOTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuTk9SV0FZX0tST05FJywgY29kZTogJ05PSycsIG51bWVyaWNDb2RlOiAnNTc4JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMDAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuU1dFREVOX0tST05BJywgY29kZTogJ1NFSycsIG51bWVyaWNDb2RlOiAnNzUyJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuREVOQVInLCBjb2RlOiAnTUtEJywgbnVtZXJpY0NvZGU6ICc4MDcnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5TRVJCSUFfRElOQVInLCBjb2RlOiAnUlNEJywgbnVtZXJpY0NvZGU6ICc5NDEnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEzMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CRUxJWkVfRE9MTEFSJywgY29kZTogJ0JaRCcsIG51bWVyaWNDb2RlOiAnMDg0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNDAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQkVSTVVESUFOX0RPTExBUicsIGNvZGU6ICdCTUQnLCBudW1lcmljQ29kZTogJzA2MCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNBTkFESUFOX0RPTExBUicsIGNvZGU6ICdDQUQnLCBudW1lcmljQ29kZTogJzEyNCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTYwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVOSVRFRF9TVEFURVNfRE9MTEFSJywgY29kZTogJ1VTRCcsIG51bWVyaWNDb2RlOiAnODQwJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuR1VZQU5BX0RPTExBUicsIGNvZGU6ICdHWUQnLCBudW1lcmljQ29kZTogJzMyOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTgwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlNVUklOQU1FX0RPTExBUicsIGNvZGU6ICdTUkQnLCBudW1lcmljQ29kZTogJzk2OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTkwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFSTUVOSUFNX0RSQU0nLCBjb2RlOiAnQU1EJywgbnVtZXJpY0NvZGU6ICcwNTEnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5FVVJPJywgY29kZTogJ0VVUicsIG51bWVyaWNDb2RlOiAnOTc4JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuSFVOR0FSWV9GT1JJTlQnLCBjb2RlOiAnSFVGJywgbnVtZXJpY0NvZGU6ICczNDgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5GUkFOQycsIGNvZGU6ICdDSEYnLCBudW1lcmljQ29kZTogJzc1NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjMwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVLUkFJTkVfSFJZVk5JQScsIGNvZGU6ICdVQUgnLCBudW1lcmljQ29kZTogJzk4MCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkdVQVJBTkknLCBjb2RlOiAnUFlHJywgbnVtZXJpY0NvZGU6ICc2MDAnLCBkZWNpbWFsOiAwIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI1MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5LVU5BJywgY29kZTogJ0hSSycsIG51bWVyaWNDb2RlOiAnMTkxJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuTEFSSScsIGNvZGU6ICdHRUwnLCBudW1lcmljQ29kZTogJzk4MScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjcwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkxFSycsIGNvZGU6ICdBTEwnLCBudW1lcmljQ29kZTogJzAwOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjgwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkxFTVBJUkEnLCBjb2RlOiAnSE5MJywgbnVtZXJpY0NvZGU6ICczNDAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI5MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5NT0xET1ZBX0xFVScsIGNvZGU6ICdNREwnLCBudW1lcmljQ29kZTogJzQ5OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlJPTUFOSUFOX0xFVScsIGNvZGU6ICdST04nLCBudW1lcmljQ29kZTogJzk0NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzEwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkJVTEdBUklBX0xFVicsIGNvZGU6ICdCR04nLCBudW1lcmljQ29kZTogJzk3NScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzIwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlBPVU5EX1NURVJMSU5HJywgY29kZTogJ0dCUCcsIG51bWVyaWNDb2RlOiAnODI2JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuRkFMS0xBTkRfSVNMQU5EU19QT1VORCcsIGNvZGU6ICdGS1AnLCBudW1lcmljQ29kZTogJzIzOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlRVUktJU0hfTElSQScsIGNvZGU6ICdUUlknLCBudW1lcmljQ29kZTogJzk0OScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFaRVJCQUlKQU5JX01BTkFUJywgY29kZTogJ0FaTicsIG51bWVyaWNDb2RlOiAnOTQ0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczNjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQ09OVkVSVElCTEVfTUFSSycsIGNvZGU6ICdCQU0nLCBudW1lcmljQ29kZTogJzk3NycsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzcwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFSR0VOVElOQV9QRVNPJywgY29kZTogJ0FSUycsIG51bWVyaWNDb2RlOiAnMDMyJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczODAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQ0hJTEVfUEVTTycsIGNvZGU6ICdDTFAnLCBudW1lcmljQ29kZTogJzE1MicsIGRlY2ltYWw6IDAgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzkwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPTE9NQklBX1BFU08nLCBjb2RlOiAnQ09QJywgbnVtZXJpY0NvZGU6ICcxNzAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5NRVhJQ09fUEVTTycsIGNvZGU6ICdNWE4nLCBudW1lcmljQ29kZTogJzQ4NCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDEwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVSVUdVQVlfUEVTTycsIGNvZGU6ICdVWVUnLCBudW1lcmljQ29kZTogJzg1OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDIwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlFVRVRaQUwnLCBjb2RlOiAnR1RRJywgbnVtZXJpY0NvZGU6ICczMjAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQzMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CUkFaSUxJQU5fUkVBTCcsIGNvZGU6ICdCUkwnLCBudW1lcmljQ29kZTogJzk4NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkJFTEFSVVNJQU5fUlVCTEUnLCBjb2RlOiAnQllSJywgbnVtZXJpY0NvZGU6ICc5NzQnLCBkZWNpbWFsOiAwIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ1MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5SVVNTSUFOX1JVQkxFJywgY29kZTogJ1JVQicsIG51bWVyaWNDb2RlOiAnNjQzJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuU09MJywgY29kZTogJ1BFTicsIG51bWVyaWNDb2RlOiAnNjA0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuVEVOR0UnLCBjb2RlOiAnS1pUJywgbnVtZXJpY0NvZGU6ICczOTgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ4MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5aTE9UWScsIGNvZGU6ICdQTE4nLCBudW1lcmljQ29kZTogJzk4NScsIGRlY2ltYWw6IDAuMDEgfVxuICAgICAgICBdOyAgICAgICAgXG4gICAgICAgIGN1cnJlbmNpZXMuZm9yRWFjaCggKCBjdXI6Q3VycmVuY3kgKSA9PiBDdXJyZW5jaWVzLmluc2VydCggY3VyICkgKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgRW1haWxDb250ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFbWFpbENvbnRlbnRzKCkge1xuICAgIGlmIChFbWFpbENvbnRlbnRzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBlbWFpbENvbnRlbnRzOiBFbWFpbENvbnRlbnRbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcxMDAnLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgICAgICAgICAgIGxhbmdfZGljdGlvbmFyeTogW1xuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnY2hhcmdlU29vbkVtYWlsU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdZb3VyIG1vbnRobHkgY29tZXlnYW5hIHNlcnZpY2Ugd2lsbCBlbmRzIHNvb24nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdncmVldFZhcicsIHRyYWR1Y3Rpb246ICdIZWxsbycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3dlbGNvbWVNc2dWYXInLCB0cmFkdWN0aW9uOiAnV2UgZ290IGEgcmVxdWVzdCB0byByZXNldCB5b3UgcGFzc3dvcmQsIGlmIGl0IHdhcyB5b3UgY2xpY2sgdGhlIGJ1dHRvbiBhYm92ZS4nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdidG5UZXh0VmFyJywgdHJhZHVjdGlvbjogJ1Jlc2V0JyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnYmVmb3JlTXNnVmFyJywgdHJhZHVjdGlvbjogJ0lmIHlvdSBkbyBub3Qgd2FudCB0byBjaGFuZ2UgdGhlIHBhc3N3b3JkLCBpZ25vcmUgdGhpcyBtZXNzYWdlLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlZ2FyZFZhcicsIHRyYWR1Y3Rpb246ICdUaGFua3MsIGNvbWV5Z2FuYSB0ZWFtLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2ZvbGxvd01zZ1ZhcicsIHRyYWR1Y3Rpb246ICdGb2xsb3cgdXMgb24gc29jaWFsIG5ldHdvcmtzJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyJywgdHJhZHVjdGlvbjogJ1JlbWVtYmVyIHRoYXQgeW91ciBtb250aGx5IGNvbWV5Z2FuYSBzZXJ2aWNlIGZvcjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyMicsIHRyYWR1Y3Rpb246ICdFbmRzIG9uOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdpbnN0cnVjdGlvbmNoYXJnZVNvb25Nc2dWYXInLCB0cmFkdWN0aW9uOiAnSWYgeW91IHdhbnQgdG8gY29udGludWUgdXNpbmcgYWxsIHRoZSBzeXN0ZW0gZmVhdHVyZXMsIGVudGVyaW5nIHdpdGggeW91ciBlbWFpbCBvciB1c2VybmFtZSBhbmQgc2VsZWN0IHRoZSBtZW51IEVzdGFibGlzaG1lbnRzID4gQWRtaW5pc3RyYXRpb24gPiBFZGl0IGVzdGFibGlzaG1lbnQgPiAjIFRhYmxlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyRXhwaXJlU29vbk1zZ1ZhcicsIHRyYWR1Y3Rpb246ICdSZW1lbWJlciB0aGF0IHlvdXIgbW9udGhseSBjb21leWdhbmEgc2VydmljZSBmb3I6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyRXhwaXJlU29vbk1zZ1ZhcjInLCB0cmFkdWN0aW9uOiAnRXhwaXJlcyBvbjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyMycsIHRyYWR1Y3Rpb246ICdJZiB5b3Ugd2FudCB0byBjb250aW51ZSB1c2luZyBhbGwgdGhlIHN5c3RlbSBmZWF0dXJlcywgZW50ZXJpbmcgd2l0aCB5b3VyIGVtYWlsIG9yIHVzZXJuYW1lIGFuZCBzZWxlY3QgdGhlIG1lbnUgUGF5bWVudHMgPiBNb250aGx5IHBheW1lbnQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdleHBpcmVTb29uRW1haWxTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1lvdXIgY29tZXlnYW5hIHNlcnZpY2Ugd2lsbCBleHBpcmUgc29vbicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyUmVzdEV4cGlyZWRWYXInLCB0cmFkdWN0aW9uOiAnWW91ciBtb250aGx5IGNvbWV5Z2FuYSBzZXJ2aWNlIGZvcjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJSZXN0RXhwaXJlZFZhcjInLCB0cmFkdWN0aW9uOiAnSGFzIGV4cGlyZWQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlclJlc3RFeHBpcmVkVmFyMycsIHRyYWR1Y3Rpb246ICdJZiB5b3Ugd2FudCB0byBjb250aW51ZSB1c2luZyBhbGwgdGhlIHN5c3RlbSBmZWF0dXJlcywgZW50ZXJpbmcgd2l0aCB5b3VyIGVtYWlsIG9yIHVzZXJuYW1lIGFuZCBzZWxlY3QgdGhlIG1lbnUgUGF5bWVudHMgPiBSZWFjdGl2YXRlICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3Jlc3RFeHBpcmVkRW1haWxTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1lvdXIgY29tZXlnYW5hIHNlcnZpY2UgaGFzIGV4cGlyZWQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZXNldFBhc3N3b3JkU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdSZXNldCB5b3VyIHBhc3N3b3JkIG9uJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDdXJyZW50TWVkYWxzMScsIHRyYWR1Y3Rpb246ICdTb29uIHlvdSB3aWxsIGZpbmlzaCB5b3VyIG1lZGFscyBmb3IgJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDdXJyZW50TWVkYWxzMicsIHRyYWR1Y3Rpb246ICdZb3Ugb25seSBoYXZlICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyQ3VycmVudE1lZGFsczMnLCB0cmFkdWN0aW9uOiAnIG1lZGFscycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyQ3VycmVudE1lZGFsczQnLCB0cmFkdWN0aW9uOiAnU2VsZWN0IHRoZSBtZW51IFBhY2thZ2VzID4gQnV5IHBhY2thZ2VzIGFuZCBjb250aW51ZXMgbG95YWx0eSB5b3VyIGN1c3RvbWVycyB3aXRoIGNvbWV5Z2FuYScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2NoZWNrTWVkYWxzU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdZb3VyIG1lZGFscyB3aWxsIGVuZCBzb29uJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczEnLCB0cmFkdWN0aW9uOiAnWW91IGhhdmUgZmluaXNoZWQgeW91ciBtZWRhbHMgZm9yICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyTmVnYXRpdmVNZWRhbHMyJywgdHJhZHVjdGlvbjogJ0J1dCBkbyBub3Qgd29ycnksIHdlIGhhdmUgbGVudCB5b3UgJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczMnLCB0cmFkdWN0aW9uOiAnbWVkYWxzIHdoaWxlIHlvdSBidXkgYSBuZXcgcGFja2FnZScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyTmVnYXRpdmVNZWRhbHM0JywgdHJhZHVjdGlvbjogJ1RvIGJ1eSBhIG5ldyBwYWNrYWdlIHNlbGVjdCB0aGUgbWVudSBQYWNrYWdlcyA+IEJ1eSBwYWNrYWdlcyBhbmQgY29udGludWVzIGxveWFsdHkgeW91ciBjdXN0b21lcnMgd2l0aCBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdjaGVja05lZ2F0aXZlU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdZb3VyIG1lZGFscyBhcmUgb3ZlcicgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiAnMjAwJyxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTogJ2VzJyxcbiAgICAgICAgICAgICAgICBsYW5nX2RpY3Rpb25hcnk6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2NoYXJnZVNvb25FbWFpbFN1YmplY3RWYXInLCB0cmFkdWN0aW9uOiAnVHUgc2VydmljaW8gbWVuc3VhbCBkZSBjb21leWdhbmEgdGVybWluYXLDoSBwcm9udG8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdncmVldFZhcicsIHRyYWR1Y3Rpb246ICdIb2xhJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnd2VsY29tZU1zZ1ZhcicsIHRyYWR1Y3Rpb246ICdIZW1vcyByZWNpYmlkbyB1bmEgcGV0aWNpw7NuIHBhcmEgY2FtYmlhciB0dSBjb250cmFzZcOxYSwgc2kgZnVpc3RlIHR1IGhheiBjbGljayBlbiBlbCBib3TDs24gYWJham8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdidG5UZXh0VmFyJywgdHJhZHVjdGlvbjogJ0NhbWJpYXInIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdiZWZvcmVNc2dWYXInLCB0cmFkdWN0aW9uOiAnU2kgbm8gcXVpZXJlcyBjYW1iaWFyIGxhIGNvbnRyYXNlw7FhLCBpZ25vcmEgZXN0ZSBtZW5zYWplLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlZ2FyZFZhcicsIHRyYWR1Y3Rpb246ICdHcmFjaWFzLCBlcXVpcG8gY29tZXlnYW5hJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnZm9sbG93TXNnVmFyJywgdHJhZHVjdGlvbjogJ1NpZ3Vlbm9zIGVuIHJlZGVzIHNvY2lhbGVzJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyJywgdHJhZHVjdGlvbjogJ1JlY3VlcmRhIHF1ZSB0dSBzZXJ2aWNpbyBtZW5zdWFsIGRlIGNvbWV5Z2FuYSBwYXJhOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckNoYXJnZVNvb25Nc2dWYXIyJywgdHJhZHVjdGlvbjogJ0ZpbmFsaXphIGVsOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdpbnN0cnVjdGlvbmNoYXJnZVNvb25Nc2dWYXInLCB0cmFkdWN0aW9uOiAnU2kgZGVzZWFzIHNlZ3VpciB1c2FuZG8gdG9kYXMgbGFzIGZ1bmNpb25hbGlkYWRlcyBkZWwgc2lzdGVtYSwgaW5ncmVzYSBjb24gdHUgdXN1YXJpbyBvIGNvcnJlbyB5IHNlbGVjY2lvbmEgZWwgbWVuw7ogRXN0YWJsZWNpbWllbnRvcyA+IEFkbWluaXN0cmFjacOzbiA+IEVkaXRhciBlc3RhYmxlY2ltaWVudG8gPiAjIE1lc2FzJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyJywgdHJhZHVjdGlvbjogJ1JlY3VlcmRhIHF1ZSB0dSBzZXJ2aWNpbyBtZW5zdWFsIGRlIGNvbWV5Z2FuYSBwYXJhOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckV4cGlyZVNvb25Nc2dWYXIyJywgdHJhZHVjdGlvbjogJ0V4cGlyYSBlbDogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyMycsIHRyYWR1Y3Rpb246ICdTaSBkZXNlYXMgc2VndWlyIHVzYW5kbyB0b2RhcyBsYXMgZnVuY2lvbmFsaWRhZGVzIGRlbCBzaXN0ZW1hLCBpbmdyZXNhIGNvbiB0dSB1c3VhcmlvIG8gY29ycmVvIHkgc2VsZWNjaW9uYSBlbCBtZW7DuiBQYWdvcyA+IFBhZ28gbWVuc3VhbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2V4cGlyZVNvb25FbWFpbFN1YmplY3RWYXInLCB0cmFkdWN0aW9uOiAnVHUgc2VydmljaW8gY29tZXlnYW5hIGV4cGlyYXLDoSBwcm9udG8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlclJlc3RFeHBpcmVkVmFyJywgdHJhZHVjdGlvbjogJ1R1IHNlcnZpY2lvIG1lbnN1YWwgZGUgY29tZXlnYW5hIHBhcmE6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyUmVzdEV4cGlyZWRWYXIyJywgdHJhZHVjdGlvbjogJ2hhIGV4cGlyYWRvJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJSZXN0RXhwaXJlZFZhcjMnLCB0cmFkdWN0aW9uOiAnU2kgZGVzZWFzIHNlZ3VpciB1c2FuZG8gdG9kYXMgbGFzIGZ1bmNpb25hbGlkYWRlcyBkZWwgc2lzdGVtYSwgaW5ncmVzYSBjb24gdHUgdXN1YXJpbyBvIGNvcnJlbyB5IHNlbGVjY2lvbmEgbGEgb3BjacOzbiBQYWdvcyA+IFJlYWN0aXZhciAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZXN0RXhwaXJlZEVtYWlsU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdUdSBzZXJ2aWNpbyBkZSBjb21leWdhbmEgaGEgZXhwaXJhZG8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZXNldFBhc3N3b3JkU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdDYW1iaW8gZGUgY29udHJhc2XDsWEgZW4nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckN1cnJlbnRNZWRhbHMxJywgdHJhZHVjdGlvbjogJ1Byb250byB0ZXJtaW5hcsOhcyB0dXMgbWVkYWxsYXMgcGFyYSAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckN1cnJlbnRNZWRhbHMyJywgdHJhZHVjdGlvbjogJ8OabmljYW1lbnRlIHRpZW5lcyAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckN1cnJlbnRNZWRhbHMzJywgdHJhZHVjdGlvbjogJyBtZWRhbGxhcycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyQ3VycmVudE1lZGFsczQnLCB0cmFkdWN0aW9uOiAnU2VsZWNjaW9uYSBlbCBtZW7DuiBQYXF1ZXRlcyA+IENvbXByYSBkZSBwYXF1ZXRlcywgeSBjb250aW51YSBmaWRlbGl6YW5kbyBhIHR1cyBjbGllbnRlcyBjb24gY29tZXlnYW5hJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnY2hlY2tNZWRhbHNTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1R1cyBtZWRhbGxhcyBjb21leWdhbmEgZXN0w6FuIHByw7N4aW1hcyBhIHRlcm1pbmFyJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczEnLCB0cmFkdWN0aW9uOiAnSGFzIHRlcm1pbmFkbyBsYXMgbWVkYWxsYXMgcGFyYSAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlck5lZ2F0aXZlTWVkYWxzMicsIHRyYWR1Y3Rpb246ICdQZXJvIG5vIHRlIHByZW9jdXBlcyB0ZSBwcsOpc3RhbW9zIGxhcyAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlck5lZ2F0aXZlTWVkYWxzMycsIHRyYWR1Y3Rpb246ICdtZWRhbGxhcyBxdWUgaGFzIHVzYWRvLCBtaWVudHJhcyBhZHF1aWVyZXMgdW4gbnVldm8gcGFxdWV0ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyTmVnYXRpdmVNZWRhbHM0JywgdHJhZHVjdGlvbjogJ1BhcmEgY29tcHJhciB1biBudWV2byBwYXF1ZXRlIHNlbGVjY2lvbmEgZWwgbWVudSBQYXF1ZXRlcyA+IENvbXByYSBkZSBwYXF1ZXRlcywgeSBjb250aW51YSBmaWRlbGl6YW5kbyB0dSBjbGllbnRlIGNvbiBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdjaGVja05lZ2F0aXZlU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdUdXMgbWVkYWxsYXMgc2UgaGFuIGFjYWJhZG8nIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIGVtYWlsQ29udGVudHMuZm9yRWFjaCgoZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQpID0+IEVtYWlsQ29udGVudHMuaW5zZXJ0KGVtYWlsQ29udGVudCkpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBIb3VyIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9ob3VyLm1vZGVsJztcbmltcG9ydCB7IEhvdXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2hvdXJzLmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEhvdXJzKCkge1xuXG4gICAgaWYoSG91cnMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwICl7XG4gICAgICAgIGNvbnN0IGhvdXJzOiBIb3VyW10gPSBbXG4gICAgICAgICAgICB7IGhvdXI6JzAwOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMDozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDE6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzAxOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMjowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDI6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzAzOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMzozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDQ6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA0OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwNTowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDU6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA2OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwNjozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDc6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA3OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwODowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDg6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA5OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwOTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTA6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzEwOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxMTowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTE6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzEyOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxMjozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTM6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzEzOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNDowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTQ6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE1OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTY6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE2OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNzowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTc6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE4OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxODozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTk6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE5OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMDowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjA6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzIxOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjI6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzIyOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMzowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjM6MzAnIH1cbiAgICAgICAgXTtcblxuICAgICAgICBob3Vycy5mb3JFYWNoKChob3VyOkhvdXIpID0+IEhvdXJzLmluc2VydChob3VyKSk7XG4gICAgfVxufSIsImltcG9ydCB7IExhbmd1YWdlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IExhbmd1YWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9sYW5ndWFnZS5tb2RlbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTGFuZ3VhZ2VzKCl7XG4gICAgaWYoTGFuZ3VhZ2VzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCl7XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlczogTGFuZ3VhZ2VbXSA9IFt7XG4gICAgICAgICAgICBfaWQ6IFwiMTAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbGFuZ3VhZ2VfY29kZTogJ2VzJyxcbiAgICAgICAgICAgIG5hbWU6ICdFc3Bhw7FvbCcsXG4gICAgICAgICAgICBpbWFnZTogbnVsbFxuICAgICAgICB9LHtcbiAgICAgICAgICAgIF9pZDogXCIyMDAwXCIsXG4gICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBsYW5ndWFnZV9jb2RlOiAnZW4nLFxuICAgICAgICAgICAgbmFtZTogJ0VuZ2xpc2gnLFxuICAgICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICAgICAgfSx7XG4gICAgICAgICAgICBfaWQ6IFwiMzAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdmcicsXG4gICAgICAgICAgICBuYW1lOiAnRnJhbsOnYWlzJyxcbiAgICAgICAgICAgIGltYWdlOiBudWxsXG4gICAgICAgIH0se1xuICAgICAgICAgICAgX2lkOiBcIjQwMDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICBsYW5ndWFnZV9jb2RlOiAncHQnLFxuICAgICAgICAgICAgbmFtZTogJ1BvcnR1Z3Vlc2UnLFxuICAgICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICAgICAgfSx7XG4gICAgICAgICAgICBfaWQ6IFwiNTAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdpdCcsXG4gICAgICAgICAgICBuYW1lOiAnSXRhbGlhbm8nLFxuICAgICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICB9Lyose1xuICAgICAgICAgICAgX2lkOiBcIjYwMDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdhbCcsXG4gICAgICAgICAgICBuYW1lOiAnRGV1dHNjaCcsXG4gICAgICAgICAgICBpbWFnZTogbnVsbFxuICAgICAgICB9Ki9cbiAgICAgICAgXTtcblxuICAgICAgICBsYW5ndWFnZXMuZm9yRWFjaCgobGFuZ3VhZ2UgOiBMYW5ndWFnZSkgPT4gTGFuZ3VhZ2VzLmluc2VydChsYW5ndWFnZSkpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL3BhcmFtZXRlci5tb2RlbCc7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQYXJhbWV0ZXJzKCkge1xuICAgIGlmIChQYXJhbWV0ZXJzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAwJywgbmFtZTogJ3N0YXJ0X3BheW1lbnRfZGF5JywgdmFsdWU6ICcxJywgZGVzY3JpcHRpb246ICdpbml0aWFsIGRheSBvZiBtb250aCB0byB2YWxpZGF0ZSBjbGllbnQgcGF5bWVudCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjAwJywgbmFtZTogJ2VuZF9wYXltZW50X2RheScsIHZhbHVlOiAnNScsIGRlc2NyaXB0aW9uOiAnZmluYWwgZGF5IG9mIG1vbnRoIHRvIHZhbGlkYXRlIGNsaWVudCBwYXltZW50JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMDAnLCBuYW1lOiAnZnJvbV9lbWFpbCcsIHZhbHVlOiAnY29tZXlnYW5hIDxuby1yZXBseUBjb21leWdhbmEuY29tPicsIGRlc2NyaXB0aW9uOiAnZGVmYXVsdCBmcm9tIGFjY291bnQgZW1haWwgdG8gc2VuZCBtZXNzYWdlcycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAwJywgbmFtZTogJ2ZpcnN0X3BheV9kaXNjb3VudCcsIHZhbHVlOiAnNTAnLCBkZXNjcmlwdGlvbjogJ2Rpc2NvdW50IGluIHBlcmNlbnQgdG8gc2VydmljZSBmaXJzdCBwYXknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwMCcsIG5hbWU6ICdjb2xvbWJpYV90YXhfaXZhJywgdmFsdWU6ICcxOScsIGRlc2NyaXB0aW9uOiAnQ29sb21iaWEgdGF4IGl2YSB0byBtb250aGx5IGNvbWV5Z2FuYSBwYXltZW50JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MDAnLCBuYW1lOiAncGF5dV9zY3JpcHRfdGFnJywgdmFsdWU6ICdodHRwczovL21hZi5wYWdvc29ubGluZS5uZXQvd3MvZnAvdGFncy5qcz9pZD0nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3Igc2VjdXJpdHkgc2NyaXB0IGZvciBwYXl1IGZvcm0gaW4gPHNjcmlwdD4gdGFnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3MDAnLCBuYW1lOiAncGF5dV9ub3NjcmlwdF90YWcnLCB2YWx1ZTogJ2h0dHBzOi8vbWFmLnBhZ29zb25saW5lLm5ldC93cy9mcC90YWdzLmpzP2lkPScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBzZWN1cml0eSBzY3JpcHQgZm9yIHBheXUgZm9ybSBpbiA8bm9zY3JpcHQ+IHRhZycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnODAwJywgbmFtZTogJ3BheXVfc2NyaXB0X2NvZGUnLCB2YWx1ZTogJzgwMjAwJywgZGVzY3JpcHRpb246ICd1cmwgZW5kZWQgY29kZSBmb3Igc2VjdXJpdHkgdGFnIGZvciBwYXl1IGZvcm0gaW4gPHNjcmlwdD4gYW5kIDxub3NjcmlwdD4gdGFnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc5MDAnLCBuYW1lOiAncGF5dV9zY3JpcHRfb2JqZWN0X3RhZycsIHZhbHVlOiAnaHR0cHM6Ly9tYWYucGFnb3NvbmxpbmUubmV0L3dzL2ZwL2ZwLnN3Zj9pZD0nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3Igc2VjdXJpdHkgc2NyaXB0IGZvciBwYXl1IGZvcm0gaW4gPG9iamVjdD4gdGFnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMDAwJywgbmFtZTogJ3BheXVfcGF5bWVudHNfdXJsX3Rlc3QnLCB2YWx1ZTogJ2h0dHBzOi8vc2FuZGJveC5hcGkucGF5dWxhdGFtLmNvbS9wYXltZW50cy1hcGkvNC4wL3NlcnZpY2UuY2dpJywgZGVzY3JpcHRpb246ICd1cmwgZm9yIGNvbm5lY3QgdGVzdCBwYXl1IHBheW1lbnRzIEFQSScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjAwMCcsIG5hbWU6ICdwYXl1X3JlcG9ydHNfdXJsX3Rlc3QnLCB2YWx1ZTogJ2h0dHBzOi8vc2FuZGJveC5hcGkucGF5dWxhdGFtLmNvbS9yZXBvcnRzLWFwaS80LjAvc2VydmljZS5jZ2knLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgY29ubmVjdCB0ZXN0IHBheXUgcmVwb3J0cyBBUEknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMwMDAnLCBuYW1lOiAnaXBfcHVibGljX3NlcnZpY2VfdXJsJywgdmFsdWU6ICdodHRwczovL2FwaS5pcGlmeS5vcmc/Zm9ybWF0PWpzb24nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgcmV0cmlldmUgdGhlIGNsaWVudCBwdWJsaWMgaXAnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzExMDAnLCBuYW1lOiAnY29tcGFueV9uYW1lJywgdmFsdWU6ICdSZWFsYmluZCBTLkEuUycsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgY29tcGFueSBuYW1lIGZvciBpbnZvaWNlJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMTUwJywgbmFtZTogJ2NvbXBhbnlfcGhvbmUnLCB2YWx1ZTogJ1RlbDogKDU3IDEpIDY5NTk1MzcnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIHBob25lJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMjAwJywgbmFtZTogJ2NvbXBhbnlfYWRkcmVzcycsIHZhbHVlOiAnQ3JhIDYgIyA1OC00MyBPZiAyMDEnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIGNvbXBhbnkgYWRkcmVzcycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTMwMCcsIG5hbWU6ICdjb21wYW55X2NvdW50cnknLCB2YWx1ZTogJ0NvbG9tYmlhJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBjb3VudHJ5IGxvY2F0aW9uJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNDAwJywgbmFtZTogJ2NvbXBhbnlfY2l0eScsIHZhbHVlOiAnQm9nb3TDoScsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgY2l0eSBsb2NhdGlvbicgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUwMCcsIG5hbWU6ICdjb21wYW55X25pdCcsIHZhbHVlOiAnTklUOiA5MDEuMDM2LjU4NS0wJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBOSVQnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE1MTAnLCBuYW1lOiAnY29tcGFueV9yZWdpbWUnLCB2YWx1ZTogJ1LDqWdpbWVuIGNvbcO6bicsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgcmVnaW1lIGluIENvbG9tYmlhJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNTIwJywgbmFtZTogJ2NvbXBhbnlfY29udHJpYnV0aW9uJywgdmFsdWU6ICdObyBzb21vcyBncmFuZGVzIGNvbnRyaWJ1eWVudGVzJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBjb250cmlidXRpb24gaW4gQ29sb21iaWEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE1MzAnLCBuYW1lOiAnY29tcGFueV9yZXRhaW5lcicsIHZhbHVlOiAnTm8gc29tb3MgYXV0b3JldGVuZWRvcmVzIHBvciB2ZW50YXMgbmkgc2VydmljaW9zJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCByZXRlbnRpb24gaW4gQ29sb21iaWEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE1NDAnLCBuYW1lOiAnY29tcGFueV9hZ2VudF9yZXRhaW5lcicsIHZhbHVlOiAnTm8gc29tb3MgYWdlbnRlcyByZXRlbmVkb3JlcyBkZSBJVkEgZSBJQ0EnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIGl2YSBhbmQgaWNhIGFnZW50IHJldGVudGlvbiBpbiBDb2xvbWJpYScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTU1MCcsIG5hbWU6ICdpbnZvaWNlX2dlbmVyYXRlZF9tc2cnLCB2YWx1ZTogJ0ZhY3R1cmEgZW1pdGlkYSBwb3IgY29tcHV0YWRvcicsIGRlc2NyaXB0aW9uOiAnSW52b2ljZSBtZXNzYWdlIGZvciBpbnZvaWNlJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNjAwJywgbmFtZTogJ2l1cmVzdF91cmwnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3LmNvbWV5Z2FuYS5jb20nLCBkZXNjcmlwdGlvbjogJ2NvbWV5Z2FuYSB1cmwgcGFnZScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTY1MCcsIG5hbWU6ICdpdXJlc3RfdXJsX3Nob3J0JywgdmFsdWU6ICd3d3cuY29tZXlnYW5hLmNvbScsIGRlc2NyaXB0aW9uOiAnY29tZXlnYW5hIHVybCBwYWdlIHNob3J0JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNzAwJywgbmFtZTogJ2ZhY2Vib29rX2xpbmsnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9jb21leWdhbmEvJywgZGVzY3JpcHRpb246ICdmYWNlYm9vayBsaW5rIGZvciBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE4MDAnLCBuYW1lOiAndHdpdHRlcl9saW5rJywgdmFsdWU6ICdodHRwczovL3R3aXR0ZXIuY29tL0NvbWV5Z2FuYUFwcCcsIGRlc2NyaXB0aW9uOiAndHdpdHRlciBsaW5rIGZvciBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE5MDAnLCBuYW1lOiAnaW5zdGFncmFtX2xpbmsnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3Lmluc3RhZ3JhbS5jb20vY29tZXlnYW5hJywgZGVzY3JpcHRpb246ICdpbnN0YWdyYW0gbGluayBmb3IgY29tZXlnYW5hJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNjEwJywgbmFtZTogJ2l1cmVzdF9pbWdfdXJsJywgdmFsdWU6ICcgaHR0cDovL2FwcC5jb21leWdhbmEuY29tL2ltYWdlcy8nLCBkZXNjcmlwdGlvbjogJ2NvbWV5Z2FuYSBpbWFnZXMgdXJsJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMTAwJywgbmFtZTogJ2lwX3B1YmxpY19zZXJ2aWNlX3VybDInLCB2YWx1ZTogJ2h0dHBzOi8vaXBpbmZvLmlvL2pzb24nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgcmV0cmlldmUgdGhlIGNsaWVudCBwdWJsaWMgaXAgIzInIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMyMDAnLCBuYW1lOiAnaXBfcHVibGljX3NlcnZpY2VfdXJsMycsIHZhbHVlOiAnaHR0cHM6Ly9pZmNvbmZpZy5jby9qc29uJywgZGVzY3JpcHRpb246ICd1cmwgZm9yIHJldHJpZXZlIHRoZSBjbGllbnQgcHVibGljIGlwICMzJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc5MDAwJywgbmFtZTogJ3BheXVfaXNfcHJvZCcsIHZhbHVlOiAnZmFsc2UnLCBkZXNjcmlwdGlvbjogJ0ZsYWcgdG8gZW5hYmxlIHRvIHByb2QgcGF5dSBwYXltZW50JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc5MTAwJywgbmFtZTogJ3BheXVfdGVzdF9zdGF0ZScsIHZhbHVlOiAnQVBQUk9WRUQnLCBkZXNjcmlwdGlvbjogJ1Rlc3Qgc3RhdGUgZm9yIHBheXUgcGF5bWVudCB0cmFuc2FjdGlvbicgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnOTIwMCcsIG5hbWU6ICdwYXl1X3JlZmVyZW5jZV9jb2RlJywgdmFsdWU6ICdDWUdfUF8nLCBkZXNjcmlwdGlvbjogJ1ByZWZpeCBmb3IgcmVmZXJlbmNlIGNvZGUgb24gcGF5dSB0cmFuc2FjdGlvbnMnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIxMDAnLCBuYW1lOiAnbWF4X3VzZXJfcGVuYWx0aWVzJywgdmFsdWU6ICczJywgZGVzY3JpcHRpb246ICdNYXggbnVtYmVyIG9mIHVzZXIgcGVuYWx0aWVzJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMjAwJywgbmFtZTogJ3BlbmFsdHlfZGF5cycsIHZhbHVlOiAnMzAnLCBkZXNjcmlwdGlvbjogJ1VzZXIgcGVuYWx0eSBkYXlzJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc4MDAwJywgbmFtZTogJ2RhdGVfdGVzdF9tb250aGx5X3BheScsIHZhbHVlOiAnTWFyY2ggNSwgMjAxOCcsIGRlc2NyaXB0aW9uOiAnRGF0ZSB0ZXN0IGZvciBtb250aGx5IHBheW1lbnQgb2YgY29tZXlnYW5hIHNlcnZpY2UnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEwMDAwJywgbmFtZTogJ3BheXVfcGF5bWVudHNfdXJsX3Byb2QnLCB2YWx1ZTogJ2h0dHBzOi8vYXBpLnBheXVsYXRhbS5jb20vcGF5bWVudHMtYXBpLzQuMC9zZXJ2aWNlLmNnaScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBjb25uZWN0IHByb2QgcGF5dSBwYXltZW50cyBBUEknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMDAwJywgbmFtZTogJ3BheXVfcmVwb3J0c191cmxfcHJvZCcsIHZhbHVlOiAnaHR0cHM6Ly9hcGkucGF5dWxhdGFtLmNvbS9yZXBvcnRzLWFwaS80LjAvc2VydmljZS5jZ2knLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgY29ubmVjdCBwcm9kIHBheXUgcmVwb3J0cyBBUEknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzg1MDAnLCBuYW1lOiAnZGF0ZV90ZXN0X3JlYWN0aXZhdGUnLCB2YWx1ZTogJ0phbnVhcnkgNiwgMjAxOCcsIGRlc2NyaXB0aW9uOiAnRGF0ZSB0ZXN0IGZvciByZWFjdGl2YXRlIHJlc3RhdXJhbnQgZm9yIHBheScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwMDAnLCBuYW1lOiAndGVybXNfdXJsJywgdmFsdWU6ICdodHRwOi8vd3d3LmNvbWV5Z2FuYS5jb20vc2lnbmluLycsIGRlc2NyaXB0aW9uOiAndXJsIHRvIHNlZSB0ZXJtcyBhbmQgY29uZGl0aW9ucycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAwMDAnLCBuYW1lOiAncG9saWN5X3VybCcsIHZhbHVlOiAnaHR0cDovL3d3dy5jb21leWdhbmEuY29tL3NpZ251cC8nLCBkZXNjcmlwdGlvbjogJ3VybCB0byBzZWUgcHJpdmFjeSBwb2xpY3knIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwMDAwJywgbmFtZTogJ1FSX2NvZGVfdXJsJywgdmFsdWU6ICdodHRwOi8vd3d3LmNvbWV5Z2FuYS5jb20vZ2FuYS1wb3ItY29tZXInLCBkZXNjcmlwdGlvbjogJ1RoaXMgdXJsIHJlZGlyZWN0IHRvIHBhZ2UgdGhlIGNvbWV5Z2FuYS9kb3dubG9hZCB3aGVuIHNjYW5uZWQgUVIgY29kZSBmcm9tIG90aGVyIGFwcGxpY2F0aW9uJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMzAwJywgbmFtZTogJ3VzZXJfc3RhcnRfcG9pbnRzJywgdmFsdWU6ICcxJywgZGVzY3JpcHRpb246ICdVc2VyIHN0YXJ0IHBvaW50cycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTAwMCcsIG5hbWU6ICdtYXhfbWVkYWxzX3RvX2FkdmljZScsIHZhbHVlOiAnNTAnLCBkZXNjcmlwdGlvbjogJ01heCBtZWRhbHMgdG8gZXZhbHVhdGUgb24gY3JvbiB0byBzZW5kIGVtYWlsJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1NTAwJywgbmFtZTogJ21heF9kYXlzX3RvX2FkdmljZScsIHZhbHVlOiAnMicsIGRlc2NyaXB0aW9uOiAnTWF4IGRheSB0byBhZHZpY2UgcGVuZGluZyBtZWRhbHMnIH1cbiAgICAgICAgXTtcbiAgICAgICAgcGFyYW1ldGVycy5mb3JFYWNoKChwYXJhbWV0ZXI6IFBhcmFtZXRlcikgPT4gUGFyYW1ldGVycy5pbnNlcnQocGFyYW1ldGVyKSk7XG4gICAgfVxufSIsImltcG9ydCB7IFBheW1lbnRNZXRob2QgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL3BheW1lbnRNZXRob2QubW9kZWwnO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQYXltZW50TWV0aG9kcygpe1xuICAgIGlmKCBQYXltZW50TWV0aG9kcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDAgKXtcbiAgICAgICAgY29uc3QgcGF5bWVudHM6IFBheW1lbnRNZXRob2RbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiBcIjEwXCIsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnUEFZTUVOVF9NRVRIT0RTLkNBU0gnIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMFwiLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ1BBWU1FTlRfTUVUSE9EUy5DUkVESVRfQ0FSRCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjMwXCIsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnUEFZTUVOVF9NRVRIT0RTLkRFQklUX0NBUkQnIH0sXG4gICAgICAgICAgICB7IF9pZDogXCI0MFwiLCBpc0FjdGl2ZTogZmFsc2UsIG5hbWU6ICdQQVlNRU5UX01FVEhPRFMuT05MSU5FJyB9LFxuICAgICAgICBdO1xuICAgICAgICBwYXltZW50cy5mb3JFYWNoKCAoIHBheTpQYXltZW50TWV0aG9kICkgPT4gUGF5bWVudE1ldGhvZHMuaW5zZXJ0KCBwYXkgKSApO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2dlbmVyYWwvcG9pbnQubW9kZWwnO1xuaW1wb3J0IHsgUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BvaW50LmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFBvaW50cygpIHtcbiAgICBpZihQb2ludHMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwICl7XG4gICAgICAgIGNvbnN0IHBvaW50czogUG9pbnRbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiBcIjFcIiwgcG9pbnQ6IDEgfSwgXG4gICAgICAgICAgICB7IF9pZDogXCIyXCIsIHBvaW50OiAyIH0sIFxuICAgICAgICAgICAgeyBfaWQ6IFwiM1wiLCBwb2ludDogMyB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiNFwiLCBwb2ludDogNCB9LCBcbiAgICAgICAgICAgIHsgX2lkOiBcIjVcIiwgcG9pbnQ6IDUgfSwgXG4gICAgICAgICAgICB7IF9pZDogXCI2XCIsIHBvaW50OiA2IH0sIFxuICAgICAgICAgICAgeyBfaWQ6IFwiN1wiLCBwb2ludDogNyB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiOFwiLCBwb2ludDogOCB9LCBcbiAgICAgICAgICAgIHsgX2lkOiBcIjlcIiwgcG9pbnQ6IDkgfSwgXG4gICAgICAgICAgICB7IF9pZDogXCIxMFwiLCBwb2ludDogMTAgfVxuICAgICAgICBdO1xuICAgICAgICBwb2ludHMuZm9yRWFjaCgocG9pbnQ6UG9pbnQpID0+IFBvaW50cy5pbnNlcnQocG9pbnQpKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgVHlwZU9mRm9vZCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2dlbmVyYWwvdHlwZS1vZi1mb29kLm1vZGVsJztcbmltcG9ydCB7IFR5cGVzT2ZGb29kIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRUeXBlc09mRm9vZCgpIHtcbiAgICBpZiAoVHlwZXNPZkZvb2QuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHR5cGVzOiBUeXBlT2ZGb29kW10gPSBbXG4gICAgICAgICAgICB7IF9pZDogXCIxMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkdFUk1BTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjIwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQU1FUklDQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkFSQUJJQ19GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjQwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQVJHRU5USU5FX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiNTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5BU0lBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjYwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQlJBWklMSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiNzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5IT01FTUFERV9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjgwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQ0hJTEVBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjkwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQ0hJTkVTRV9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjEwMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkNPTE9NQklBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjExMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkNPUkVBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjEyMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELk1JRERMRV9FQVNURVJOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMTMwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuU1BBTklTSF9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE0MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkZSRU5DSF9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE1MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkZVU0lPTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE2MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkdPVVJNRVRfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxNzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5HUkVFS19GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE4MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELklORElBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjE5MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELklOVEVSTkFUSU9OQUxfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5JVEFMSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjEwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuSkFQQU5FU0VfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5MQVRJTl9BTUVSSUNBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjIzMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELk1FRElURVJSQU5FQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyNDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5NRVhJQ0FOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjUwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuT1JHQU5JQ19GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjI2MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlBFUlVWSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjcwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuRkFTVF9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjI4MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlRIQUlfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyOTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5WRUdFVEFSSUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzAwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuVklFVE5BTUVTRV9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjMxMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELk9USEVSU1wiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5CQVJCRUNVRVwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5QQVNUQVwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzNDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5GSVNIX0FORF9TRUFGT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjM1MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlBJWlpBXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjM2MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlNBTkRXSUNIRVNcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzcwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuU1VTSElcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzgwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuVkVHQU5JU01cIiB9XG4gICAgICAgIF07XG4gICAgICAgIHR5cGVzLmZvckVhY2goKHR5cGU6IFR5cGVPZkZvb2QpID0+IHsgVHlwZXNPZkZvb2QuaW5zZXJ0KHR5cGUpIH0pO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDY1BheW1lbnRNZXRob2QgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kLm1vZGVsJztcbmltcG9ydCB7IENjUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvY2MtcGF5bWVudC1tZXRob2RzLmNvbGxlY3Rpb24nXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQ2NQYXltZW50TWV0aG9kcygpIHtcbiAgICBpZiAoQ2NQYXltZW50TWV0aG9kcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT0gMCkge1xuICAgICAgICBjb25zdCBjY1BheW1lbnRNZXRob2RzOiBDY1BheW1lbnRNZXRob2RbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAnLCBpc19hY3RpdmU6IHRydWUsIG5hbWU6ICdWaXNhJywgcGF5dV9jb2RlOiAnVklTQScsIGxvZ29fbmFtZTogJ3Zpc2EnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwJywgaXNfYWN0aXZlOiB0cnVlLCBuYW1lOiAnTWFzdGVyY2FyZCcsIHBheXVfY29kZTogJ01BU1RFUkNBUkQnLCBsb2dvX25hbWU6ICdtYXN0ZXJjYXJkJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMCcsIGlzX2FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0FtZXJpY2FuIEV4cHJlc3MnLCBwYXl1X2NvZGU6ICdBTUVYJywgbG9nb19uYW1lOiAnYW1leCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAnLCBpc19hY3RpdmU6IHRydWUsIG5hbWU6ICdEaW5lcnMgQ2x1YicsIHBheXVfY29kZTogJ0RJTkVSUycsIGxvZ29fbmFtZTogJ2RpbmVycycgfVxuICAgICAgICBdO1xuICAgICAgICBjY1BheW1lbnRNZXRob2RzLmZvckVhY2goKGNjUGF5bWVudE1ldGhvZDogQ2NQYXltZW50TWV0aG9kKSA9PiB7IENjUGF5bWVudE1ldGhvZHMuaW5zZXJ0KGNjUGF5bWVudE1ldGhvZCkgfSk7XG4gICAgfVxufSIsImltcG9ydCB7IEludm9pY2VJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvcGF5bWVudC9pbnZvaWNlLWluZm8ubW9kZWwnO1xuaW1wb3J0IHsgSW52b2ljZXNJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2ludm9pY2VzLWluZm8uY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkSW52b2ljZXNJbmZvKCkge1xuICAgIGlmIChJbnZvaWNlc0luZm8uZmluZCgpLmN1cnNvci5jb3VudCgpID09IDApIHtcbiAgICAgICAgY29uc3QgaW52b2ljZXNJbmZvOiBJbnZvaWNlSW5mb1tdID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogJzEwMCcsXG4gICAgICAgICAgICAgICAgY291bnRyeV9pZDogJzE5MDAnLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fb25lOiAnMzEwMDAwMDg5NTA5JyxcbiAgICAgICAgICAgICAgICBwcmVmaXhfb25lOiAnSTRUJyxcbiAgICAgICAgICAgICAgICBzdGFydF9kYXRlX29uZTogbmV3IERhdGUoJzIwMTctMDgtMzFUMDA6MDA6MDAuMDBaJyksXG4gICAgICAgICAgICAgICAgZW5kX2RhdGVfb25lOiBuZXcgRGF0ZSgnMjAxNy0xMC0zMVQwMDowMDowMC4wMFonKSxcbiAgICAgICAgICAgICAgICBzdGFydF92YWx1ZV9vbmU6IDQyMjAwMCxcbiAgICAgICAgICAgICAgICBlbmRfdmFsdWVfb25lOiAxMDAwMDAwLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIHByZWZpeF90d286IG51bGwsXG4gICAgICAgICAgICAgICAgc3RhcnRfZGF0ZV90d286IG51bGwsXG4gICAgICAgICAgICAgICAgZW5kX2RhdGVfdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJ0X3ZhbHVlX3R3bzogbnVsbCxcbiAgICAgICAgICAgICAgICBlbmRfdmFsdWVfdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIGVuYWJsZV90d286IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRfdmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3RhcnRfbmV3X3ZhbHVlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgaW52b2ljZXNJbmZvLmZvckVhY2goKGludm9pY2VJbmZvOiBJbnZvaWNlSW5mbykgPT4gSW52b2ljZXNJbmZvLmluc2VydChpbnZvaWNlSW5mbykpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBCYWdQbGFuLCBQcmljZVBvaW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL3BvaW50cy9iYWctcGxhbi5tb2RlbCc7XG5pbXBvcnQgeyBCYWdQbGFucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2JhZy1wbGFucy5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRCYWdQbGFucygpIHtcbiAgICBpZiAoQmFnUGxhbnMuZmluZCgpLmN1cnNvci5jb3VudCgpID09IDApIHtcbiAgICAgICAgY29uc3QgYmFnUGxhbnM6IEJhZ1BsYW5bXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcxMDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdmcmVlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JBR19QTEFOLkZSRUUnLFxuICAgICAgICAgICAgICAgIHByaWNlOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5X2lkOiBcIjE5MDBcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5OiAnQ09QJ1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHZhbHVlX3BvaW50czogMzUsXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcyMDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdzbWFsbCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdCQUdfUExBTi5TTUFMTCcsXG4gICAgICAgICAgICAgICAgcHJpY2U6IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50cnlfaWQ6IFwiMTkwMFwiLFxuICAgICAgICAgICAgICAgICAgICBwcmljZTogNDU5MDAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5OiAnQ09QJ1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHZhbHVlX3BvaW50czogNTAsXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICczMDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdtZWRpdW0nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnQkFHX1BMQU4uTUVESVVNJyxcbiAgICAgICAgICAgICAgICBwcmljZTogW3tcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeV9pZDogXCIxOTAwXCIsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiA1MDkwMCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3k6ICdDT1AnXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgdmFsdWVfcG9pbnRzOiA4MCxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogJzQwMCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2xhcmdlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JBR19QTEFOLkxBUkdFJyxcbiAgICAgICAgICAgICAgICBwcmljZTogW3tcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeV9pZDogXCIxOTAwXCIsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiA1NDkwMCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3k6ICdDT1AnXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgdmFsdWVfcG9pbnRzOiAxMDAsXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGJhZ1BsYW5zLmZvckVhY2goKGJhZ1BsYW46IEJhZ1BsYW4pID0+IEJhZ1BsYW5zLmluc2VydChiYWdQbGFuKSk7XG4gICAgfVxufSIsImltcG9ydCB7IE1lbnVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSG91cnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvaG91cnMuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDdXJyZW5jaWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTGFuZ3VhZ2VzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2xhbmd1YWdlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWxDb250ZW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9lbWFpbC1jb250ZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDY1BheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kcy5jb2xsZWN0aW9uJ1xuaW1wb3J0IHsgUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BvaW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVHlwZXNPZkZvb2QgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvdHlwZS1vZi1mb29kLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQmFnUGxhbnMgfSBmcm9tIFwiLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLmNvbGxlY3Rpb25cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUZpeHR1cmVzKCkge1xuICAgIC8qKlxuICAgICAqIFJlbW92ZSBNZW51cyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgTWVudXMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBSb2xlcyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgUm9sZXMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBIb3VycyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgSG91cnMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBDdXJyZW5jaWVzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBDdXJyZW5jaWVzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgUGF5bWVudE1ldGhvZHMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIFBheW1lbnRNZXRob2RzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgQ291bnRyaWVzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBDb3VudHJpZXMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBMYW5ndWFnZXMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIExhbmd1YWdlcy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIEVtYWlsQ29udGVudHMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIEVtYWlsQ29udGVudHMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBQYXJhbWV0ZXJzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBQYXJhbWV0ZXJzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgQ2NQYXltZW50TWV0aG9kcyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgQ2NQYXltZW50TWV0aG9kcy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIFBvaW50cyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgUG9pbnRzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgVHlwZXNPZkZvb2QgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIFR5cGVzT2ZGb29kLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgQmFnUGxhbnMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIEJhZ1BsYW5zLnJlbW92ZSh7fSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLm1vZGVsJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcblxuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnNEZXRhaWxzRm9yRXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudF93b3JrOiBzdHJpbmcpIHtcbiAgICBpZiAoX2VzdGFibGlzaG1lbnRfd29yaykge1xuICAgICAgICByZXR1cm4gVXNlckRldGFpbHMuZmluZCh7IGVzdGFibGlzaG1lbnRfd29yazogX2VzdGFibGlzaG1lbnRfd29yayB9KTtcbiAgICB9XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJzQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50X3dvcms6IHN0cmluZykge1xuICAgIGlmIChfZXN0YWJsaXNobWVudF93b3JrKSB7XG4gICAgICAgIGxldCBfbFVzZXJEZXRhaWxzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjaGVjayhfZXN0YWJsaXNobWVudF93b3JrLCBTdHJpbmcpO1xuXG4gICAgICAgIFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRfd29yazogX2VzdGFibGlzaG1lbnRfd29yayB9KS5mZXRjaCgpLmZvckVhY2goZnVuY3Rpb24gPFVzZXJEZXRhaWw+KHVzZGV0LCBpbmRleCwgYXJyKSB7XG4gICAgICAgICAgICBfbFVzZXJEZXRhaWxzLnB1c2godXNkZXQudXNlcl9pZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogeyAkaW46IF9sVXNlckRldGFpbHMgfSB9KTtcbiAgICB9XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTWVudXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvbWVudS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXIubW9kZWwnO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0TWVudXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIE1lbnVzLmZpbmQoe30sIHsgc29ydDogeyBvcmRlcjogMSB9IH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2F1dGgvdXNlci5tb2RlbCc7XG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0Um9sZUNvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSb2xlcy5maW5kKHt9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0Um9sZUNvbGxhYm9yYXRvcnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJvbGVzLmZpbmQoe19pZDogeyAkaW46IFsgXCI2MDBcIiBdIH19KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnNEZXRhaWxzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHt9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlckRldGFpbHNCeVVzZXInLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gVXNlckRldGFpbHMuZmluZCh7IHVzZXJfaWQ6IF91c2VySWQgfSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJEZXRhaWxzQnlDdXJyZW50VGFibGUnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nLCBfdGFibGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IF9lc3RhYmxpc2htZW50SWQsIGN1cnJlbnRfdGFibGU6IF90YWJsZUlkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB1c2VycyBieSBlc3RhYmxpc2htZW50cyBJZFxuICogQHBhcmFtIHtzdHJpbmdbXX0gX3BFc3RhYmxpc2htZW50c0lkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0J5RXN0YWJsaXNobWVudHNJZCcsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRzSWQ6IFN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IHsgJGluOiBfcEVzdGFibGlzaG1lbnRzSWQgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdXNlcnMgZGV0YWlscyBieSBhZG1pbiB1c2VyXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VyRGV0YWlsc0J5QWRtaW5Vc2VyJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgbGV0IF9sRXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFycikge1xuICAgICAgICBfbEVzdGFibGlzaG1lbnRzSWQucHVzaChlc3RhYmxpc2htZW50Ll9pZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IHsgJGluOiBfbEVzdGFibGlzaG1lbnRzSWQgfSB9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlckRldGFpbHNCeUVzdGFibGlzaG1lbnRXb3JrJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgbGV0IF9sVXNlckRldGFpbDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuICAgIGlmIChfbFVzZXJEZXRhaWwpIHtcbiAgICAgICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IF9sVXNlckRldGFpbC5lc3RhYmxpc2htZW50X3dvcmsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudCBjb2xsYWJvcmF0b3JzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0NvbGxhYm9yYXRvcnNCeUVzdGFibGlzaG1lbnRzSWQnLCBmdW5jdGlvbiAoX3BFc3RhYmxpc2htZW50c0lkOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHsgZXN0YWJsaXNobWVudF93b3JrOiB7ICRpbjogX3BFc3RhYmxpc2htZW50c0lkIH0gfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJTZXR0aW5ncycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogdGhpcy51c2VySWQgfSwgeyBmaWVsZHM6IHsgdXNlcm5hbWU6IDEsIFwic2VydmljZXMucHJvZmlsZS5uYW1lXCI6IDEsIFwic2VydmljZXMuZmFjZWJvb2tcIjogMSwgXCJzZXJ2aWNlcy50d2l0dGVyXCI6IDEsIFwic2VydmljZXMuZ29vZ2xlXCI6IDEgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaXNoLCBnZXQgYWxsIHVzZXJzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VycycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7fSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGlzaC4gR2V0IHVzZXIgYnkgSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJCeVVzZXJJZCcsIGZ1bmN0aW9uIChfdXNySWQ6IHN0cmluZykge1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiBfdXNySWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIHVzZXJzIHdpdGggZXN0YWJsaXNobWVudCBhbmQgdGFibGUgSWQgY29uZGl0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IF9wRXN0YWJsaXNobWVudElkXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BUYWJsZUlkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VyQnlUYWJsZUlkJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudElkOiBzdHJpbmcsIF9wVGFibGVJZCkge1xuICAgIGNoZWNrKF9wRXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIGNoZWNrKF9wVGFibGVJZCwgU3RyaW5nKTtcbiAgICBsZXQgX2xVc2Vyczogc3RyaW5nW10gPSBbXTtcbiAgICBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IF9wRXN0YWJsaXNobWVudElkLCBjdXJyZW50X3RhYmxlOiBfcFRhYmxlSWQgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxVc2VyRGV0YWlsPih1c2VyLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9sVXNlcnMucHVzaCh1c2VyLnVzZXJfaWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiB7ICRpbjogX2xVc2VycyB9IH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB1c2VycyBieSBhZG1pbiB1c2VyIElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0J5QWRtaW5Vc2VyJywgZnVuY3Rpb24gKF9wVXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfcFVzZXJJZCwgU3RyaW5nKTtcbiAgICBsZXQgX2xFc3RhYmxpc2htZW50c0lkOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBfbFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IGNyZWF0aW9uX3VzZXI6IF9wVXNlcklkIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFycikge1xuICAgICAgICBfbEVzdGFibGlzaG1lbnRzSWQucHVzaChlc3RhYmxpc2htZW50Ll9pZCk7XG4gICAgfSk7XG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kKHsgY3VycmVudF9lc3RhYmxpc2htZW50OiB7ICRpbjogX2xFc3RhYmxpc2htZW50c0lkIH0gfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxVc2VyRGV0YWlsPih1c2VyRGV0YWlsLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9sVXNlcnMucHVzaCh1c2VyRGV0YWlsLnVzZXJfaWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiB7ICRpbjogX2xVc2VycyB9IH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB1c2VycyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BFc3RhYmxpc2htZW50SWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiAoX3BFc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wRXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIGxldCBfbFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgIFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZCh7IGN1cnJlbnRfZXN0YWJsaXNobWVudDogX3BFc3RhYmxpc2htZW50SWQgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxVc2VyRGV0YWlsPih1c2VyLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9sVXNlcnMucHVzaCh1c2VyLnVzZXJfaWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBVc2Vycy5maW5kKHsgX2lkOiB7ICRpbjogX2xVc2VycyB9IH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UVJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGdldEVzdGFibGlzaG1lbnRRUnNCeUFkbWluIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50UVJzQnlBZG1pbicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50UVJzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cywgRXN0YWJsaXNobWVudHNQcm9maWxlIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFBheW1lbnRIaXN0b3J5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkubW9kZWwnO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50cyB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZXN0YWJsaXNobWVudHMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb25zIGVzdGFibGlzaG1lbnRCeUVzdGFibGlzaG1lbnRXb3JrXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50QnlFc3RhYmxpc2htZW50V29yaycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHZhciB1c2VyX2RldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuICAgIGlmICh1c2VyX2RldGFpbCkge1xuICAgICAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IF9pZDogdXNlcl9kZXRhaWwuZXN0YWJsaXNobWVudF93b3JrIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gdG8gZmluZCBjdXJyZW50IGVzdGFibGlzaG1lbnRzIHdpdGggbm8gcGF5XG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnY3VycmVudEVzdGFibGlzaG1lbnRzTm9QYXllZCcsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuXG4gICAgbGV0IGN1cnJlbnREYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICBsZXQgY3VycmVudE1vbnRoOiBzdHJpbmcgPSAoY3VycmVudERhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCk7XG4gICAgbGV0IGN1cnJlbnRZZWFyOiBzdHJpbmcgPSBjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gICAgbGV0IGhpc3RvcnlQYXltZW50UmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBlc3RhYmxpc2htZW50c0luaXRpYWw6IHN0cmluZ1tdID0gW107XG5cbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkLCBpc0FjdGl2ZTogdHJ1ZSwgZnJlZURheXM6IGZhbHNlIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFycikge1xuICAgICAgICBlc3RhYmxpc2htZW50c0luaXRpYWwucHVzaChlc3RhYmxpc2htZW50Ll9pZCk7XG4gICAgfSk7XG5cbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5maW5kKHtcbiAgICAgICAgZXN0YWJsaXNobWVudElkczoge1xuICAgICAgICAgICAgJGluOiBlc3RhYmxpc2htZW50c0luaXRpYWxcbiAgICAgICAgfSwgbW9udGg6IGN1cnJlbnRNb250aCwgeWVhcjogY3VycmVudFllYXIsICRvcjogW3sgc3RhdHVzOiAnVFJBTlNBQ1RJT05fU1RBVFVTLkFQUFJPVkVEJyB9LCB7IHN0YXR1czogJ1RSQU5TQUNUSU9OX1NUQVRVUy5QRU5ESU5HJyB9XVxuICAgIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8UGF5bWVudEhpc3Rvcnk+KGhpc3RvcnlQYXltZW50LCBpbmRleCwgYXJyKSB7XG4gICAgICAgIGhpc3RvcnlQYXltZW50LmVzdGFibGlzaG1lbnRfaWRzLmZvckVhY2goKGVzdGFibGlzaG1lbnQpID0+IHtcbiAgICAgICAgICAgIGhpc3RvcnlQYXltZW50UmVzLnB1c2goZXN0YWJsaXNobWVudCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzLmZpbmQoeyBfaWQ6IHsgJG5pbjogaGlzdG9yeVBheW1lbnRSZXMgfSwgY3JlYXRpb25fdXNlcjogX3VzZXJJZCwgaXNBY3RpdmU6IHRydWUsIGZyZWVEYXlzOiBmYWxzZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB0byBmaW5kIGluYWN0aXZlIGVzdGFibGlzaG1lbnRzIGJ5IHVzZXJcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEluYWN0aXZlRXN0YWJsaXNobWVudHMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQsIGlzQWN0aXZlOiBmYWxzZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gYWN0aXZlIGVzdGFibGlzaG1lbnRzIGJ5IHVzZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBY3RpdmVFc3RhYmxpc2htZW50cycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCwgaXNBY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGVzdGFibGlzaG1lbnRzIGJ5IGlkXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudEJ5SWQnLCBmdW5jdGlvbiAoX3BJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3BJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IF9pZDogX3BJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudCBwcm9maWxlIGJ5IGVzdGFibGlzaG1lbnQgaWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRQcm9maWxlJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzUHJvZmlsZS5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudHMgYnkgaWRzXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBfcElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50c0J5SWRzJywgZnVuY3Rpb24gKF9wSWRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHsgX2lkOiB7ICRpbjogX3BJZHMgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHt9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgUmV3YXJkUG9pbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5tb2RlbCc7XG5pbXBvcnQgeyBSZXdhcmRQb2ludHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLXBvaW50LmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdXNlciByZXdhcmQgcG9pbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJfaWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFJld2FyZFBvaW50c0J5VXNlcklkJywgZnVuY3Rpb24gKF91c2VyX2lkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcl9pZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gUmV3YXJkUG9pbnRzLmZpbmQoeyBpZF91c2VyOiBfdXNlcl9pZCB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUmV3YXJkcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJld2FyZHMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkcycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBSZXdhcmRzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiByZXdhcmRzIGJ5IGVzdGFibGlzaG1lbnQgSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRSZXdhcmRzJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFJld2FyZHMuZmluZCh7IGVzdGFibGlzaG1lbnRzOiB7ICRpbjogW19lc3RhYmxpc2htZW50SWRdIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbnMgZ2V0UmV3YXJkc0J5RXN0YWJsaXNobWVudFdvcmtcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFJld2FyZHNCeUVzdGFibGlzaG1lbnRXb3JrJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgdmFyIHVzZXJfZGV0YWlsID0gVXNlckRldGFpbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQgfSk7XG4gICAgaWYgKHVzZXJfZGV0YWlsKSB7XG4gICAgICAgIHJldHVybiBSZXdhcmRzLmZpbmQoeyBlc3RhYmxpc2htZW50czogeyAkaW46IFt1c2VyX2RldGFpbC5lc3RhYmxpc2htZW50X3dvcmtdIH0gfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB0byByZXR1cm4gdGhlIHJld2FyZHMgXG4gKi9cbk1ldGVvcltcInB1Ymxpc2hDb21wb3NpdGVcIl0oJ2dldFJld2FyZHNUb0l0ZW1zJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG5cbiAgICBpZiAoX2VzdGFibGlzaG1lbnRJZCAhPT0gbnVsbCB8fCBfZXN0YWJsaXNobWVudElkICE9PSAnJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmluZCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSXRlbXMuZmluZCh7ICdlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkJzogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbe1xuICAgICAgICAgICAgICAgIGZpbmQoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmV3YXJkcy5maW5kKHsgaXRlbV9pZDogaXRlbS5faWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVGFibGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3RhYmxlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHRhYmxlcyB3aXRoIHVzZXIgY3JlYXRpb24gY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgndGFibGVzJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFRhYmxlcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gYWxsIHRhYmxlc1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0QWxsVGFibGVzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBUYWJsZXMuZmluZCh7fSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIHRhYmxlcyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VGFibGVzQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFRhYmxlcy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnRJZCwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB0YWJsZXMgYnkgZXN0YWJsaXNobWVudCBXb3JrXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VGFibGVzQnlFc3RhYmxpc2htZW50V29yaycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcbiAgICBpZiAoX2xVc2VyRGV0YWlsKSB7XG4gICAgICAgIHJldHVybiBUYWJsZXMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IF9sVXNlckRldGFpbC5lc3RhYmxpc2htZW50X3dvcmssIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgfVxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFdhaXRlckNhbGxEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3dhaXRlci1jYWxsLWRldGFpbC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gd2FpdGVyIGNhbGwgZGV0YWlscy4gdXNlcklkXG4gKiBAcGFyYW0geyBzdHJpbmcgfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdjb3VudFdhaXRlckNhbGxEZXRhaWxCeVVzcklkJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICByZXR1cm4gV2FpdGVyQ2FsbERldGFpbHMuZmluZCh7IHVzZXJfaWQ6IF91c2VySWQsIHN0YXR1czogeyAkaW46IFtcIndhaXRpbmdcIiwgXCJjb21wbGV0ZWRcIl0gfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB3YWl0ZXIgY2FsbCBkZXRhaWxzLCBmb3IgdG8gcGF5bWVudC5cbiAqIEBwYXJhbSB7IHN0cmluZyB9IF9lc3RhYmxpc2htZW50SWRcbiAqIEBwYXJhbSB7IHN0cmluZyB9IF90YWJsZUlkXG4gKiBAcGFyYW0geyBzdHJpbmcgfSBfdHlwZVxuICogQHBhcmFtIHsgc3RyaW5nW10gfSBfc3RhdHVzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdXYWl0ZXJDYWxsRGV0YWlsRm9yUGF5bWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcsXG4gIF90YWJsZUlkOiBzdHJpbmcsXG4gIF90eXBlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFdhaXRlckNhbGxEZXRhaWxzLmZpbmQoe1xuICAgIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50SWQsXG4gICAgdGFibGVfaWQ6IF90YWJsZUlkLFxuICAgIHR5cGU6IF90eXBlLFxuICAgIHN0YXR1czogeyAkaW46IFsnd2FpdGluZycsICdjb21wbGV0ZWQnXSB9XG4gIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHdhaXRlciBjYWxsIGRldGFpbHMuIHVzZXJJZCAoV2FpdGVyIGlkKVxuICogQHBhcmFtIHsgc3RyaW5nIH0gX3dhaXRlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCd3YWl0ZXJDYWxsRGV0YWlsQnlXYWl0ZXJJZCcsIGZ1bmN0aW9uIChfd2FpdGVySWQ6IHN0cmluZykge1xuICByZXR1cm4gV2FpdGVyQ2FsbERldGFpbHMuZmluZCh7IHdhaXRlcl9pZDogX3dhaXRlcklkLCBzdGF0dXM6IFwiY29tcGxldGVkXCIgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBjb3VudHJpZXNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2NvdW50cmllcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gQ291bnRyaWVzLmZpbmQoeyBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBDb3VudHJ5IGJ5IGVzdGFibGlzaG1lbnRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldENvdW50cnlCeUVzdGFibGlzaG1lbnRJZCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIGxldCBlc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuZmluZE9uZSh7IF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbiAgICBpZiAoZXN0YWJsaXNobWVudCkge1xuICAgICAgICByZXR1cm4gQ291bnRyaWVzLmZpbmQoeyBfaWQ6IGVzdGFibGlzaG1lbnQuY291bnRyeUlkIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBDb3VudHJpZXMuZmluZCh7IGlzX2FjdGl2ZTogdHJ1ZSB9KTs7XG4gICAgfVxufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBjb3VudHJpZXMgYnkgZXN0YWJsaXNobWVudHMgSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldENvdW50cmllc0J5RXN0YWJsaXNobWVudHNJZCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10pIHtcbiAgICBsZXQgX2lkczogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBfaWQ6IHsgJGluOiBfZXN0YWJsaXNobWVudHNJZCB9IH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcikge1xuICAgICAgICBfaWRzLnB1c2goZXN0YWJsaXNobWVudC5jb3VudHJ5SWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBDb3VudHJpZXMuZmluZCh7IF9pZDogeyAkaW46IF9pZHMgfSB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDdXJyZW5jaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGN1cnJlbmNpZXNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2N1cnJlbmNpZXMnLCAoKSA9PiBDdXJyZW5jaWVzLmZpbmQoeyBpc0FjdGl2ZTogdHJ1ZSB9KSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBjdXJyZW5jaWVzIGJ5IGVzdGFibGlzaG1lbnRzIElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRDdXJyZW5jaWVzQnlFc3RhYmxpc2htZW50c0lkJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50c0lkOiBzdHJpbmdbXSkge1xuICAgIGxldCBfaWRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IF9pZDogeyAkaW46IF9lc3RhYmxpc2htZW50c0lkIH0gfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgIF9pZHMucHVzaChlc3RhYmxpc2htZW50LmN1cnJlbmN5SWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBDdXJyZW5jaWVzLmZpbmQoeyBfaWQ6IHsgJGluOiBfaWRzIH0gfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGN1cnJlbmNpZXMgYnkgIHVzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0Q3VycmVuY2llc0J5VXNlcklkJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGxldCBfY3VycmVuY2llc0lkczogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcmdzKSB7XG4gICAgICAgIF9jdXJyZW5jaWVzSWRzLnB1c2goZXN0YWJsaXNobWVudC5jdXJyZW5jeUlkKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBDdXJyZW5jaWVzLmZpbmQoeyBfaWQ6IHsgJGluOiBfY3VycmVuY2llc0lkcyB9IH0pO1xufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gRW1haWxDb250ZW50c1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RW1haWxDb250ZW50cycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gRW1haWxDb250ZW50cy5maW5kKHt9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgSG91cnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvaG91cnMuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGhvdXJzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdob3VycycsICgpID0+IEhvdXJzLmZpbmQoKSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBMYW5ndWFnZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvbGFuZ3VhZ2UuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGxhbmd1YWdlc1xuICovXG5NZXRlb3IucHVibGlzaCggJ2xhbmd1YWdlcycsICgpID0+IExhbmd1YWdlcy5maW5kKCB7IGlzX2FjdGl2ZTogdHJ1ZSB9ICkgKTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRQYXJhbWV0ZXJzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBQYXJhbWV0ZXJzLmZpbmQoe30pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBQYXltZW50TWV0aG9kcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHBheW1lbnRNZXRob2RzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCAncGF5bWVudE1ldGhvZHMnLCAoKSA9PiBQYXltZW50TWV0aG9kcy5maW5kKCB7IGlzQWN0aXZlOiB0cnVlIH0gKSApO1xuXG4vKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBlc3RhYmxpc2htZW50IHBheW1lbnQgbWV0aG9kc1xuICovXG5NZXRlb3IucHVibGlzaCggJ2dldFBheW1lbnRNZXRob2RzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiggX3BFc3RhYmxpc2htZW50SWQ6c3RyaW5nICl7XG4gICAgY2hlY2soIF9wRXN0YWJsaXNobWVudElkLCBTdHJpbmcgKTtcbiAgICBsZXQgX2xFc3RhYmxpc2htZW50OiBFc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuZmluZE9uZSggeyBfaWQ6IF9wRXN0YWJsaXNobWVudElkIH0gKTtcbiAgICBpZiggX2xFc3RhYmxpc2htZW50ICl7XG4gICAgICAgIHJldHVybiBQYXltZW50TWV0aG9kcy5maW5kKCB7IF9pZDogeyAkaW46IF9sRXN0YWJsaXNobWVudC5wYXltZW50TWV0aG9kcyB9ICwgaXNBY3RpdmU6IHRydWUgfSApOyAgICAgICAgXG4gICAgfSBlbHNle1xuICAgICAgICByZXR1cm4gUGF5bWVudE1ldGhvZHMuZmluZCggeyBpc0FjdGl2ZTogdHJ1ZSB9ICk7XG4gICAgfVxufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQb2ludHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcG9pbnQuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHBvaW50c1xuICovXG5NZXRlb3IucHVibGlzaCgncG9pbnRzJywgKCkgPT4gUG9pbnRzLmZpbmQoKSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBUeXBlc09mRm9vZCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC90eXBlLW9mLWZvb2QuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHR5cGVzT2ZGb29kXG4gKi9cbk1ldGVvci5wdWJsaXNoKCd0eXBlc09mRm9vZCcsICgpID0+IFR5cGVzT2ZGb29kLmZpbmQoKSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBBZGRpdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvYWRkaXRpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGFkZGl0aW9ucyB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnYWRkaXRpb25zJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEFkZGl0aW9ucy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gYWRkaXRpb25zIHdpdGggZXN0YWJsaXNobWVudCBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfZXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdhZGRpdGlvbnNCeUVzdGFibGlzaG1lbnQnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX2VzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gQWRkaXRpb25zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBhZGR0aW9ucyBieSBpdGVtSWQgIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF9pdGVtSWRcbiovXG5NZXRlb3IucHVibGlzaCgnYWRkaXRpb25zQnlJdGVtJywgZnVuY3Rpb24gKF9pdGVtSWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9pdGVtSWQsIFN0cmluZyk7IFxuICAgIHZhciBpdGVtID0gSXRlbXMuZmluZE9uZSh7IF9pZDogX2l0ZW1JZCwgYWRkaXRpb25zSXNBY2NlcHRlZDogdHJ1ZSB9KTtcblxuICAgIGlmKHR5cGVvZiBpdGVtICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgYXV4ID0gQWRkaXRpb25zLmZpbmQoeyBfaWQ6IHsgJGluOiBpdGVtLmFkZGl0aW9ucyB9IH0pLmZldGNoKCk7XG4gICAgICAgIHJldHVybiBBZGRpdGlvbnMuZmluZCh7IF9pZDogeyAkaW46IGl0ZW0uYWRkaXRpb25zIH0gfSk7XG4gICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBBZGRpdGlvbnMuZmluZCh7IF9pZDogeyAkaW46IFtdIH0gfSk7XG4gICAgfVxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENhdGVnb3JpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvY2F0ZWdvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFNlY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3NlY3Rpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGNhdGVnb3JpZXMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2NhdGVnb3JpZXMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gQ2F0ZWdvcmllcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gY2F0ZWdvcmllcyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnY2F0ZWdvcmllc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBsZXQgX3NlY3Rpb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG5cbiAgICBTZWN0aW9ucy5jb2xsZWN0aW9uLmZpbmQoeyBlc3RhYmxpc2htZW50czogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxTdHJpbmc+KHMsIGluZGV4LCBhcnIpIHtcbiAgICAgICAgX3NlY3Rpb25zLnB1c2gocy5faWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBDYXRlZ29yaWVzLmZpbmQoeyBzZWN0aW9uOiB7ICRpbjogX3NlY3Rpb25zIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGl0ZW1zIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdpdGVtcycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBJdGVtcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBhZG1pbiBhY3RpdmUgaXRlbXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBZG1pbkFjdGl2ZUl0ZW1zJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkLCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGl0ZW1zIHdpdGggZXN0YWJsaXNobWVudCBjb25kaXRpb25cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2l0ZW1zQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBlc3RhYmxpc2htZW50cyBpdGVtc1xuICogQHBhcmFtIHtzdHJpbmdbXX0gX3BFc3RhYmxpc2htZW50SWRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRJdGVtc0J5RXN0YWJsaXNobWVudElkcycsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRJZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBfcEVzdGFibGlzaG1lbnRJZHMgfSB9KTtcbn0pO1xuXG5cbi8qKlxuICogTWVldG9yIHB1YmxpY2F0aW9uIHJldHVybiBpdGVtcyBieSBlc3RhYmxpc2htZW50IHdvcmtcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRJdGVtc0J5VXNlckVzdGFibGlzaG1lbnRXb3JrJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgbGV0IF9sVXNlckRldGFpbDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuXG4gICAgaWYgKF9sVXNlckRldGFpbCkge1xuICAgICAgICBpZiAoX2xVc2VyRGV0YWlsLmVzdGFibGlzaG1lbnRfd29yaykge1xuICAgICAgICAgICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBbX2xVc2VyRGV0YWlsLmVzdGFibGlzaG1lbnRfd29ya10gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn0pO1xuXG5cbi8qKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gaXRlbXMgc29ydGVkIGJ5IGl0ZW0gbmFtZVxuICovXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gaXRlbXMgd2l0aCBlc3RhYmxpc2htZW50IGNvbmRpdGlvblxuICovXG5NZXRlb3IucHVibGlzaCgnaXRlbXNCeUVzdGFibGlzaG1lbnRTb3J0ZWRCeU5hbWUnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX2VzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gSXRlbXMuZmluZCh7ICdlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkJzogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSwgeyBzb3J0OiB7IG5hbWU6IDEgfSB9KTtcbn0pO1xuXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE9wdGlvblZhbHVlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9vcHRpb24tdmFsdWUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIG9wdGlvbiB2YWx1ZXMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEFkbWluT3B0aW9uVmFsdWVzJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIE9wdGlvblZhbHVlcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBvcHRpb24gdmFsdWVzIHdpdGggb3B0aW9uIGlkcyBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRPcHRpb25WYWx1ZXNCeU9wdGlvbklkcycsIGZ1bmN0aW9uIChfcE9wdGlvbklkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gT3B0aW9uVmFsdWVzLmZpbmQoeyBvcHRpb25faWQ6IHsgJGluOiBfcE9wdGlvbklkcyB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9vcHRpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gb3B0aW9uIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBZG1pbk9wdGlvbnMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gT3B0aW9ucy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50cyBvcHRpb25zIFxuICogQHBhcmFtIHtzdHJpbmd9IF9lc3RhYmxpc2htZW50SWRcbiovXG5NZXRlb3IucHVibGlzaCgnb3B0aW9uc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gT3B0aW9ucy5maW5kKHsgZXN0YWJsaXNobWVudHM6IHsgJGluOiBfZXN0YWJsaXNobWVudHNJZCB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFNlY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3NlY3Rpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gc2VjdGlvbiB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnc2VjdGlvbnMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gU2VjdGlvbnMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gZXN0YWJsaXNobWVudHMgc2VjdGlvbnMgXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuKi9cbk1ldGVvci5wdWJsaXNoKCdzZWN0aW9uc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIHJldHVybiBTZWN0aW9ucy5maW5kKHsgZXN0YWJsaXNobWVudHM6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbk1ldGVvci5wdWJsaXNoKCdnZXRTZWN0aW9ucycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gU2VjdGlvbnMuZmluZCh7fSk7XG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgU3ViY2F0ZWdvcmllcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9zdWJjYXRlZ29yeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFNlY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3NlY3Rpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDYXRlZ29yaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L2NhdGVnb3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHN1YmNhdGVnb3JpZXMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ3N1YmNhdGVnb3JpZXMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gU3ViY2F0ZWdvcmllcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gc3ViY2F0ZWdvcmllcyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX2VzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnc3ViY2F0ZWdvcmllc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBsZXQgX3NlY3Rpb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBfY2F0ZWdvcmllczogc3RyaW5nW10gPSBbXTtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuXG4gICAgU2VjdGlvbnMuY29sbGVjdGlvbi5maW5kKHsgZXN0YWJsaXNobWVudHM6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSwgaXNfYWN0aXZlOiB0cnVlIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8U3RyaW5nPihzLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9zZWN0aW9ucy5wdXNoKHMuX2lkKTtcbiAgICB9KTtcbiAgICBDYXRlZ29yaWVzLmNvbGxlY3Rpb24uZmluZCh7IHNlY3Rpb246IHsgJGluOiBfc2VjdGlvbnMgfSwgaXNfYWN0aXZlOiB0cnVlIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8U3RyaW5nPihjLCBpbmRleCwgYXJyKSB7XG4gICAgICAgIF9jYXRlZ29yaWVzLnB1c2goYy5faWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBTdWJjYXRlZ29yaWVzLmZpbmQoeyBjYXRlZ29yeTogeyAkaW46IF9jYXRlZ29yaWVzIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENjUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvY2MtcGF5bWVudC1tZXRob2RzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRDY1BheW1lbnRNZXRob2RzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBDY1BheW1lbnRNZXRob2RzLmZpbmQoeyBpc19hY3RpdmU6IHRydWUgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEN5Z0ludm9pY2VzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2N5Zy1pbnZvaWNlcy5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gSW52b2ljZXNJbmZvXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRBbGxDeWdJbnZvaWNlcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gQ3lnSW52b2ljZXMuZmluZCh7fSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldEN5Z0ludm9pY2VCeVVzZXInLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gQ3lnSW52b2ljZXMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEludm9pY2VzSW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBJbnZvaWNlc0luZm9cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEludm9pY2VzSW5mb0J5Q291bnRyeScsIGZ1bmN0aW9uIChjb3VudHJ5SWQ6IHN0cmluZykge1xuICAgIHJldHVybiBJbnZvaWNlc0luZm8uZmluZCh7IGNvdW50cnlfaWQ6IGNvdW50cnlJZCB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQYXltZW50c0hpc3RvcnkgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRIaXN0b3J5UGF5bWVudHNCeVVzZXInLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIFBheW1lbnRzSGlzdG9yeS5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZH0sIHsgc29ydDogeyBjcmVhdGlvbl9kYXRlOiAtMSB9IH0pO1xufSk7ICIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUGF5bWVudFRyYW5zYWN0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LXRyYW5zYWN0aW9uLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBFbWFpbENvbnRlbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRUcmFuc2FjdGlvbnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFBheW1lbnRUcmFuc2FjdGlvbnMuZmluZCh7fSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFRyYW5zYWN0aW9uc0J5VXNlcicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gUGF5bWVudFRyYW5zYWN0aW9ucy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pOyIsImltcG9ydCB7IEJhZ1BsYW4gfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9wb2ludHMvYmFnLXBsYW4ubW9kZWwnO1xuaW1wb3J0IHsgQmFnUGxhbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9iYWctcGxhbnMuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGJhZyBwbGFuc1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEJhZ1BsYW5zJywgZnVuY3Rpb24gKCkge1xuICAgIGxldCBfbEJhZ3NQbGFucyA9IEJhZ1BsYW5zLmZpbmQoe30pO1xuICAgIHJldHVybiBfbEJhZ3NQbGFucztcbn0pO1xuXG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGJhZyBwbGFuc1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEJhZ1BsYW5zTm9GcmVlJywgZnVuY3Rpb24gKCkge1xuICAgIGxldCBfbEJhZ3NQbGFucyA9IEJhZ1BsYW5zLmZpbmQoeyBuYW1lOiB7ICRuaW46IFsnZnJlZSddIH0gfSk7XG4gICAgcmV0dXJuIF9sQmFnc1BsYW5zO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50TWVkYWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gZXN0YWJsaXNobWVudCBtZWRhbHMgYnkgdXNlciBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wVXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50TWVkYWxzQnlVc2VySWQnLCBmdW5jdGlvbiAoX3BVc2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wVXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50TWVkYWxzLmZpbmQoeyB1c2VyX2lkOiBfcFVzZXJJZCB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnRzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IHBvaW50cyBieSBpZHNcbiAqIEBwYXJhbSB7c3RyaW5nW119IF9wSWRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50UG9pbnRzQnlJZHMnLCBmdW5jdGlvbiAoX3BJZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRQb2ludHMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IHsgJGluOiBfcElkcyB9IH0pO1xufSk7XG5cblxuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IHBvaW50cyBieSB1c2VyXG4gKiBAcGFyYW0ge3N0cmluZ30gdXNlcl9pZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudFBvaW50c0J5VXNlcicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudFBvaW50cy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KVxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IE5lZ2F0aXZlUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnRzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IG5lZ2F0aXZlIHBvaW50cyBieSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldE5lZ2F0aXZlUG9pbnRzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiAoX3BJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIE5lZ2F0aXZlUG9pbnRzLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBfcElkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIG5lZ2F0aXZlIHBvaXRucyBieSBlc3RhYmxpc2htZW50cyBhcnJheVxuICovXG5cbk1ldGVvci5wdWJsaXNoKCdnZXROZWdhdGl2ZVBvaW50c0J5RXN0YWJsaXNobWVudHNBcnJheScsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudEFycmF5OiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBOZWdhdGl2ZVBvaW50cy5maW5kKHsgXCJlc3RhYmxpc2htZW50X2lkXCI6IHsgJGluOiBfZXN0YWJsaXNobWVudEFycmF5IH0gfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IFJld2FyZHNDb25maXJtYXRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbi5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV3YXJkcyBjb25maXJtYXRpb24gYnkgZXN0YWJsaXNobWVudCBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wRXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRSZXdhcmRzQ29uZmlybWF0aW9uc0J5RXN0YWJsaXNobWVudElkJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfcEVzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gUmV3YXJkc0NvbmZpcm1hdGlvbnMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IF9wRXN0YWJsaXNobWVudElkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJld2FyZHMgY29uZmlybWF0aW9uIGJ5IGVzdGFibGlzaG1lbnRzIGlkc1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkc0NvbmZpcm1hdGlvbnNCeUVzdGFibGlzaG1lbnRzSWRzJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudHNJZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIFJld2FyZHNDb25maXJtYXRpb25zLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiB7ICRpbjogX3BFc3RhYmxpc2htZW50c0lkcyB9IH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBSZXdhcmRIaXN0b3JpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9yZXdhcmQtaGlzdG9yeS5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV3YXJkcyBoaXN0b3JpZXMgYnkgZXN0YWJsaXNobWVudCBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wRXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRSZXdhcmRIaXN0b3JpZXNCeUVzdGFibGlzaG1lbnRJZCcsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3BFc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFJld2FyZEhpc3Rvcmllcy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogX3BFc3RhYmxpc2htZW50SWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV3YXJkcyBoaXN0b3JpZXMgYnkgdXNlciBpZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkSGlzdG9yaWVzQnlVc2VySWQnLCBmdW5jdGlvbiAoX3BVc2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wVXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBSZXdhcmRIaXN0b3JpZXMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF9wVXNlcklkIH0pO1xufSk7IiwiaW1wb3J0IHsgRXN0YWJsaXNobWVudHMsIEVzdGFibGlzaG1lbnRzUHJvZmlsZSB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBTZWN0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9zZWN0aW9uLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ2F0ZWdvcmllcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9jYXRlZ29yeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFN1YmNhdGVnb3JpZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc3ViY2F0ZWdvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBBZGRpdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvYWRkaXRpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9pdGVtLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBPcmRlcnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvb3JkZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBUYWJsZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBXYWl0ZXJDYWxsRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC93YWl0ZXItY2FsbC1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDY1BheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kcy5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBheW1lbnRUcmFuc2FjdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC10cmFuc2FjdGlvbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE9yZGVySGlzdG9yaWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLWhpc3RvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IExhbmd1YWdlcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFJld2FyZFBvaW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSZXdhcmRzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgT3B0aW9uVmFsdWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L29wdGlvbi12YWx1ZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvb3B0aW9uLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSW52b2ljZXNJbmZvIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2ludm9pY2VzLWluZm8uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludHMuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBOZWdhdGl2ZVBvaW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL25lZ2F0aXZlLXBvaW50cy5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZWRiaW5kZXhlcygpIHtcblxuICAgIC8vIEVzdGFibGlzaG1lbnQgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgbmFtZTogMSB9KTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzQWN0aXZlOiAxIH0pO1xuXG4gICAgLy8gRXN0YWJsaXNobWVudCBQcm9maWxlIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIEVzdGFibGlzaG1lbnRzUHJvZmlsZS5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRfaWQ6IDEgfSk7XG5cbiAgICAvLyBVc2VyIENvbGxlY3Rpb25zIEluZGV4ZXNcbiAgICBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHVzZXJfaWQ6IDEgfSk7XG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X3dvcms6IDEgfSk7XG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IDEsIGN1cnJlbnRfdGFibGU6IDEgfSk7XG5cbiAgICAvLyBTZWN0aW9uIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIFNlY3Rpb25zLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY3JlYXRpb25fdXNlcjogMSB9KTtcbiAgICBTZWN0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuXG4gICAgLy8gQ2F0ZWdvcnkgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgQ2F0ZWdvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgQ2F0ZWdvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHNlY3Rpb246IDEgfSk7XG5cbiAgICAvLyBTdWJjYXRlZ29yeSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBTdWJjYXRlZ29yaWVzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY3JlYXRpb25fdXNlcjogMSB9KTtcbiAgICBTdWJjYXRlZ29yaWVzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY2F0ZWdvcnk6IDEgfSk7XG5cbiAgICAvLyBBZGRpdGlvbiBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBBZGRpdGlvbnMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIEFkZGl0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuXG4gICAgLy8gSXRlbSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBJdGVtcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgSXRlbXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBzZWN0aW9uSWQ6IDEgfSk7XG4gICAgSXRlbXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50czogMSB9KTtcblxuICAgIC8vIFBheW1lbnRNZXRob2QgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUGF5bWVudE1ldGhvZHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpc0FjdGl2ZTogMSB9KTtcblxuICAgIC8vIFBheW1lbnRzSGlzdG9yeSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkczogMSB9KTtcbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIFBheW1lbnRzSGlzdG9yeS5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX2RhdGU6IDEgfSk7XG5cbiAgICAvLyBUYWJsZXMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgVGFibGVzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgUVJfY29kZTogMSB9KTtcbiAgICBUYWJsZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gT3JkZXJzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIE9yZGVycy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRfaWQ6IDEgfSk7XG4gICAgT3JkZXJzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgdGFibGVJZDogMSB9KTtcbiAgICBPcmRlcnMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBzdGF0dXM6IDEgfSk7XG5cbiAgICAvLyBXYWl0ZXJDYWxsRGV0YWlscyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBXYWl0ZXJDYWxsRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHN0YXR1czogMSB9KTtcbiAgICBXYWl0ZXJDYWxsRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHVzZXJfaWQ6IDEgfSk7XG4gICAgV2FpdGVyQ2FsbERldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxLCB0YWJsZV9pZDogMSwgdHlwZTogMSB9KTtcblxuICAgIC8vIENjUGF5bWVudE1ldGhvZHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgQ2NQYXltZW50TWV0aG9kcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzX2FjdGl2ZTogMSB9KTtcblxuICAgIC8vIFBheW1lbnRUcmFuc2FjdGlvbnMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUGF5bWVudFRyYW5zYWN0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG5cbiAgICAvLyBPcmRlckhpc3RvcmllcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBPcmRlckhpc3Rvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGN1c3RvbWVyX2lkOiAxLCBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gQ291bnRyaWVzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIENvdW50cmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzX2FjdGl2ZTogMSB9KTtcblxuICAgIC8vIExhbmd1YWdlcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBMYW5ndWFnZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpc19hY3RpdmU6IDEgfSk7XG5cbiAgICAvLyBSZXdhcmRQb2ludHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUmV3YXJkUG9pbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgaWRfdXNlcjogMSB9KTtcblxuICAgIC8vIFJld2FyZHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUmV3YXJkcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuICAgIFJld2FyZHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpdGVtX2lkOiAxIH0pO1xuXG4gICAgLy8gUGFyYW1ldGVycyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgbmFtZTogMSB9KTtcblxuICAgIC8vIE9wdGlvblZhbHVlcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBPcHRpb25WYWx1ZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIE9wdGlvblZhbHVlcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IG9wdGlvbl9pZDogMSB9KTtcblxuICAgIC8vIE9wdGlvbnMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgT3B0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgT3B0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuXG4gICAgLy8gSW52b2ljZXNJbmZvIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIEludm9pY2VzSW5mby5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNvdW50cnlfaWQ6IDEgfSk7XG5cbiAgICAvLyBFc3RhYmxpc2htZW50UG9pbnRzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIEVzdGFibGlzaG1lbnRQb2ludHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gTmVnYXRpdmVQb2ludHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgTmVnYXRpdmVQb2ludHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xufSIsImltcG9ydCB7IFN5bmNlZENyb24gfSBmcm9tICdtZXRlb3IvcGVyY29sYXRlOnN5bmNlZC1jcm9uJztcblN5bmNlZENyb24uY29uZmlnKHtcbiAgICAvLyBMb2cgam9iIHJ1biBkZXRhaWxzIHRvIGNvbnNvbGVcbiAgICBsb2c6IHRydWUsXG5cbiAgICAvLyBVc2UgYSBjdXN0b20gbG9nZ2VyIGZ1bmN0aW9uIChkZWZhdWx0cyB0byBNZXRlb3IncyBsb2dnaW5nIHBhY2thZ2UpXG4gICAgbG9nZ2VyOiBudWxsLFxuXG4gICAgLy8gTmFtZSBvZiBjb2xsZWN0aW9uIHRvIHVzZSBmb3Igc3luY2hyb25pc2F0aW9uIGFuZCBsb2dnaW5nXG4gICAgY29sbGVjdGlvbk5hbWU6ICdjcm9uX2hpc3RvcnknLFxuXG4gICAgLy8gRGVmYXVsdCB0byB1c2luZyBsb2NhbFRpbWVcbiAgICB1dGM6IGZhbHNlLFxuXG4gICAgLypcbiAgICAgIFRUTCBpbiBzZWNvbmRzIGZvciBoaXN0b3J5IHJlY29yZHMgaW4gY29sbGVjdGlvbiB0byBleHBpcmVcbiAgICAgIE5PVEU6IFVuc2V0IHRvIHJlbW92ZSBleHBpcnkgYnV0IGVuc3VyZSB5b3UgcmVtb3ZlIHRoZSBpbmRleCBmcm9tXG4gICAgICBtb25nbyBieSBoYW5kXG5cbiAgICAgIEFMU086IFN5bmNlZENyb24gY2FuJ3QgdXNlIHRoZSBgX2Vuc3VyZUluZGV4YCBjb21tYW5kIHRvIG1vZGlmeVxuICAgICAgdGhlIFRUTCBpbmRleC4gVGhlIGJlc3Qgd2F5IHRvIG1vZGlmeSB0aGUgZGVmYXVsdCB2YWx1ZSBvZlxuICAgICAgYGNvbGxlY3Rpb25UVExgIGlzIHRvIHJlbW92ZSB0aGUgaW5kZXggYnkgaGFuZCAoaW4gdGhlIG1vbmdvIHNoZWxsXG4gICAgICBydW4gYGRiLmNyb25IaXN0b3J5LmRyb3BJbmRleCh7c3RhcnRlZEF0OiAxfSlgKSBhbmQgcmUtcnVuIHlvdXJcbiAgICAgIHByb2plY3QuIFN5bmNlZENyb24gd2lsbCByZWNyZWF0ZSB0aGUgaW5kZXggd2l0aCB0aGUgdXBkYXRlZCBUVEwuXG4gICAgKi9cbiAgICBjb2xsZWN0aW9uVFRMOiAxNzI4MDBcbn0pOyIsImltcG9ydCB7IFN5bmNlZENyb24gfSBmcm9tICdtZXRlb3IvcGVyY29sYXRlOnN5bmNlZC1jcm9uJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRW1haWwgfSBmcm9tICdtZXRlb3IvZW1haWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3JvbnMoKSB7XG4gIGxldCBhY3RpdmVDb3VudHJpZXMgPSBDb3VudHJpZXMuY29sbGVjdGlvbi5maW5kKHsgaXNfYWN0aXZlOiB0cnVlIH0pLmZldGNoKCk7XG4gIGFjdGl2ZUNvdW50cmllcy5mb3JFYWNoKGNvdW50cnkgPT4ge1xuXG4gICAgLyoqVGhpcyBjcm9uIGV2YWx1YXRlcyB0aGUgY3VycmVudCBtZWRhbHMgb2YgdGhlIGVzdGFibGlzaG1lbnQgdG8gYWR2aWNlIHRvIHB1cmNoYXNlIG1vcmUqL1xuICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgIG5hbWU6ICdjcm9uQ2hlY2tDdXJyZW50TWVkYWxzLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uQ2hlY2tDdXJyZW50TWVkYWxzKTtcbiAgICAgIH0sXG4gICAgICBqb2I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTWV0ZW9yLmNhbGwoJ2NoZWNrQ3VycmVudE1lZGFscycsIGNvdW50cnkuX2lkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLyoqXG4gICAgICogVGhpcyBjcm9uIGV2YWx1YXRlcyBkZSBuZWdhdGl2ZSBtZWRhbHMgb2YgdGhlIGVzdGFibGlzaG1lbnQgdG8gYWR2aXRlIHRvIHBheSBwZW5kaW5nIFxuICAgICovXG4gICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgbmFtZTogJ2Nyb25DaGVja05lZ2F0aXZlTWVkYWxzLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uQ2hlY2tOZWdhdGl2ZU1lZGFscyk7XG4gICAgICB9LFxuICAgICAgam9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIE1ldGVvci5jYWxsKCdjaGVja05lZ2F0aXZlTWVkYWxzJywgY291bnRyeS5faWQpO1xuICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvKipcbiAgICAqIFRoaXMgY3JvbiBldmFsdWF0ZXMgdGhlIGZyZWVEYXlzIGZsYWcgb24gZXN0YWJsaXNobWVudHMgd2l0aCB2YWx1ZSB0cnVlLCBhbmQgY2hhbmdlIGl0IHRvIGZhbHNlXG4gICAgKi9cbiAgICAvKipcbiAgICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgIG5hbWU6ICdjcm9uQ2hhbmdlRnJlZURheXMuJyArIGNvdW50cnkubmFtZSxcbiAgICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICAgcmV0dXJuIHBhcnNlci5jcm9uKGNvdW50cnkuY3JvbkNoYW5nZUZyZWVEYXlzKTtcbiAgICAgICB9LFxuICAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgTWV0ZW9yLmNhbGwoJ2NoYW5nZUZyZWVEYXlzVG9GYWxzZScsIGNvdW50cnkuX2lkKTtcbiAgICAgICB9XG4gICAgIH0pO1xuICAgICAgKi9cblxuICAgIC8qKlxuICAgICogVGhpcyBjcm9uIHNlbmRzIGVtYWlsIHRvIHdhcm4gdGhlIGNoYXJnZSBzb29uIG9mIGl1cmVzdCBzZXJ2aWNlXG4gICAgKi9cbiAgICAvKipcbiAgICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgIG5hbWU6ICdjcm9uRW1haWxDaGFyZ2VTb29uLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChwYXJzZXIpIHtcbiAgICAgICAgIHJldHVybiBwYXJzZXIuY3Jvbihjb3VudHJ5LmNyb25FbWFpbENoYXJnZVNvb24pO1xuICAgICAgIH0sXG4gICAgICAgam9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBNZXRlb3IuY2FsbCgnc2VuZEVtYWlsQ2hhcmdlU29vbicsIGNvdW50cnkuX2lkKTtcbiAgICAgICB9XG4gICAgIH0pO1xuICAgICAgKi9cblxuICAgIC8qKlxuICAgICogVGhpcyBjcm9uIHNlbmRzIGVtYWlsIHRvIHdhcm4gdGhlIGV4cGlyZSBzb29uIHRoZSBpdXJlc3Qgc2VydmljZVxuICAgICovXG4gICAgLyoqXG4gICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgICBuYW1lOiAnY3JvbkVtYWlsRXhwaXJlU29vbi4nICsgY291bnRyeS5uYW1lLFxuICAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAocGFyc2VyKSB7XG4gICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uRW1haWxFeHBpcmVTb29uKTtcbiAgICAgICB9LFxuICAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgTWV0ZW9yLmNhbGwoJ3NlbmRFbWFpbEV4cGlyZVNvb24nLCBjb3VudHJ5Ll9pZCk7XG4gICAgICAgfVxuICAgICB9KTtcbiAgICAgICovXG5cblxuICAgIC8qKlxuICAgICAqIFRoaXMgY3JvbiBldmFsdWF0ZXMgdGhlIGlzQWN0aXZlIGZsYWcgb24gZXN0YWJsaXNobWVudHMgd2l0aCB2YWx1ZSB0cnVlLCBhbmQgaW5zZXJ0IHRoZW0gb24gaGlzdG9yeV9wYXltZW50IGNvbGxlY3Rpb25cbiAgICAgKi9cbiAgICAvKipcbiAgICBTeW5jZWRDcm9uLmFkZCh7XG4gICAgICBuYW1lOiAnY3JvblZhbGlkYXRlQWN0aXZlLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uVmFsaWRhdGVBY3RpdmUpO1xuICAgICAgfSxcbiAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICBNZXRlb3IuY2FsbCgndmFsaWRhdGVBY3RpdmVFc3RhYmxpc2htZW50cycsIGNvdW50cnkuX2lkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAgKi9cblxuXG4gICAgLyoqXG4gICAgKiBUaGlzIGNyb24gc2VuZHMgYW4gZW1haWwgdG8gd2FybiB0aGF0IHRoZSBzZXJ2aWNlIGhhcyBleHBpcmVkXG4gICAgKi9cbiAgICAvKipcbiAgICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgIG5hbWU6ICdjcm9uRW1haWxSZXN0RXhwaXJlZC4nICsgY291bnRyeS5uYW1lLFxuICAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAocGFyc2VyKSB7XG4gICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uRW1haWxSZXN0RXhwaXJlZCk7XG4gICAgICAgfSxcbiAgICAgICBqb2I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIE1ldGVvci5jYWxsKCdzZW5kRW1haWxSZXN0RXhwaXJlZCcsIGNvdW50cnkuX2lkKTtcbiAgICAgICB9XG4gICAgIH0pO1xuICAgICAgKi9cblxuICAgIC8qKlxuICAgICogVGhpcyBjcm9uIHZhbGlkYXRlIHRoZSBwb2ludHMgZXhwaXJhdGlvbiBkYXRlXG4gICAgKi9cbiAgICAvKipcbiAgICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgIG5hbWU6ICdjcm9uUG9pbnRzRXhwaXJlLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChwYXJzZXIpIHtcbiAgICAgICAgIHJldHVybiBwYXJzZXIuY3Jvbihjb3VudHJ5LmNyb25Qb2ludHNFeHBpcmUpO1xuICAgICAgIH0sXG4gICAgICAgam9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBNZXRlb3IuY2FsbCgnY2hlY2tQb2ludHNUb0V4cGlyZScsIGNvdW50cnkuX2lkKTtcbiAgICAgICB9XG4gICAgIH0pO1xuICAgICAgKi9cbiAgfSk7XG59XG5cblN5bmNlZENyb24uc3RhcnQoKTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvc2VjdGlvbnMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvY2F0ZWdvcmllcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9zdWJjYXRlZ29yaWVzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L2FkZGl0aW9ucyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9pdGVtJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L29wdGlvbnMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvb3B0aW9uLXZhbHVlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC91c2Vycyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9yb2xlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9tZW51cyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC9jb2xsYWJvcmF0b3JzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3VzZXItZGV0YWlscyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9ob3VyJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2N1cnJlbmN5JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL3BheW1lbnRNZXRob2QnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvZW1haWwtY29udGVudCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXInO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvY291bnRyaWVzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2xhbmd1YWdlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9wb2ludCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC90eXBlLW9mLWZvb2QnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L3BheW1lbnQtdHJhbnNhY3Rpb24nO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvaW52b2ljZS1pbmZvJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L2N5Zy1pbnZvaWNlcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXInO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvdGFibGUnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvd2FpdGVyLWNhbGwnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL2JhZ19wbGFucyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnRfcG9pbnRzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvbmVnYXRpdmUtcG9pbnQnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFscyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24nO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9yZXdhcmQtaGlzdG9yeSc7XG5cbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL21lbnUvaXRlbS5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvY29sbGFib3JhdG9ycy5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvbWVudS5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXRhaWwubWV0aG9kcyc7XG5pbXBvcnQgJy4uL2JvdGgvbWV0aG9kcy9hdXRoL3VzZXItZGV2aWNlcy5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvdXNlci1sb2dpbi5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvdXNlci5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvY3Jvbi5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvZW1haWwubWV0aG9kcyc7XG5pbXBvcnQgJy4uL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2NoYW5nZS1lbWFpbC5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvY291bnRyeS5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvY3lnLWludm9pY2UubWV0aG9kcyc7XG5pbXBvcnQgJy4uL2JvdGgvbWV0aG9kcy9nZW5lcmFsL3B1c2gtbm90aWZpY2F0aW9ucy5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL3Jld2FyZC9yZXdhcmQubWV0aG9kcyc7XG5cbmltcG9ydCAnLi9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvYWNjb3VudC1jcmVhdGlvbic7XG5pbXBvcnQgJy4vaW1wb3J0cy9maXh0dXJlcy9hdXRoL2VtYWlsLWNvbmZpZyc7XG5pbXBvcnQgeyByZW1vdmVGaXh0dXJlcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9yZW1vdmUtZml4dHVyZXMnO1xuaW1wb3J0IHsgbG9hZFJvbGVzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvcm9sZXMnO1xuaW1wb3J0IHsgbG9hZE1lbnVzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvbWVudXMnO1xuaW1wb3J0IHsgbG9hZEhvdXJzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvaG91cnMnO1xuaW1wb3J0IHsgbG9hZEN1cnJlbmNpZXMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9jdXJyZW5jaWVzJztcbmltcG9ydCB7IGxvYWRQYXltZW50TWV0aG9kcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL3BheW1lbnRNZXRob2RzJztcbmltcG9ydCB7IGxvYWRDb3VudHJpZXMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9jb3VudHJpZXMnO1xuaW1wb3J0IHsgbG9hZExhbmd1YWdlcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL2xhbmd1YWdlcyc7XG5pbXBvcnQgeyBsb2FkRW1haWxDb250ZW50cyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL2VtYWlsLWNvbnRlbnRzJztcbmltcG9ydCB7IGxvYWRQYXJhbWV0ZXJzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvcGFyYW1ldGVycyc7XG5pbXBvcnQgeyBsb2FkQ2NQYXltZW50TWV0aG9kcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9wYXltZW50cy9jYy1wYXltZW50LW1ldGhvZHMnO1xuaW1wb3J0IHsgbG9hZEludm9pY2VzSW5mbyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9wYXltZW50cy9pbnZvaWNlcy1pbmZvJztcbmltcG9ydCB7IGxvYWRQb2ludHMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9wb2ludCc7XG5pbXBvcnQgeyBsb2FkVHlwZXNPZkZvb2QgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC90eXBlLW9mLWZvb2QnO1xuaW1wb3J0IHsgY3JlYXRlZGJpbmRleGVzIH0gZnJvbSAnLi9pbXBvcnRzL2luZGV4ZXMvaW5kZXhkYic7XG5pbXBvcnQgeyBjcmVhdGVDcm9ucyB9IGZyb20gJy4vY3Jvbic7XG5pbXBvcnQgeyBsb2FkQmFnUGxhbnMgfSBmcm9tIFwiLi9pbXBvcnRzL2ZpeHR1cmVzL3BvaW50cy9iYWdfcGxhbnNcIjtcblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICAgIHJlbW92ZUZpeHR1cmVzKCk7XG4gICAgbG9hZE1lbnVzKCk7XG4gICAgbG9hZFJvbGVzKCk7XG4gICAgbG9hZEhvdXJzKCk7XG4gICAgbG9hZEN1cnJlbmNpZXMoKTtcbiAgICBsb2FkUGF5bWVudE1ldGhvZHMoKTtcbiAgICBsb2FkQ291bnRyaWVzKCk7XG4gICAgbG9hZExhbmd1YWdlcygpO1xuICAgIGxvYWRFbWFpbENvbnRlbnRzKCk7XG4gICAgbG9hZFBhcmFtZXRlcnMoKTtcbiAgICBsb2FkQ2NQYXltZW50TWV0aG9kcygpO1xuICAgIGxvYWRJbnZvaWNlc0luZm8oKTtcbiAgICBsb2FkUG9pbnRzKCk7XG4gICAgbG9hZFR5cGVzT2ZGb29kKCk7XG4gICAgY3JlYXRlQ3JvbnMoKTtcbiAgICBsb2FkQmFnUGxhbnMoKTtcbiAgICBjcmVhdGVkYmluZGV4ZXMoKTtcbn0pO1xuIl19
