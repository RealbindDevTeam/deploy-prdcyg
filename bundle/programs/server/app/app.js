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
const establishment_medal_collection_1 = require("../../collections/points/establishment-medal.collection");
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
                            isActive: false,
                            modification_date: new Date()
                        }
                    });
                    establishment_medal_collection_1.EstablishmentMedals.collection.find({ establishment_id: establishmentPoint.establishment_id }).forEach(function (establishmentMedal, index, ar) {
                        establishment_medal_collection_1.EstablishmentMedals.collection.update({ _id: establishmentMedal._id }, {
                            $set: {
                                is_active: false,
                                modification_date: new Date()
                            }
                        });
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
const payment_history_collection_1 = require("../../collections/payment/payment-history.collection");
const user_detail_collection_1 = require("../../collections/auth/user-detail.collection");
const country_collection_1 = require("../../collections/general/country.collection");
const invoices_info_collection_1 = require("../../collections/payment/invoices-info.collection");
const cyg_invoices_collection_1 = require("../../collections/payment/cyg-invoices.collection");
const parameter_collection_1 = require("../../collections/general/parameter.collection");
const establishment_collection_1 = require("../../collections/establishment/establishment.collection");
const bag_plans_collection_1 = require("../../collections/points/bag-plans.collection");
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
                subtotal: lPaymentHistory.paymentValue.toString(),
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

}},"menu":{"category.collection.js":function(require,exports){

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

}},"menu":{"category.model.js":function(require,exports){

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
            { _id: '1610', name: 'iurest_img_url', value: ' https://app.comeygana.com/images/', description: 'comeygana images url' },
            { _id: '3100', name: 'ip_public_service_url2', value: 'https://ipinfo.io/json', description: 'url for retrieve the client public ip #2' },
            { _id: '3200', name: 'ip_public_service_url3', value: 'https://ifconfig.co/json', description: 'url for retrieve the client public ip #3' },
            { _id: '9000', name: 'payu_is_prod', value: 'true', description: 'Flag to enable to prod payu payment' },
            { _id: '9100', name: 'payu_test_state', value: 'APPROVED', description: 'Test state for payu payment transaction' },
            { _id: '9200', name: 'payu_reference_code', value: 'CYG_P_', description: 'Prefix for reference code on payu transactions' },
            { _id: '2100', name: 'max_user_penalties', value: '3', description: 'Max number of user penalties' },
            { _id: '2200', name: 'penalty_days', value: '30', description: 'User penalty days' },
            { _id: '8000', name: 'date_test_monthly_pay', value: 'March 5, 2018', description: 'Date test for monthly payment of comeygana service' },
            { _id: '10000', name: 'payu_payments_url_prod', value: 'https://api.payulatam.com/payments-api/4.0/service.cgi', description: 'url for connect prod payu payments API' },
            { _id: '20000', name: 'payu_reports_url_prod', value: 'https://api.payulatam.com/reports-api/4.0/service.cgi', description: 'url for connect prod payu reports API' },
            { _id: '8500', name: 'date_test_reactivate', value: 'January 6, 2018', description: 'Date test for reactivate restaurant for pay' },
            { _id: '30000', name: 'terms_url', value: 'https://www.comeygana.com/', description: 'url to see terms and conditions' },
            { _id: '40000', name: 'policy_url', value: 'https://www.comeygana.com/', description: 'url to see privacy policy' },
            { _id: '50000', name: 'QR_code_url', value: 'https://www.comeygana.com/gana-por-comer', description: 'This url redirect to page the comeygana/download when scanned QR code from other application' },
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

}},"menu":{"categories.js":function(require,exports){

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
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
/**
 * Meteor publication establishment medals by user id
 * @param {string} _pUserId
 */
meteor_1.Meteor.publish('getEstablishmentMedalsByUserId', function (_pUserId) {
    check_1.check(_pUserId, String);
    return establishment_medal_collection_1.EstablishmentMedals.find({ user_id: _pUserId });
});
/**
 * Meteor publication establishment medals by establishments array
 * @param {string[]} _establishmentArray
 */
meteor_1.Meteor.publish('getEstablishmentMedalsByArray', function (_establishmentArray) {
    return establishment_medal_collection_1.EstablishmentMedals.find({ establishment_id: { $in: _establishmentArray } });
});
/**
 * Meteor publication establishment medals by admin user
 * @param {string} _adminUserId
 */
meteor_1.Meteor['publishComposite']('getEstablishmentByAdminUsr', function (_adminUserId) {
    return {
        find() {
            return establishment_collection_1.Establishments.find({ creation_user: _adminUserId });
        },
        children: [{
                find(establishment) {
                    return establishment_medal_collection_1.EstablishmentMedals.find({ establishment_id: establishment._id });
                }
            }]
    };
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
const establishment_collection_1 = require("../../../../both/collections/establishment/establishment.collection");
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
/**
 * Meteor publication of negative points by creation_user
 * @param {string} _userId
 */
meteor_1.Meteor['publishComposite']('getNegativePointsByAdminUser', function (_adminUserId) {
    return {
        find() {
            return establishment_collection_1.Establishments.find({ creation_user: _adminUserId });
        },
        children: [{
                find(establishment) {
                    return negative_points_collection_1.NegativePoints.find({ establishment_id: establishment._id });
                }
            }]
    };
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
require("./imports/publications/menu/sections");
require("./imports/publications/menu/categories");
require("./imports/publications/menu/subcategories");
require("./imports/publications/menu/item");
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
require("./imports/publications/general/countries");
require("./imports/publications/general/languages");
require("./imports/publications/general/point");
require("./imports/publications/general/type-of-food");
require("./imports/publications/payment/payment-history");
require("./imports/publications/payment/cc-payment-method");
require("./imports/publications/payment/payment-transaction");
require("./imports/publications/payment/invoice-info");
require("./imports/publications/payment/cyg-invoices");
require("./imports/publications/establishment/establishment");
require("./imports/publications/establishment/establishment-qr");
require("./imports/publications/establishment/table");
require("./imports/publications/establishment/waiter-call");
require("./imports/publications/establishment/reward");
require("./imports/publications/establishment/reward-point");
require("./imports/publications/points/bag_plans");
require("./imports/publications/points/establishment_points");
require("./imports/publications/points/negative-point");
require("./imports/publications/points/establishment-medals");
require("./imports/publications/points/reward-confirmation");
require("./imports/publications/points/reward-history");
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
require("./imports/fixtures/auth/account-creation");
require("./imports/fixtures/auth/email-config");
const remove_fixtures_1 = require("./imports/fixtures/remove-fixtures");
const roles_1 = require("./imports/fixtures/auth/roles");
const menus_1 = require("./imports/fixtures/auth/menus");
const hours_1 = require("./imports/fixtures/general/hours");
const currencies_1 = require("./imports/fixtures/general/currencies");
const paymentMethods_1 = require("./imports/fixtures/general/paymentMethods");
const countries_1 = require("./imports/fixtures/general/countries");
const languages_1 = require("./imports/fixtures/general/languages");
const email_contents_1 = require("./imports/fixtures/general/email-contents");
const parameters_1 = require("./imports/fixtures/general/parameters");
const cc_payment_methods_1 = require("./imports/fixtures/payments/cc-payment-methods");
const invoices_info_1 = require("./imports/fixtures/payments/invoices-info");
const point_1 = require("./imports/fixtures/general/point");
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
require("/both/collections/menu/category.collection.js");
require("/both/collections/menu/item.collection.js");
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
require("/both/models/menu/category.model.js");
require("/both/models/menu/item.model.js");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvUVIvY29kZUdlbmVyYXRvci50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvYXV0aC9jb2xsYWJvcmF0b3JzLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9hdXRoL21lbnUubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXRhaWwubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXZpY2VzLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9hdXRoL3VzZXItbG9naW4ubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2F1dGgvdXNlci5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jaGFuZ2UtZW1haWwubWV0aG9kcy50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tZXRob2RzL2dlbmVyYWwvY291bnRyeS5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jcm9uLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2N5Zy1pbnZvaWNlLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL2VtYWlsLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9nZW5lcmFsL3B1c2gtbm90aWZpY2F0aW9ucy5tZXRob2RzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21ldGhvZHMvbWVudS9pdGVtLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbWV0aG9kcy9yZXdhcmQvcmV3YXJkLm1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9kZXZpY2UuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3JvbGUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWxvZ2luLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLXBlbmFsdHkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLWhpc3RvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3dhaXRlci1jYWxsLWRldGFpbC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY3VycmVuY3kuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2hvdXJzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wb2ludC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcXVldWUuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL21lbnUvY2F0ZWdvcnkuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9tZW51L2l0ZW0uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9tZW51L3NlY3Rpb24uY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9tZW51L3N1YmNhdGVnb3J5LmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZHMuY29sbGVjdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2N5Zy1pbnZvaWNlcy5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvaW52b2ljZXMtaW5mby5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LXRyYW5zYWN0aW9uLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2JhZy1wbGFucy1oaXN0b3J5LmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2JhZy1wbGFucy5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnRzLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL25lZ2F0aXZlLXBvaW50cy5jb2xsZWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9yZXdhcmQtY29uZmlybWF0aW9uLmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL3Jld2FyZC1oaXN0b3J5LmNvbGxlY3Rpb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2F1dGgvZGV2aWNlLm1vZGVsLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21vZGVscy9hdXRoL3VzZXItbG9naW4ubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2F1dGgvdXNlci1wcm9maWxlLm1vZGVsLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL2JvdGgvbW9kZWxzL2VzdGFibGlzaG1lbnQvbm9kZS50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9tb2RlbHMvcGF5bWVudC9yZXNwb25zZS1xdWVyeS5tb2RlbC50cyIsIm1ldGVvcjovL/CfkrthcHAvYm90aC9zaGFyZWQtY29tcG9uZW50cy92YWxpZGF0b3JzL2N1c3RvbS12YWxpZGF0b3IudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvYWNjb3VudC1jcmVhdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9lbWFpbC1jb25maWcudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvbWVudXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvcm9sZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvY291bnRyaWVzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL2N1cnJlbmNpZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvZW1haWwtY29udGVudHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvaG91cnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvbGFuZ3VhZ2VzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL3BhcmFtZXRlcnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvcGF5bWVudE1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvcG9pbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvdHlwZS1vZi1mb29kLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9maXh0dXJlcy9wYXltZW50cy9jYy1wYXltZW50LW1ldGhvZHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL3BheW1lbnRzL2ludm9pY2VzLWluZm8udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL3BvaW50cy9iYWdfcGxhbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL2ZpeHR1cmVzL3JlbW92ZS1maXh0dXJlcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2F1dGgvY29sbGFib3JhdG9ycy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2F1dGgvbWVudXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3JvbGVzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvYXV0aC91c2VyLWRldGFpbHMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3VzZXJzLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LXFyLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvdGFibGUudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L3dhaXRlci1jYWxsLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9jb3VudHJpZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9lbWFpbC1jb250ZW50LnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9ob3VyLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvcG9pbnQudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvY2F0ZWdvcmllcy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvaXRlbS50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvc2VjdGlvbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L3N1YmNhdGVnb3JpZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9jeWctaW52b2ljZXMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wYXltZW50L2ludm9pY2UtaW5mby50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9wYXltZW50LXRyYW5zYWN0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL2JhZ19wbGFucy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFscy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9lc3RhYmxpc2htZW50X3BvaW50cy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9uZWdhdGl2ZS1wb2ludC50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9yZXdhcmQtY29uZmlybWF0aW9uLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL3Jld2FyZC1oaXN0b3J5LnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvaW1wb3J0cy9pbmRleGVzL2luZGV4ZGIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9jcm9uLWNvbmZpZy50cyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2Nyb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw2REFB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RUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDcFAsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNuUCxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ2xQLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7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RSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLGFBQWEsRUFBRSx1QkFBdUIsRUFBRSxXQUFXLEVBQUU7WUFDdlEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUN0UCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3BQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDbFAsRUFBRSxHQUFH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SSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDclAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUN0UCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUseUJBQXlCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQzFQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDblAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNyUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ25QLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDcFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNuUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQzdQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDalAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUN2UCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ25QLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDMVAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUN0UCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3ZQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDdFAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNsUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ2xQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDclAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRTtZQUNuUCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFO1lBQ3ZQLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUU7WUFDclAsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFF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RUFBRSxLQUFLLENBQUUsQ0FBQyxFQUFDO1FBQ25DLE1BQU0sS0FBSyxHQUFXO1lBQ2xCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRTtZQUNoQixFQUFFLElBQUksRUFBQyxPQUFPLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUMsT0FBTyxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxF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dUU7QUFDdkUsdUZBQXNGO0FBQ3RGLDZFQUE2RTtBQUM3RSw0REFBOEQ7QUFDOUQsMEVBQTBFO0FBQzFFLDREQUE0RDtBQUM1RCxpQ0FBcUM7QUFDckMsbUVBQW1FO0FBRW5FLGVBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO0lBQ2hCLGdDQUFjLEVBQUUsQ0FBQztJQUNqQixpQkFBUyxFQUFFLENBQUM7SUFDWixpQkFBUyxFQUFFLENBQUM7SUFDWixpQkFBUyxFQUFFLENBQUM7SUFDWiwyQkFBYyxFQUFFLENBQUM7SUFDakIsbUNBQWtCLEVBQUUsQ0FBQztJQUNyQix5QkFBYSxFQUFFLENBQUM7SUFDaEIseUJBQWEsRUFBRSxDQUFDO0lBQ2hCLGtDQUFpQixFQUFFLENBQUM7SUFDcEIsMkJBQWMsRUFBRSxDQUFDO0lBQ2pCLHlDQUFvQixFQUFFLENBQUM7SUFDdkIsZ0NBQWdCLEVBQUUsQ0FBQztJQUNuQixrQkFBVSxFQUFFLENBQUM7SUFDYiw4QkFBZSxFQUFFLENBQUM7SUFDbEIsa0JBQVcsRUFBRSxDQUFDO0lBQ2Qsd0JBQVksRUFBRSxDQUFDO0lBQ2YseUJBQWUsRUFBRSxDQUFDO0FBQ3RCLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvbm9kZSc7XG5pbXBvcnQgeyBCeXRlc0luZm8sIFFSQ29kZUluZm9ybWF0aW9uIH0gZnJvbSAnLi4vLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvdGFibGUubW9kZWwnO1xuaW1wb3J0IENvbGxlY3Rpb25zID0gcmVxdWlyZSgndHlwZXNjcmlwdC1jb2xsZWN0aW9ucycpO1xuXG5leHBvcnQgY2xhc3MgQ29kZUdlbmVyYXRvciB7XG4gICAgXG4gICAgcHJpdmF0ZSBzdHJpbmdUb0NvbnZlcnQ6c3RyaW5nO1xuICAgIHByaXZhdGUgZGljY2lvbmFyeSA9IG5ldyBDb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PFN0cmluZyxOb2RlPigpO1xuICAgIHByaXZhdGUgc29ydExpc3Q6QXJyYXk8Tm9kZT4gPSBuZXcgQXJyYXk8Tm9kZT4oKTtcbiAgICBwcml2YXRlIG1hcCA9IG5ldyBDb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PFN0cmluZyxTdHJpbmc+KCk7XG4gICAgcHJpdmF0ZSBmaW5hbFRyZWU6Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgcHJpdmF0ZSBiaW5hcnlDb2RlID0gJyc7XG4gICAgcHJpdmF0ZSBzaWduaWZpY2F0aXZlQml0czpudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgZmluYWxCeXRlczogQnl0ZXNJbmZvW107XG4gICAgcHJpdmF0ZSBRUkNvZGU6c3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoIF9wU3RyaW5nVG9Db252ZXJ0OnN0cmluZyApe1xuICAgICAgICB0aGlzLnN0cmluZ1RvQ29udmVydCA9IF9wU3RyaW5nVG9Db252ZXJ0O1xuICAgICAgICB0aGlzLmZpbmFsVHJlZS5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwgKTtcbiAgICAgICAgdGhpcy5maW5hbEJ5dGVzID0gW107XG4gICAgfVxuXG4gICAgcHVibGljIGdlbmVyYXRlQ29kZSgpe1xuICAgICAgICB0aGlzLmJ1aWxkRnJlY3VlbmN5VGFibGUoKTtcbiAgICAgICAgdGhpcy5zb3J0RGF0YSgpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRyZWUoKTtcbiAgICAgICAgdGhpcy5jb2RlVHJlZSgpO1xuICAgICAgICB0aGlzLmNyZWF0ZVFSQ29kZSgpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGJ1aWxkRnJlY3VlbmN5VGFibGUoKTp2b2lke1xuICAgICAgICBsZXQgX2xOb2RlOk5vZGU7XG4gICAgICAgIGxldCBfbENoYXJzOm51bWJlciA9IDA7XG5cbiAgICAgICAgZm9yKGxldCBfaSA9IDA7IF9pIDwgdGhpcy5zdHJpbmdUb0NvbnZlcnQubGVuZ3RoOyBfaSsrICl7XG4gICAgICAgICAgICBfbENoYXJzID0gdGhpcy5zdHJpbmdUb0NvbnZlcnQuY2hhckNvZGVBdCggX2kgKTtcbiAgICAgICAgICAgIF9sTm9kZSA9IHRoaXMuZGljY2lvbmFyeS5nZXRWYWx1ZSggJycgKyBfbENoYXJzICk7XG5cbiAgICAgICAgICAgIGlmKCBfbE5vZGUgPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgbGV0IF9sQXV4Ok5vZGUgPSBuZXcgTm9kZSgpO1xuICAgICAgICAgICAgICAgIF9sQXV4LmNyZWF0ZU5vZGUoX2xDaGFycyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWNjaW9uYXJ5LnNldFZhbHVlKCBfbENoYXJzICsgJycsIF9sQXV4ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9sTm9kZS5zZXRGcmVjdWVuY3koIF9sTm9kZS5nZXRGcmVjdWVuY3koKSArIDEgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc29ydERhdGEoKTp2b2lke1xuICAgICAgICBsZXQgX2xOb2RlOk5vZGU7XG4gICAgICAgIGxldCBfbEZyZWN1ZW5jeTpudW1iZXI7XG4gICAgICAgIGxldCBfbFNvcnRGcmVjdWVuY3k6bnVtYmVyW10gPSBbXTtcbiAgICAgICAgbGV0IF9sU29ydFRNUDpBcnJheTxudW1iZXI+ID0gbmV3IEFycmF5PG51bWJlcj4oKTtcbiAgICAgICAgbGV0IF9BdXhDb250Om51bWJlciA9IDA7XG5cbiAgICAgICAgZm9yKCBsZXQgX2kgPSAwOyBfaSA8PSAyNTU7IF9pKysgKXtcbiAgICAgICAgICAgIF9sU29ydFRNUC5zcGxpY2UoIDAsIDAsIDAgKTtcbiAgICAgICAgfSAgICAgICAgXG5cbiAgICAgICAgdGhpcy5kaWNjaW9uYXJ5LnZhbHVlcygpLmZvckVhY2goKHJlcyk9PiB7XG4gICAgICAgICAgICBfbFNvcnRGcmVjdWVuY3kuc3BsaWNlKCBfQXV4Q29udCwgMCwgcmVzLmdldEZyZWN1ZW5jeSgpICk7XG4gICAgICAgICAgICBfbFNvcnRUTVAuc3BsaWNlKCByZXMuZ2V0Q2hhcigpLCAxLCByZXMuZ2V0RnJlY3VlbmN5KCkgKTsgXG4gICAgICAgICAgICBfQXV4Q29udCsrO1xuICAgICAgICB9KTtcblxuICAgICAgICBfbFNvcnRGcmVjdWVuY3kuc29ydCgpO1xuXG4gICAgICAgIF9sU29ydEZyZWN1ZW5jeS5mb3JFYWNoKChub2QpPT57XG4gICAgICAgICAgICBsZXQgdG1wID0gX2xTb3J0VE1QLmluZGV4T2YoIG5vZCApO1xuICAgICAgICAgICAgX2xTb3J0VE1QLnNwbGljZSggdG1wLCAxLCAwICk7XG4gICAgICAgICAgICBsZXQgdG1wTm9kZTpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgICAgIHRtcE5vZGUuY3JlYXRlTm9kZUV4dGVuZCggbm9kLCB0bXAsIG51bGwsIG51bGwgKTtcbiAgICAgICAgICAgIHRoaXMuc29ydExpc3QucHVzaCh0bXBOb2RlKTtcbiAgICAgICAgfSk7ICAgICAgXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVOZXdOb2RlKCBfcE5vZGVMZWZ0Ok5vZGUsIF9wTm9kZVJpZ2h0Ok5vZGUgKTpOb2Rle1xuICAgICAgICBsZXQgX2xOZXdOb2RlOk5vZGUgPSBuZXcgTm9kZSgpO1xuICAgICAgICBsZXQgX2xGcmVjdWVuY3lOZXdOb2RlOm51bWJlcjtcblxuICAgICAgICBfbEZyZWN1ZW5jeU5ld05vZGUgPSAoIF9wTm9kZUxlZnQuZ2V0RnJlY3VlbmN5KCkgKyBfcE5vZGVSaWdodC5nZXRGcmVjdWVuY3koKSApO1xuICAgICAgICBfbE5ld05vZGUuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIF9sTmV3Tm9kZS5zZXRGcmVjdWVuY3koIF9sRnJlY3VlbmN5TmV3Tm9kZSApO1xuICAgICAgICBfbE5ld05vZGUuc2V0Tm9kZUxlZnQoIF9wTm9kZUxlZnQgKTtcbiAgICAgICAgX2xOZXdOb2RlLnNldE5vZGVSaWdodCggX3BOb2RlUmlnaHQgKTtcbiAgICAgICAgcmV0dXJuIF9sTmV3Tm9kZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluc2VydE5ld05vZGUoIF9wTmV3Tm9kZTpOb2RlLCBfcFNvcnRMaXN0OkFycmF5PE5vZGU+ICk6QXJyYXk8Tm9kZT57XG4gICAgICAgIGxldCBfbEZpcnN0Tm9kZTpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgbGV0IF9sU2Vjb25kTm9kZTpOb2RlID0gbmV3IE5vZGUoKTtcblxuICAgICAgICBfbEZpcnN0Tm9kZS5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwpO1xuICAgICAgICBfbFNlY29uZE5vZGUuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIF9wU29ydExpc3Quc3BsaWNlKDAgLCAwLCBfcE5ld05vZGUgKTtcblxuICAgICAgICBmb3IoIGxldCBfaSA9IDA7IF9pIDwgX3BTb3J0TGlzdC5sZW5ndGggLSAxOyBfaSsrICl7XG4gICAgICAgICAgICBfbEZpcnN0Tm9kZSA9IF9wU29ydExpc3RbIF9pIF07XG4gICAgICAgICAgICBfbFNlY29uZE5vZGUgPSBfcFNvcnRMaXN0WyAoX2kgKyAxKSBdO1xuXG4gICAgICAgICAgICBpZiggX2xGaXJzdE5vZGUuZ2V0RnJlY3VlbmN5KCkgPj0gX2xTZWNvbmROb2RlLmdldEZyZWN1ZW5jeSgpICl7XG4gICAgICAgICAgICAgICAgX3BTb3J0TGlzdC5zcGxpY2UoICggX2kgKyAxICksIDEsIF9sRmlyc3ROb2RlICk7XG4gICAgICAgICAgICAgICAgX3BTb3J0TGlzdC5zcGxpY2UoIF9pLCAxLCBfbFNlY29uZE5vZGUgKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9wU29ydExpc3Q7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVUcmVlKCk6dm9pZCB7XG4gICAgICAgIGxldCBfbFRlbXBOb2RlTGVmdDpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgbGV0IF9sVGVtcE5vZGVSaWdodDpOb2RlID0gbmV3IE5vZGUoKTtcbiAgICAgICAgbGV0IF9sVGVtcE5ld05vZGU6Tm9kZSA9IG5ldyBOb2RlKCk7XG5cbiAgICAgICAgX2xUZW1wTm9kZUxlZnQuY3JlYXRlTm9kZUV4dGVuZCggMCwgMjU2LCBudWxsLCBudWxsICk7XG4gICAgICAgIF9sVGVtcE5vZGVSaWdodC5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwgKTtcbiAgICAgICAgX2xUZW1wTmV3Tm9kZS5jcmVhdGVOb2RlRXh0ZW5kKCAwLCAyNTYsIG51bGwsIG51bGwgKTtcblxuICAgICAgICB3aGlsZSggdGhpcy5zb3J0TGlzdC5sZW5ndGggIT0gMSApeyAgICAgICAgICAgIFxuICAgICAgICAgICAgX2xUZW1wTm9kZUxlZnQgPSB0aGlzLnNvcnRMaXN0LnNoaWZ0KCk7XG4gICAgICAgICAgICBfbFRlbXBOb2RlUmlnaHQgPSB0aGlzLnNvcnRMaXN0LnNoaWZ0KCk7XG4gICAgICAgICAgICBfbFRlbXBOZXdOb2RlID0gdGhpcy5jcmVhdGVOZXdOb2RlKCBfbFRlbXBOb2RlTGVmdCwgX2xUZW1wTm9kZVJpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLnNvcnRMaXN0ID0gdGhpcy5pbnNlcnROZXdOb2RlKCBfbFRlbXBOZXdOb2RlLCB0aGlzLnNvcnRMaXN0ICk7XG4gICAgICAgIH0gICAgICAgIFxuICAgICAgICB0aGlzLmZpbmFsVHJlZSA9IHRoaXMuc29ydExpc3Quc2hpZnQoKTtcbiAgICAgICAgdGhpcy5wcmVPcmRlciggdGhpcy5maW5hbFRyZWUsIFwiXCIgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByZU9yZGVyKCBfcE5vZGU6Tm9kZSwgX3BWYWw6c3RyaW5nICk6dm9pZHtcbiAgICAgICAgaWYoIF9wTm9kZS5nZXROb2RlTGVmdCgpID09IG51bGwgJiYgX3BOb2RlLmdldE5vZGVSaWdodCgpID09IG51bGwgKXtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFZhbHVlKCBfcE5vZGUuZ2V0Q2hhcigpICsgJycsIF9wVmFsICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVPcmRlciggX3BOb2RlLmdldE5vZGVMZWZ0KCksIF9wVmFsLmNvbmNhdCggXCIxXCIgKSApO1xuICAgICAgICB0aGlzLnByZU9yZGVyKCBfcE5vZGUuZ2V0Tm9kZVJpZ2h0KCksIF9wVmFsLmNvbmNhdCggXCIwXCIgKSApO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29kZVRyZWUoKTp2b2lke1xuICAgICAgICBsZXQgX2xDb2RlQnl0ZXMgPSAnJztcbiAgICAgICAgbGV0IF9sQ2hhcnMgPSAwO1xuICAgICAgICBsZXQgX2xFbmQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBsZXQgX2xCeXRlOm51bWJlcjtcbiAgICAgICAgbGV0IF9sQ29kZTpzdHJpbmcgPSAnJztcblxuICAgICAgICBmb3IoIGxldCBfaSA9IDA7IF9pIDwgdGhpcy5zdHJpbmdUb0NvbnZlcnQubGVuZ3RoOyBfaSsrICl7XG4gICAgICAgICAgICBfbENoYXJzID0gdGhpcy5zdHJpbmdUb0NvbnZlcnQuY2hhckNvZGVBdCggX2kgKTtcbiAgICAgICAgICAgIHRoaXMuYmluYXJ5Q29kZSArPSB0aGlzLm1hcC5nZXRWYWx1ZSggX2xDaGFycyArICcnICk7XG4gICAgICAgIH1cblxuICAgICAgICBfbENvZGUgPSB0aGlzLmJpbmFyeUNvZGU7XG5cbiAgICAgICAgd2hpbGUoICFfbEVuZCApe1xuXG4gICAgICAgICAgICBsZXQgQnl0ZXNJbmZvOkJ5dGVzSW5mbyA9IHsgYml0czonJywgZmluYWxCeXRlOjAsIG9yaWdpbmFsQnl0ZTowIH07XG5cbiAgICAgICAgICAgIGZvciggbGV0IF9qID0gMDsgX2ogPCA4OyBfaisrICl7XG4gICAgICAgICAgICAgICAgX2xDb2RlQnl0ZXMgKz0gX2xDb2RlLmNoYXJBdCggX2ogKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9sQnl0ZSA9IHBhcnNlSW50KCBfbENvZGVCeXRlcywgMiApO1xuICAgICAgICAgICAgQnl0ZXNJbmZvLm9yaWdpbmFsQnl0ZSA9IF9sQnl0ZTtcblxuICAgICAgICAgICAgd2hpbGUoIHRydWUgKXtcbiAgICAgICAgICAgICAgICBfbEJ5dGUgPSB0aGlzLmJ5dGVOaXZlbGF0b3IoIF9sQnl0ZSApO1xuICAgICAgICAgICAgICAgIGlmKCBfbEJ5dGUgPj0gNjUgJiYgX2xCeXRlIDw9IDkwICl7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEJ5dGVzSW5mby5maW5hbEJ5dGUgPSBfbEJ5dGU7XG4gICAgICAgICAgICBCeXRlc0luZm8uYml0cyA9IF9sQ29kZUJ5dGVzO1xuICAgICAgICAgICAgdGhpcy5maW5hbEJ5dGVzLnB1c2goIEJ5dGVzSW5mbyApO1xuICAgICAgICAgICAgX2xDb2RlQnl0ZXMgPSAnJztcbiAgICAgICAgICAgIF9sQ29kZSA9IF9sQ29kZS5zdWJzdHJpbmcoIDgsIF9sQ29kZS5sZW5ndGggKTtcblxuICAgICAgICAgICAgaWYoIF9sQ29kZS5sZW5ndGggPT0gMCApe1xuICAgICAgICAgICAgICAgIF9sRW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIF9sQ29kZS5sZW5ndGggPCA4ICl7XG4gICAgICAgICAgICAgICAgX2xDb2RlID0gdGhpcy5hZGRTaWduaWZpY2F0aXZlQml0cyggX2xDb2RlICk7XG4gICAgICAgICAgICB9ICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWRkU2lnbmlmaWNhdGl2ZUJpdHMoIF9jb2RlOnN0cmluZyApOnN0cmluZ3tcbiAgICAgICAgd2hpbGUoIF9jb2RlLmxlbmd0aCA8IDggKXtcbiAgICAgICAgICAgIF9jb2RlICs9IFwiMFwiO1xuICAgICAgICAgICAgdGhpcy5zaWduaWZpY2F0aXZlQml0cyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfY29kZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJ5dGVOaXZlbGF0b3IoIF9wQnl0ZTpudW1iZXIgKTpudW1iZXJ7XG4gICAgICAgIGxldCBfbE51bWJlckNvbnZlcnQ6bnVtYmVyID0gMDtcbiAgICAgICAgaWYoIF9wQnl0ZSA8IDY1ICl7XG4gICAgICAgICAgICBfbE51bWJlckNvbnZlcnQgPSBfcEJ5dGUgKyAxMDtcbiAgICAgICAgfSBlbHNlIGlmKCBfcEJ5dGUgPiA5MCApIHtcbiAgICAgICAgICAgIF9sTnVtYmVyQ29udmVydCA9IF9wQnl0ZSAtIDEwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICBfbE51bWJlckNvbnZlcnQgPSBfcEJ5dGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9sTnVtYmVyQ29udmVydDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVFSQ29kZSgpOnZvaWR7XG4gICAgICAgIGxldCBfbFFSQ29kZTpzdHJpbmcgPSAnJztcblxuICAgICAgICB0aGlzLmZpbmFsQnl0ZXMuZm9yRWFjaCggKGJ5dGUpID0+IHtcbiAgICAgICAgICAgIF9sUVJDb2RlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZS5maW5hbEJ5dGUpXG4gICAgICAgIH0pO1xuICAgICAgICBfbFFSQ29kZSArPSAoIHRoaXMuZmluYWxCeXRlc1sgMCBdLmZpbmFsQnl0ZSArICcnICk7XG4gICAgICAgIF9sUVJDb2RlICs9ICggdGhpcy5maW5hbEJ5dGVzWyB0aGlzLmZpbmFsQnl0ZXMubGVuZ3RoIC0gMSBdLmZpbmFsQnl0ZSArICcnICk7XG4gICAgICAgIHRoaXMuUVJDb2RlID0gX2xRUkNvZGU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbmFsQnl0ZXMoKTpCeXRlc0luZm9bXXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluYWxCeXRlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U2lnbmlmaWNhdGl2ZUJpdHMoKTpudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLnNpZ25pZmljYXRpdmVCaXRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRRUkNvZGUoKTpzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLlFSQ29kZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDb2RlR2VuZXJhdG9yIH0gZnJvbSAnLi9RUi9jb2RlR2VuZXJhdG9yJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbCB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3BhcmFtZXRlci5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyUGVuYWx0eSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItcGVuYWx0eS5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyUGVuYWx0aWVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLXBlbmFsdHkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UVIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LXFyLm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRRUnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50TWVkYWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWwubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudE1lZGFscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlIHJhbmRvbSBjb2RlIHdpdGggOSBsZW5ndGggdG8gZXN0YWJsaXNobWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVzdGFibGlzaG1lbnRDb2RlKCk6IHN0cmluZyB7XG4gICAgbGV0IF9sVGV4dCA9ICcnO1xuICAgIGxldCBfbFBvc3NpYmxlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJztcblxuICAgIGZvciAobGV0IF9pID0gMDsgX2kgPCA5OyBfaSsrKSB7XG4gICAgICAgIF9sVGV4dCArPSBfbFBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBfbFBvc3NpYmxlLmxlbmd0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gX2xUZXh0O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlIHJhbmRvbSBjb2RlIHdpdGggNSBsZW5ndGggdG8gZXN0YWJsaXNobWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRhYmxlQ29kZSgpOiBzdHJpbmcge1xuICAgIGxldCBfbFRleHQgPSAnJztcbiAgICBsZXQgX2xQb3NzaWJsZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XG5cbiAgICBmb3IgKGxldCBfaSA9IDA7IF9pIDwgNTsgX2krKykge1xuICAgICAgICBfbFRleHQgKz0gX2xQb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogX2xQb3NzaWJsZS5sZW5ndGgpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9sVGV4dDtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZSByYW5kb20gY29kZSB3aXRoIDE0IGxlbmd0aCB0byBlc3RhYmxpc2htZW50IFFSXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb2RlVG9Fc3RhYmxpc2htZW50UVIoKTogc3RyaW5nIHtcbiAgICBsZXQgX2xUZXh0ID0gJyc7XG4gICAgbGV0IF9sUG9zc2libGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xuXG4gICAgZm9yIChsZXQgX2kgPSAwOyBfaSA8IDE0OyBfaSsrKSB7XG4gICAgICAgIF9sVGV4dCArPSBfbFBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBfbFBvc3NpYmxlLmxlbmd0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gX2xUZXh0O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlIFFSIENvZGVzIHRvIGVzdGFibGlzaG1lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gX3BTdHJpbmdUb0NvZGVcbiAqIEByZXR1cm4ge1RhYmxlfSBnZW5lcmF0ZVFSQ29kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVRUkNvZGUoX3BTdHJpbmdUb0NvZGU6IHN0cmluZyk6IGFueSB7XG4gICAgbGV0IF9sQ29kZUdlbmVyYXRvciA9IG5ldyBDb2RlR2VuZXJhdG9yKF9wU3RyaW5nVG9Db2RlKTtcbiAgICBfbENvZGVHZW5lcmF0b3IuZ2VuZXJhdGVDb2RlKCk7XG4gICAgcmV0dXJuIF9sQ29kZUdlbmVyYXRvcjtcbn1cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWV0ZW9yIG1ldGhvZCB0byB2YWxpZGF0ZSBlc3RhYmxpc2htZW50IFFSIGNvZGVcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9xcmNvZGVcbiAgICAgICAgICovXG4gICAgICAgIHZlcmlmeUVzdGFibGlzaG1lbnRRUkNvZGU6IGZ1bmN0aW9uIChfcXJDb2RlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnRRUjogRXN0YWJsaXNobWVudFFSID0gRXN0YWJsaXNobWVudFFScy5maW5kT25lKHsgUVJfY29kZTogX3FyQ29kZSB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX2xFc3RhYmxpc2htZW50UVIgIT09IHVuZGVmaW5lZCB8fCBfbEVzdGFibGlzaG1lbnRRUiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfbEVzdGFibGlzaG1lbnRRUjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgTWV0ZW9yIE1ldGhvZCByZXR1cm4gZXN0YWJsaXNobWVudCBvYmplY3Qgd2l0aCBRUiBDb2RlIGNvbmRpdGlvblxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gX3FyQ29kZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RXN0YWJsaXNobWVudEJ5UVJDb2RlOiBmdW5jdGlvbiAoX3FyQ29kZTogc3RyaW5nLCBfdXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBfZXN0YWJsaXNobWVudDogRXN0YWJsaXNobWVudDtcbiAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnRRUjogRXN0YWJsaXNobWVudFFSID0gRXN0YWJsaXNobWVudFFScy5maW5kT25lKHsgUVJfY29kZTogX3FyQ29kZSB9KTtcbiAgICAgICAgICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcblxuICAgICAgICAgICAgaWYgKF9sVXNlckRldGFpbC5wZW5hbHRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IF9sVXNlclBlbmFsdHk6IFVzZXJQZW5hbHR5ID0gVXNlclBlbmFsdGllcy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCwgaXNfYWN0aXZlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIGlmIChfbFVzZXJQZW5hbHR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfbFVzZXJQZW5hbHR5RGF5czogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ3BlbmFsdHlfZGF5cycgfSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfbEN1cnJlbnREYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9sRGF0ZVRvQ29tcGFyZTogRGF0ZSA9IG5ldyBEYXRlKF9sVXNlclBlbmFsdHkubGFzdF9kYXRlLnNldERhdGUoKF9sVXNlclBlbmFsdHkubGFzdF9kYXRlLmdldERhdGUoKSArIE51bWJlcihfbFVzZXJQZW5hbHR5RGF5cy52YWx1ZSkpKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfbERhdGVUb0NvbXBhcmUuZ2V0VGltZSgpID49IF9sQ3VycmVudERhdGUuZ2V0VGltZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xEYXk6IG51bWJlciA9IF9sRGF0ZVRvQ29tcGFyZS5nZXREYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xNb250aDogbnVtYmVyID0gX2xEYXRlVG9Db21wYXJlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sWWVhcjogbnVtYmVyID0gX2xEYXRlVG9Db21wYXJlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc1MDAnLCBfbERheSArICcvJyArIF9sTW9udGggKyAnLycgKyBfbFllYXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgVXNlclBlbmFsdGllcy51cGRhdGUoeyBfaWQ6IF9sVXNlclBlbmFsdHkuX2lkIH0sIHsgJHNldDogeyBpc19hY3RpdmU6IGZhbHNlIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfbEVzdGFibGlzaG1lbnRRUikge1xuICAgICAgICAgICAgICAgIF9lc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBfbEVzdGFibGlzaG1lbnRRUi5lc3RhYmxpc2htZW50X2lkIH0pO1xuICAgICAgICAgICAgICAgIGlmIChfZXN0YWJsaXNobWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2VzdGFibGlzaG1lbnQuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnRNZWRhbDogRXN0YWJsaXNobWVudE1lZGFsID0gRXN0YWJsaXNobWVudE1lZGFscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCwgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnQuX2lkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2xFc3RhYmxpc2htZW50TWVkYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xOZXdRdWFudGl0eTogbnVtYmVyID0gX2xFc3RhYmxpc2htZW50TWVkYWwubWVkYWxzICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50TWVkYWxzLnVwZGF0ZSh7IF9pZDogX2xFc3RhYmxpc2htZW50TWVkYWwuX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fdXNlcjogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGFsczogX2xOZXdRdWFudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpb25fdXNlcjogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnQuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2xVc2VyRGV0YWlsLmdyYW50X3N0YXJ0X3BvaW50cyAhPT0gdW5kZWZpbmVkICYmIF9sVXNlckRldGFpbC5ncmFudF9zdGFydF9wb2ludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xFeHBpcmVEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2xVc2VyU3RhcnRQb2ludHM6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICd1c2VyX3N0YXJ0X3BvaW50cycgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9sQ3VycmVudEVzdGFibGlzaG1lbnRNZWRhbDogRXN0YWJsaXNobWVudE1lZGFsID0gRXN0YWJsaXNobWVudE1lZGFscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCwgZXN0YWJsaXNobWVudF9pZDogX2VzdGFibGlzaG1lbnQuX2lkIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbE5ld1F1YW50aXR5OiBudW1iZXIgPSBfbEN1cnJlbnRFc3RhYmxpc2htZW50TWVkYWwubWVkYWxzICsgTnVtYmVyLnBhcnNlSW50KF9sVXNlclN0YXJ0UG9pbnRzLnZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMudXBkYXRlKHsgX2lkOiBfbEN1cnJlbnRFc3RhYmxpc2htZW50TWVkYWwuX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fdXNlcjogX3VzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGFsczogX2xOZXdRdWFudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXNlckRldGFpbHMudXBkYXRlKHsgX2lkOiBfbFVzZXJEZXRhaWwuX2lkIH0sIHsgJHNldDogeyBncmFudF9zdGFydF9wb2ludHM6IGZhbHNlIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VzdGFibGlzaG1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCcyMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzMwMCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNDAwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIGFsbG93IHJlc3RhdXJhbnQgZ2l2ZSBtZWRhbCB0byBzcGVjaWZpYyB1c2VyXG4gICAgICAgICAqL1xuICAgICAgICBnaXZlTWVkYWxUb1VzZXI6IGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcsIF91c2VySWQ6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IF9lc3RhYmxpc2htZW50OiBFc3RhYmxpc2htZW50O1xuICAgICAgICAgICAgbGV0IF9sVXNlckRldGFpbDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuXG4gICAgICAgICAgICBfZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbiAgICAgICAgICAgIGlmIChfZXN0YWJsaXNobWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChfZXN0YWJsaXNobWVudC5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2xFc3RhYmxpc2htZW50TWVkYWw6IEVzdGFibGlzaG1lbnRNZWRhbCA9IEVzdGFibGlzaG1lbnRNZWRhbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQsIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50Ll9pZCB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX2xFc3RhYmxpc2htZW50TWVkYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfbE5ld1F1YW50aXR5OiBudW1iZXIgPSBfbEVzdGFibGlzaG1lbnRNZWRhbC5tZWRhbHMgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudE1lZGFscy51cGRhdGUoeyBfaWQ6IF9sRXN0YWJsaXNobWVudE1lZGFsLl9pZCB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX3VzZXI6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGFsczogX2xOZXdRdWFudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudE1lZGFscy5pbnNlcnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW9uX3VzZXI6IF91c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiBfdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50Ll9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRhbHM6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzE2MCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignMTUwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIHJldHVybiBlc3RhYmxpc2htZW50IGlmIGV4aXN0IG8gbnVsbCBpZiBub3RcbiAgICAgICAgICovXG5cbiAgICAgICAgZ2V0Q3VycmVudEVzdGFibGlzaG1lbnRCeVVzZXI6IGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBlc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBfZXN0YWJsaXNobWVudElkIH0pO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGVzdGFibGlzaG1lbnQgIT0gXCJ1bmRlZmluZWRcIiB8fCBlc3RhYmxpc2htZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXN0YWJsaXNobWVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVFc3RhYmxpc2htZW50SXNBY3RpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICBpZiAodXNlckRldGFpbCkge1xuICAgICAgICAgICAgICAgIGxldCBlc3RhYmxpc2htZW50ID0gRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiB1c2VyRGV0YWlsLmVzdGFibGlzaG1lbnRfd29yayB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXN0YWJsaXNobWVudC5pc0FjdGl2ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgY3JlYXRlQ29sbGFib3JhdG9yVXNlcjogZnVuY3Rpb24gKCBfaW5mbyA6IGFueSApIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBBY2NvdW50cy5jcmVhdGVVc2VyKHtcbiAgICAgICAgICAgICAgICBlbWFpbDogX2luZm8uZW1haWwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IF9pbmZvLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBfaW5mby51c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwcm9maWxlOiBfaW5mby5wcm9maWxlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG4gICAgXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJvbGVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC9yb2xlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTWVudXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBNZW51IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvbWVudS5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgZ2V0TWVudXM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgbGV0IG1lbnVMaXN0OiBNZW51W10gPSBbXTtcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICBsZXQgcm9sZSA9IFJvbGVzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogdXNlckRldGFpbC5yb2xlX2lkIH0pO1xuICAgICAgICAgICAgTWVudXMuY29sbGVjdGlvbi5maW5kKHsgX2lkOiB7ICRpbjogcm9sZS5tZW51cyB9LCBpc19hY3RpdmU6IHRydWUgfSwgeyBzb3J0OiB7IG9yZGVyOiAxIH0gfSkuZm9yRWFjaChmdW5jdGlvbiA8TWVudT4obWVudSwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgbWVudUxpc3QucHVzaChtZW51KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG1lbnVMaXN0O1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBnZXRSb2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcm9sZTogc3RyaW5nID0gXCJcIjtcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICBpZih1c2VyRGV0YWlsKXtcbiAgICAgICAgICAgICAgICByb2xlID0gdXNlckRldGFpbC5yb2xlX2lkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJvbGU7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQWRtaW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnMTAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlV2FpdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcm9sZTogc3RyaW5nO1xuICAgICAgICAgICAgbGV0IHVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmRPbmUoeyB1c2VyX2lkOiB0aGlzLnVzZXJJZCB9KTtcbiAgICAgICAgICAgIHJvbGUgPSB1c2VyRGV0YWlsLnJvbGVfaWQ7XG4gICAgICAgICAgICBpZiAocm9sZSA9PT0gJzIwMCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0ZUNhc2hpZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnMzAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQ3VzdG9tZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCByb2xlOiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgcm9sZSA9IHVzZXJEZXRhaWwucm9sZV9pZDtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnNDAwJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlQ2hlZjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHJvbGU6IHN0cmluZztcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICByb2xlID0gdXNlckRldGFpbC5yb2xlX2lkO1xuICAgICAgICAgICAgaWYgKHJvbGUgPT09ICc1MDAnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRhdGVBZG1pbk9yU3VwZXJ2aXNvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHJvbGU6IHN0cmluZztcbiAgICAgICAgICAgIGxldCB1c2VyRGV0YWlsID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kT25lKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSk7XG4gICAgICAgICAgICByb2xlID0gdXNlckRldGFpbC5yb2xlX2lkO1xuICAgICAgICAgICAgaWYgKHJvbGUgPT09ICcxMDAnIHx8IHJvbGUgPT09ICc2MDAnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RGV0YWlsc0NvdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgY291bnQ6IG51bWJlcjtcbiAgICAgICAgICAgIGNvdW50ID0gVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kKHsgdXNlcl9pZDogdGhpcy51c2VySWQgfSkuY291bnQoKTtcbiAgICAgICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFZhbGlkYXRlIHVzZXIgaXMgYWN0aXZlXG4gICAgICAgICAqL1xuICAgICAgICB2YWxpZGF0ZVVzZXJJc0FjdGl2ZSA6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZE9uZSh7IHVzZXJfaWQ6IHRoaXMudXNlcklkIH0pO1xuICAgICAgICAgICAgaWYodXNlckRldGFpbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJEZXRhaWwuaXNfYWN0aXZlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG5cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuLy9pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG4vL2ltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5cbmltcG9ydCB7IFVzZXJEZXZpY2VzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC9kZXZpY2UuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV2aWNlLCBEZXZpY2UgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC9kZXZpY2UubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICB1c2VyRGV2aWNlc1ZhbGlkYXRpb246IGZ1bmN0aW9uICggX2RhdGEgOiBhbnkgKSB7XG4gICAgICAgICAgICB2YXIgX2RldmljZSA9IG5ldyBEZXZpY2UoKTtcbiAgICAgICAgICAgIHZhciBfdXNlckRldmljZSA9IFVzZXJEZXZpY2VzLmNvbGxlY3Rpb24uZmluZCh7dXNlcl9pZDogdGhpcy51c2VySWR9KTtcblxuICAgICAgICAgICAgX2RldmljZS5wbGF5ZXJfaWQgPSBfZGF0YS51c2VySWQ7XG4gICAgICAgICAgICBfZGV2aWNlLmlzX2FjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBfdXNlckRldmljZS5jb3VudCgpID09PSAwICkge1xuXG4gICAgICAgICAgICAgICAgVXNlckRldmljZXMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZCA6IE1ldGVvci51c2VySWQoKSxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlczogWyBfZGV2aWNlIF0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF91c2VyRGV2aWNlLmNvdW50KCkgPiAwICkge1xuICAgICAgICAgICAgICAgIF91c2VyRGV2aWNlLmZldGNoKCkuZm9yRWFjaCggKHVzcl9kZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9kZXZfdmFsID0gVXNlckRldmljZXMuY29sbGVjdGlvbi5maW5kKHsgXCJkZXZpY2VzLnBsYXllcl9pZFwiIDogX2RhdGEudXNlcklkIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV9kZXZfdmFsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJEZXZpY2VzLnVwZGF0ZSh7IF9pZCA6IHVzcl9kZXYuX2lkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAkYWRkVG9TZXQgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXM6ICBfZGV2aWNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJEZXZpY2VzLnVwZGF0ZSh7IFwiZGV2aWNlcy5wbGF5ZXJfaWRcIiA6IF9kYXRhLnVzZXJJZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJHNldCA6IHsgXCJkZXZpY2VzLiQuaXNfYWN0aXZlXCIgOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG4gICAgXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJMb2dpbiDCoH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1sb2dpbi5tb2RlbCc7XG5pbXBvcnQgeyBVc2Vyc0xvZ2luIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWxvZ2luLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSc7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIGluc2VydFVzZXJMb2dpbkluZm86IGZ1bmN0aW9uIChfcFVzZXJMb2dpbjogVXNlckxvZ2luKSB7XG4gICAgICAgICAgICBVc2Vyc0xvZ2luLmluc2VydChfcFVzZXJMb2dpbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hhbmdlVXNlclBhc3N3b3JkOiBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nLCBfbmV3UGFzc3dvcmQ6IHN0cmluZykge1xuICAgICAgICAgICAgQWNjb3VudHMuc2V0UGFzc3dvcmQoX3VzZXJJZCwgX25ld1Bhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXIubW9kZWwnO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlsLCBVc2VyRGV0YWlsUGVuYWx0eSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFdhaXRlckNhbGxEZXRhaWxzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC93YWl0ZXItY2FsbC1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBUYWJsZSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3RhYmxlLm1vZGVsJztcbmltcG9ydCB7IFRhYmxlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyUGVuYWx0aWVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvYXV0aC91c2VyLXBlbmFsdHkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBwZW5hbGl6ZUN1c3RvbWVyOiBmdW5jdGlvbiAoX3BDdXN0b21lclVzZXI6IFVzZXIpIHtcbiAgICAgICAgICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3BDdXN0b21lclVzZXIuX2lkIH0pO1xuICAgICAgICAgICAgbGV0IF9sVXNlckRldGFpbFBlbmFsdHk6IFVzZXJEZXRhaWxQZW5hbHR5ID0geyBkYXRlOiBuZXcgRGF0ZSgpIH07XG4gICAgICAgICAgICBVc2VyRGV0YWlscy51cGRhdGUoeyBfaWQ6IF9sVXNlckRldGFpbC5faWQgfSwgeyAkcHVzaDogeyBwZW5hbHRpZXM6IF9sVXNlckRldGFpbFBlbmFsdHkgfSB9KTtcblxuICAgICAgICAgICAgbGV0IF9sVXNlckRldGFpbEF1eDogVXNlckRldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyBfaWQ6IF9sVXNlckRldGFpbC5faWQgfSk7XG4gICAgICAgICAgICBsZXQgX2xNYXhVc2VyUGVuYWx0aWVzOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnbWF4X3VzZXJfcGVuYWx0aWVzJyB9KTtcbiAgICAgICAgICAgIGlmIChfbFVzZXJEZXRhaWxBdXgucGVuYWx0aWVzLmxlbmd0aCA+PSBOdW1iZXIoX2xNYXhVc2VyUGVuYWx0aWVzLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGxldCBfbExhc3RfZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKE1hdGgubWF4LmFwcGx5KG51bGwsIF9sVXNlckRldGFpbEF1eC5wZW5hbHRpZXMubWFwKGZ1bmN0aW9uIChwKSB7IHJldHVybiBuZXcgRGF0ZShwLmRhdGUpOyB9KSkpO1xuICAgICAgICAgICAgICAgIFVzZXJQZW5hbHRpZXMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogX3BDdXN0b21lclVzZXIuX2lkLFxuICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfZGF0ZTogX2xMYXN0X2RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHBlbmFsdGllczogX2xVc2VyRGV0YWlsQXV4LnBlbmFsdGllc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFVzZXJEZXRhaWxzLnVwZGF0ZSh7IF9pZDogX2xVc2VyRGV0YWlsLl9pZCB9LCB7ICRzZXQ6IHsgcGVuYWx0aWVzOiBbXSB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRVc2VycyhfcFVzZXJGaWx0ZXI6IHN0cmluZyk6IGFueSB7XG4gICAgICAgICAgICBsZXQgX2xVc2Vyc0lkOiBzdHJpbmdbXSA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgbGV0IF9sVXNlckZpbHRlciA9IFVzZXJzLmNvbGxlY3Rpb24uZmluZCh7XG4gICAgICAgICAgICAgICAgJG9yOiBbeyBcInVzZXJuYW1lXCI6IHsgJHJlZ2V4OiBfcFVzZXJGaWx0ZXIgfSB9LFxuICAgICAgICAgICAgICAgIHsgXCJlbWFpbHMuYWRkcmVzc1wiOiB7ICRyZWdleDogX3BVc2VyRmlsdGVyIH0gfSxcbiAgICAgICAgICAgICAgICB7IFwicHJvZmlsZS5uYW1lXCI6IHsgJHJlZ2V4OiBfcFVzZXJGaWx0ZXIgfSB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoX2xVc2VyRmlsdGVyLmNvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgX2xVc2VyRmlsdGVyLmZvckVhY2goKHVzZXI6IFVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgX2xVc2Vyc0lkLnB1c2godXNlci5faWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9sVXNlcnNJZDtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSc7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLm1vZGVsJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuXG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICBhZGRFbWFpbDogZnVuY3Rpb24gKCBuZXdFbWFpbCA6IHN0cmluZyApIHtcbiAgICAgICAgICAgIEFjY291bnRzLmFkZEVtYWlsKE1ldGVvci51c2VySWQoKSwgbmV3RW1haWwsIHRydWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICByZW1vdmVFbWFpbDogZnVuY3Rpb24gKCBvbGRFbWFpbCA6IHN0cmluZyApIHtcbiAgICAgICAgICAgIEFjY291bnRzLnJlbW92ZUVtYWlsKE1ldGVvci51c2VySWQoKSwgb2xkRW1haWwpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENvdW50cmllcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvdW50cnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9jb3VudHJ5Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgVGFibGVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC90YWJsZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvdGFibGUubW9kZWwnO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG5cbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIGdldENvdW50cnlCeUVzdGFibGlzaG1lbnRJZDogZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuXG4gICAgICAgICAgICBsZXQgdGFibGVzX2xlbmd0aDogbnVtYmVyO1xuICAgICAgICAgICAgbGV0IGNvdW50cnk6IENvdW50cnk7XG4gICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudDogRXN0YWJsaXNobWVudDtcblxuICAgICAgICAgICAgZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2VzdGFibGlzaG1lbnRJZCB9KTtcbiAgICAgICAgICAgIGNvdW50cnkgPSBDb3VudHJpZXMuZmluZE9uZSh7IF9pZDogZXN0YWJsaXNobWVudC5jb3VudHJ5SWQgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjb3VudHJ5Lm5hbWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IEVtYWlsIH0gZnJvbSAnbWV0ZW9yL2VtYWlsJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcbmltcG9ydCB7IExhbmdEaWN0aW9uYXJ5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvZW1haWwtY29udGVudC5tb2RlbCc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFRhYmxlcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvdGFibGUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBUYWJsZSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3RhYmxlLm1vZGVsJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUGF5bWVudEhpc3RvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkubW9kZWwnO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci5tb2RlbCc7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuaW1wb3J0IHsgU1NSIH0gZnJvbSAnbWV0ZW9yL21ldGVvcmhhY2tzOnNzcic7XG5pbXBvcnQgeyBSZXdhcmRQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5tb2RlbCc7XG5pbXBvcnQgeyBSZXdhcmRQb2ludHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UG9pbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnRzLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9lc3RhYmxpc2htZW50LXBvaW50Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRNZWRhbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRNZWRhbCB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvZXN0YWJsaXNobWVudC1tZWRhbC5tb2RlbCc7XG5cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gZXZhbHVhdGVzIGRlIHRoZSBjdXJyZW50IG1lZGFscyBmb3Igc2VuZCB3YXJuaW5nIHRvIHVzZXIgZXZlcnkgdHdvIGRheXNcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrQ3VycmVudE1lZGFsczogZnVuY3Rpb24gKF9jb3VudHJ5SWQ6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IHBhcmFtZXRlcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZnJvbV9lbWFpbCcgfSk7XG4gICAgICAgICAgICBsZXQgaXVyZXN0X3VybDogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X3VybCcgfSk7XG4gICAgICAgICAgICBsZXQgZmFjZWJvb2s6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2ZhY2Vib29rX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IHR3aXR0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ3R3aXR0ZXJfbGluaycgfSk7XG4gICAgICAgICAgICBsZXQgaW5zdGFncmFtOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpbnN0YWdyYW1fbGluaycgfSk7XG4gICAgICAgICAgICBsZXQgaXVyZXN0SW1nVmFyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpdXJlc3RfaW1nX3VybCcgfSk7XG4gICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudHNBcnJheTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBtYXhfbWVkYWxzOiBudW1iZXIgPSBwYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdtYXhfbWVkYWxzX3RvX2FkdmljZScgfSkudmFsdWUpO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjb3VudHJ5SWQ6IF9jb3VudHJ5SWQsIGlzX2JldGFfdGVzdGVyOiBmYWxzZSwgaXNBY3RpdmU6IHRydWUgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudHNBcnJheS5wdXNoKGVzdGFibGlzaG1lbnQuX2lkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50UG9pbnRzLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IHsgJGluOiBlc3RhYmxpc2htZW50c0FycmF5IH0sIG5lZ2F0aXZlX2JhbGFuY2U6IGZhbHNlLCBuZWdhdGl2ZV9hZHZpY2VfY291bnRlcjogeyAkZXE6IDAgfSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50UG9pbnQ+KGVzdGFibGlzaG1lbnRQb2ludCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVzdGFibGlzaG1lbnRQb2ludC5jdXJyZW50X3BvaW50cyA8PSBtYXhfbWVkYWxzICYmIGVzdGFibGlzaG1lbnRQb2ludC5jdXJyZW50X3BvaW50cyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgX2lkOiBlc3RhYmxpc2htZW50UG9pbnQuZXN0YWJsaXNobWVudF9pZCB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50Pihlc3RhYmxpc2htZW50MiwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXNlcjogVXNlciA9IFVzZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogZXN0YWJsaXNobWVudDIuY3JlYXRpb25fdXNlciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCA9IEVtYWlsQ29udGVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgbGFuZ3VhZ2U6IHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdyZWV0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdncmVldFZhcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdyZWV0aW5nOiBzdHJpbmcgPSAodXNlci5wcm9maWxlICYmIHVzZXIucHJvZmlsZS5mdWxsX25hbWUpID8gKGdyZWV0VmFyICsgJyAnICsgdXNlci5wcm9maWxlLmZ1bGxfbmFtZSArIFwiLFwiKSA6IGdyZWV0VmFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgU1NSLmNvbXBpbGVUZW1wbGF0ZSgnY2hlY2tNZWRhbHNFbWFpbEh0bWwnLCBBc3NldHMuZ2V0VGV4dCgnY2hlY2stbWVkYWxzLWVtYWlsLmh0bWwnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbWFpbERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JlZXRpbmc6IGdyZWV0aW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWluZGVyTXNnVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlbWluZGVyQ3VycmVudE1lZGFsczEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50TmFtZTogZXN0YWJsaXNobWVudDIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJDdXJyZW50TWVkYWxzMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNZWRhbHM6IGVzdGFibGlzaG1lbnRQb2ludC5jdXJyZW50X3BvaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjM6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJDdXJyZW50TWVkYWxzMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWluZGVyTXNnVmFyNDogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdyZW1pbmRlckN1cnJlbnRNZWRhbHM0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnYXJkVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlZ2FyZFZhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbGxvd01zZ1ZhcjogTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdmb2xsb3dNc2dWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdXJlc3RVcmw6IGl1cmVzdF91cmwudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFjZWJvb2tMaW5rOiBmYWNlYm9vay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTGluazogdHdpdHRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWdyYW1MaW5rOiBpbnN0YWdyYW0udmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXVyZXN0SW1nVmFyOiBpdXJlc3RJbWdWYXIudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIEVtYWlsLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiB1c2VyLmVtYWlsc1swXS5hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IHBhcmFtZXRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0OiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2NoZWNrTWVkYWxzU3ViamVjdFZhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6IFNTUi5yZW5kZXIoJ2NoZWNrTWVkYWxzRW1haWxIdG1sJywgZW1haWxEYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gZXZhbHVhdGVzIGRlIHRoZSBjdXJyZW50IG1lZGFscyBmb3Igc2VuZCB3YXJuaW5nIHRvIHVzZXIgZXZlcnkgdHdvIGRheXNcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrTmVnYXRpdmVNZWRhbHM6IGZ1bmN0aW9uIChfY291bnRyeUlkOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2Zyb21fZW1haWwnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdF91cmw6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2l1cmVzdF91cmwnIH0pO1xuICAgICAgICAgICAgbGV0IGZhY2Vib29rOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmYWNlYm9va19saW5rJyB9KTtcbiAgICAgICAgICAgIGxldCB0d2l0dGVyOiBQYXJhbWV0ZXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICd0d2l0dGVyX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGluc3RhZ3JhbTogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaW5zdGFncmFtX2xpbmsnIH0pO1xuICAgICAgICAgICAgbGV0IGl1cmVzdEltZ1ZhcjogUGFyYW1ldGVyID0gUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnaXVyZXN0X2ltZ191cmwnIH0pO1xuICAgICAgICAgICAgbGV0IG1heF9kYXlzOiBudW1iZXIgPSBwYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdtYXhfZGF5c190b19hZHZpY2UnIH0pLnZhbHVlKTtcbiAgICAgICAgICAgIGxldCBlc3RhYmxpc2htZW50c0FycmF5OiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjb3VudHJ5SWQ6IF9jb3VudHJ5SWQsIGlzX2JldGFfdGVzdGVyOiBmYWxzZSwgaXNBY3RpdmU6IHRydWUgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudCwgaW5kZXgsIGFyKSB7XG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudHNBcnJheS5wdXNoKGVzdGFibGlzaG1lbnQuX2lkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBFc3RhYmxpc2htZW50UG9pbnRzLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IHsgJGluOiBlc3RhYmxpc2htZW50c0FycmF5IH0sIG5lZ2F0aXZlX2JhbGFuY2U6IHRydWUsIG5lZ2F0aXZlX2FkdmljZV9jb3VudGVyOiB7ICRndGU6IDAgfSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50UG9pbnQ+KGVzdGFibGlzaG1lbnRQb2ludCwgaW5kZXgsIGFyKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgYWR2aWNlX2F1eDogbnVtYmVyID0gZXN0YWJsaXNobWVudFBvaW50Lm5lZ2F0aXZlX2FkdmljZV9jb3VudGVyICsgMTtcbiAgICAgICAgICAgICAgICBpZiAoZXN0YWJsaXNobWVudFBvaW50Lm5lZ2F0aXZlX2FkdmljZV9jb3VudGVyIDw9IG1heF9kYXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRQb2ludHMuY29sbGVjdGlvbi51cGRhdGUoeyBfaWQ6IGVzdGFibGlzaG1lbnRQb2ludC5faWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lZ2F0aXZlX2FkdmljZV9jb3VudGVyOiBlc3RhYmxpc2htZW50UG9pbnQubmVnYXRpdmVfYWR2aWNlX2NvdW50ZXIgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uZmluZCh7IF9pZDogZXN0YWJsaXNobWVudFBvaW50LmVzdGFibGlzaG1lbnRfaWQgfSkuZm9yRWFjaChmdW5jdGlvbiA8RXN0YWJsaXNobWVudD4oZXN0YWJsaXNobWVudDIsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVzZXI6IFVzZXIgPSBVc2Vycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnQyLmNyZWF0aW9uX3VzZXIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQgPSBFbWFpbENvbnRlbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IGxhbmd1YWdlOiB1c2VyLnByb2ZpbGUubGFuZ3VhZ2VfY29kZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBncmVldFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnZ3JlZXRWYXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBncmVldGluZzogc3RyaW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUuZnVsbF9uYW1lKSA/IChncmVldFZhciArICcgJyArIHVzZXIucHJvZmlsZS5mdWxsX25hbWUgKyBcIixcIikgOiBncmVldFZhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNTUi5jb21waWxlVGVtcGxhdGUoJ2NoZWNrTmVnYXRpdmVFbWFpbEh0bWwnLCBBc3NldHMuZ2V0VGV4dCgnY2hlY2stbmVnYXRpdmUtZW1haWwuaHRtbCcpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVtYWlsRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmVldGluZzogZ3JlZXRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtaW5kZXJNc2dWYXI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50TmFtZTogZXN0YWJsaXNobWVudDIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TWVkYWxzOiBlc3RhYmxpc2htZW50UG9pbnQuY3VycmVudF9wb2ludHMgKiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjM6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlck1zZ1ZhcjQ6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdhcmRWYXI6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVnYXJkVmFyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9sbG93TXNnVmFyOiBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2ZvbGxvd01zZ1ZhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl1cmVzdFVybDogaXVyZXN0X3VybC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWNlYm9va0xpbms6IGZhY2Vib29rLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR3aXR0ZXJMaW5rOiB0d2l0dGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhZ3JhbUxpbms6IGluc3RhZ3JhbS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdXJlc3RJbWdWYXI6IGl1cmVzdEltZ1Zhci52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgRW1haWwuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IHVzZXIuZW1haWxzWzBdLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogcGFyYW1ldGVyLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3Q6IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnY2hlY2tOZWdhdGl2ZVN1YmplY3RWYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sOiBTU1IucmVuZGVyKCdjaGVja05lZ2F0aXZlRW1haWxIdG1sJywgZW1haWxEYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogZXN0YWJsaXNobWVudFBvaW50LmVzdGFibGlzaG1lbnRfaWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fZGF0ZTogbmV3IERhdGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50TWVkYWxzLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IGVzdGFibGlzaG1lbnRQb2ludC5lc3RhYmxpc2htZW50X2lkIH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnRNZWRhbD4oZXN0YWJsaXNobWVudE1lZGFsLCBpbmRleCwgYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRNZWRhbHMuY29sbGVjdGlvbi51cGRhdGUoeyBfaWQ6IGVzdGFibGlzaG1lbnRNZWRhbC5faWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGdldHMgdGhlIHZhbHVlIGZyb20gRW1haWxDb250ZW50IGNvbGxlY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IF9jb3VudHJ5SWRcbiAgICAgICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RW1haWxDb250ZW50KF9sYW5nRGljdGlvbmFyeTogTGFuZ0RpY3Rpb25hcnlbXSwgX2xhYmVsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gX2xhbmdEaWN0aW9uYXJ5LmZpbHRlcihmdW5jdGlvbiAod29yZFRyYWR1Y2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmRUcmFkdWNlZC5sYWJlbCA9PSBfbGFiZWw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVswXS50cmFkdWN0aW9uO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBjb252ZXJ0IHRoZSBkYXkgYW5kIHJldHVybmluZyBpbiBmb3JtYXQgeXl5eS1tLWRcbiAgICAgICAgICogQHBhcmFtIHtEYXRlfSBfZGF0ZVxuICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBjb252ZXJ0RGF0ZVRvU2ltcGxlOiBmdW5jdGlvbiAoX2RhdGU6IERhdGUpIHtcbiAgICAgICAgICAgIGxldCB5ZWFyID0gX2RhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIGxldCBtb250aCA9IF9kYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgbGV0IGRheSA9IF9kYXRlLmdldERhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBkYXkudG9TdHJpbmcoKSArICcvJyArIG1vbnRoLnRvU3RyaW5nKCkgKyAnLycgKyB5ZWFyLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ291bnRyaWVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9jb3VudHJ5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSW52b2ljZXNJbmZvIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ3lnSW52b2ljZXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wYXltZW50L2N5Zy1pbnZvaWNlcy5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvbXBhbnlJbmZvLCBDbGllbnRJbmZvLCBFc3RhYmxpc2htZW50SW5mbyB9IGZyb20gJy4uLy4uL21vZGVscy9wYXltZW50L2N5Zy1pbnZvaWNlLm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQmFnUGxhbnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9wb2ludHMvYmFnLXBsYW5zLmNvbGxlY3Rpb24nO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBhbGxvdyBnZW5lcmF0ZSBpdXJlc3QgaW52b2ljZSBmb3IgYWRtaW4gZXN0YWJsaXNobWVudFxuICAgICAgICAgKiBAcGFyYW0geyBzdHJpbmcgfSBfcGF5bWVudEhpc3RvcnlJZFxuICAgICAgICAgKiBAcGFyYW0geyBzdHJpbmcgfSBfdXNlcklkIFxuICAgICAgICAgKi9cbiAgICAgICAgZ2VuZXJhdGVJbnZvaWNlSW5mbzogZnVuY3Rpb24gKF9wYXltZW50SGlzdG9yeUlkOiBzdHJpbmcsIF91c2VySWQ6IHN0cmluZykge1xuXG4gICAgICAgICAgICBsZXQgX2N1cnJlbnREYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGxldCBfZmlyc3RNb250aERheTogRGF0ZSA9IG5ldyBEYXRlKF9jdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLCBfY3VycmVudERhdGUuZ2V0TW9udGgoKSwgMSk7XG4gICAgICAgICAgICBsZXQgX2xhc3RNb250aERheTogRGF0ZSA9IG5ldyBEYXRlKF9jdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLCBfY3VycmVudERhdGUuZ2V0TW9udGgoKSArIDEsIDApO1xuXG4gICAgICAgICAgICBsZXQgbFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcbiAgICAgICAgICAgIGxldCBsQ291bnRyeSA9IENvdW50cmllcy5maW5kT25lKHsgX2lkOiBsVXNlckRldGFpbC5jb3VudHJ5X2lkIH0pO1xuICAgICAgICAgICAgbGV0IGxQYXltZW50SGlzdG9yeSA9IFBheW1lbnRzSGlzdG9yeS5maW5kT25lKHsgX2lkOiBfcGF5bWVudEhpc3RvcnlJZCB9KTtcbiAgICAgICAgICAgIGxldCBpbnZvaWNlSW5mbyA9IEludm9pY2VzSW5mby5maW5kT25lKHsgY291bnRyeV9pZDogbENvdW50cnkuX2lkIH0pO1xuXG4gICAgICAgICAgICBsZXQgdmFyX3Jlc29sdXRpb246IHN0cmluZztcbiAgICAgICAgICAgIGxldCB2YXJfcHJlZml4OiBzdHJpbmc7XG4gICAgICAgICAgICBsZXQgdmFyX3N0YXJ0X3ZhbHVlOiBudW1iZXI7XG4gICAgICAgICAgICBsZXQgdmFyX2N1cnJlbnRfdmFsdWU6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCB2YXJfZW5kX3ZhbHVlOiBudW1iZXI7XG4gICAgICAgICAgICBsZXQgdmFyX3N0YXJ0X2RhdGU6IERhdGU7XG4gICAgICAgICAgICBsZXQgdmFyX2VuZF9kYXRlOiBEYXRlO1xuICAgICAgICAgICAgbGV0IHZhcl9lbmFibGVfdHdvOiBib29sZWFuO1xuICAgICAgICAgICAgbGV0IHZhcl9zdGFydF9uZXc6IGJvb2xlYW47XG5cbiAgICAgICAgICAgIGxldCBjb21wYW55X25hbWUgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9uYW1lJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X2FkZHJlc3MgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9hZGRyZXNzJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X3Bob25lID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfcGhvbmUnIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfY291bnRyeSA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2NvdW50cnknIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfY2l0eSA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2NpdHknIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfbml0ID0gUGFyYW1ldGVycy5maW5kT25lKHsgbmFtZTogJ2NvbXBhbnlfbml0JyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjb21wYW55X3JlZ2ltZSA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X3JlZ2ltZScgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9jb250cmlidXRpb24gPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9jb250cmlidXRpb24nIH0pLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGNvbXBhbnlfcmV0YWluZXIgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29tcGFueV9yZXRhaW5lcicgfSkudmFsdWU7XG4gICAgICAgICAgICBsZXQgY29tcGFueV9hZ2VudF9yZXRhaW5lciA9IFBhcmFtZXRlcnMuZmluZE9uZSh7IG5hbWU6ICdjb21wYW55X2FnZW50X3JldGFpbmVyJyB9KS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBpbnZvaWNlX2dlbmVyYXRlZF9tc2cgPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnaW52b2ljZV9nZW5lcmF0ZWRfbXNnJyB9KS52YWx1ZTtcblxuICAgICAgICAgICAgbGV0IGVzdGFibGlzaG1lbnRzSW5mb0FycmF5OiBFc3RhYmxpc2htZW50SW5mb1tdID0gW107XG5cbiAgICAgICAgICAgIC8vR2VuZXJhdGUgY29uc2VjdXRpdmVcbiAgICAgICAgICAgIGlmIChpbnZvaWNlSW5mby5lbmFibGVfdHdvID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGludm9pY2VJbmZvLnN0YXJ0X25ld192YWx1ZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9jdXJyZW50X3ZhbHVlID0gaW52b2ljZUluZm8uc3RhcnRfdmFsdWVfb25lO1xuICAgICAgICAgICAgICAgICAgICB2YXJfZW5hYmxlX3R3byA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXJfc3RhcnRfbmV3ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyX2N1cnJlbnRfdmFsdWUgPSBpbnZvaWNlSW5mby5jdXJyZW50X3ZhbHVlICsgMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhcl9jdXJyZW50X3ZhbHVlID09IGludm9pY2VJbmZvLmVuZF92YWx1ZV9vbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9lbmFibGVfdHdvID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX2VuYWJsZV90d28gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXJfcmVzb2x1dGlvbiA9IGludm9pY2VJbmZvLnJlc29sdXRpb25fb25lO1xuICAgICAgICAgICAgICAgIHZhcl9wcmVmaXggPSBpbnZvaWNlSW5mby5wcmVmaXhfb25lO1xuICAgICAgICAgICAgICAgIHZhcl9zdGFydF92YWx1ZSA9IGludm9pY2VJbmZvLnN0YXJ0X3ZhbHVlX29uZTtcbiAgICAgICAgICAgICAgICB2YXJfZW5kX3ZhbHVlID0gaW52b2ljZUluZm8uZW5kX3ZhbHVlX29uZTtcbiAgICAgICAgICAgICAgICB2YXJfc3RhcnRfZGF0ZSA9IGludm9pY2VJbmZvLnN0YXJ0X2RhdGVfb25lO1xuICAgICAgICAgICAgICAgIHZhcl9lbmRfZGF0ZSA9IGludm9pY2VJbmZvLmVuZF9kYXRlX29uZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGludm9pY2VJbmZvLnN0YXJ0X25ld192YWx1ZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9jdXJyZW50X3ZhbHVlID0gaW52b2ljZUluZm8uc3RhcnRfdmFsdWVfdHdvO1xuICAgICAgICAgICAgICAgICAgICB2YXJfZW5hYmxlX3R3byA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXJfY3VycmVudF92YWx1ZSA9IGludm9pY2VJbmZvLmN1cnJlbnRfdmFsdWUgKyAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFyX2N1cnJlbnRfdmFsdWUgPT0gaW52b2ljZUluZm8uZW5kX3ZhbHVlX3R3bykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX2VuYWJsZV90d28gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcl9zdGFydF9uZXcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX2VuYWJsZV90d28gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyX3N0YXJ0X25ldyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhcl9yZXNvbHV0aW9uID0gaW52b2ljZUluZm8ucmVzb2x1dGlvbl90d287XG4gICAgICAgICAgICAgICAgdmFyX3ByZWZpeCA9IGludm9pY2VJbmZvLnByZWZpeF90d287XG4gICAgICAgICAgICAgICAgdmFyX3N0YXJ0X3ZhbHVlID0gaW52b2ljZUluZm8uc3RhcnRfdmFsdWVfdHdvO1xuICAgICAgICAgICAgICAgIHZhcl9lbmRfdmFsdWUgPSBpbnZvaWNlSW5mby5lbmRfdmFsdWVfdHdvO1xuICAgICAgICAgICAgICAgIHZhcl9zdGFydF9kYXRlID0gaW52b2ljZUluZm8uc3RhcnRfZGF0ZV90d287XG4gICAgICAgICAgICAgICAgdmFyX2VuZF9kYXRlID0gaW52b2ljZUluZm8uZW5kX2RhdGVfdHdvO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBJbnZvaWNlc0luZm8uY29sbGVjdGlvbi51cGRhdGUoeyBfaWQ6IGludm9pY2VJbmZvLl9pZCB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF92YWx1ZTogdmFyX2N1cnJlbnRfdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVfdHdvOiB2YXJfZW5hYmxlX3R3byxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0X25ld192YWx1ZTogdmFyX3N0YXJ0X25ld1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBjb21wYW55X2luZm86IENvbXBhbnlJbmZvID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGNvbXBhbnlfbmFtZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBjb21wYW55X2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgcGhvbmU6IGNvbXBhbnlfcGhvbmUsXG4gICAgICAgICAgICAgICAgY291bnRyeTogY29tcGFueV9jb3VudHJ5LFxuICAgICAgICAgICAgICAgIGNpdHk6IGNvbXBhbnlfY2l0eSxcbiAgICAgICAgICAgICAgICBuaXQ6IGNvbXBhbnlfbml0LFxuICAgICAgICAgICAgICAgIHJlZ2ltZTogY29tcGFueV9yZWdpbWUsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBjb21wYW55X2NvbnRyaWJ1dGlvbixcbiAgICAgICAgICAgICAgICByZXRhaW5lcjogY29tcGFueV9yZXRhaW5lcixcbiAgICAgICAgICAgICAgICBhZ2VudF9yZXRhaW50ZXI6IGNvbXBhbnlfYWdlbnRfcmV0YWluZXIsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9udW1iZXI6IHZhcl9yZXNvbHV0aW9uLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fcHJlZml4OiB2YXJfcHJlZml4LFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fc3RhcnRfZGF0ZTogdmFyX3N0YXJ0X2RhdGUsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbl9lbmRfZGF0ZTogdmFyX2VuZF9kYXRlLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fc3RhcnRfdmFsdWU6IHZhcl9zdGFydF92YWx1ZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25fZW5kX3ZhbHVlOiB2YXJfZW5kX3ZhbHVlLnRvU3RyaW5nKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxldCBjbGllbnRfaW5mbzogQ2xpZW50SW5mbyA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBNZXRlb3IudXNlcigpLnByb2ZpbGUuZnVsbF9uYW1lLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IGxVc2VyRGV0YWlsLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgY291bnRyeTogbENvdW50cnkubmFtZSxcbiAgICAgICAgICAgICAgICBjaXR5OiBsVXNlckRldGFpbC5jaXR5X2lkLFxuICAgICAgICAgICAgICAgIGlkZW50aWZpY2F0aW9uOiBsVXNlckRldGFpbC5kbmlfbnVtYmVyLFxuICAgICAgICAgICAgICAgIHBob25lOiBsVXNlckRldGFpbC5jb250YWN0X3Bob25lLFxuICAgICAgICAgICAgICAgIGVtYWlsOiBNZXRlb3IudXNlcigpLmVtYWlsc1swXS5hZGRyZXNzXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsUGF5bWVudEhpc3RvcnkuZXN0YWJsaXNobWVudF9pZHMuZm9yRWFjaCgoZXN0YWJsaXNobWVudEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZXN0YWJsaXNobWVudEluZm86IEVzdGFibGlzaG1lbnRJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50X25hbWU6IEVzdGFibGlzaG1lbnRzLmZpbmRPbmUoeyBfaWQ6IGVzdGFibGlzaG1lbnRFbGVtZW50LmVzdGFibGlzaG1lbnRJZCB9KS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBiYWdfcGxhbl9uYW1lOiBCYWdQbGFucy5maW5kT25lKHsgX2lkOiBlc3RhYmxpc2htZW50RWxlbWVudC5iYWdQbGFuSWQgfSkubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYmFnX3BsYW5fY3VycmVuY3k6IGVzdGFibGlzaG1lbnRFbGVtZW50LmJhZ1BsYW5DdXJyZW5jeSxcbiAgICAgICAgICAgICAgICAgICAgYmFnX3BsYW5fcG9pbnRzOiBlc3RhYmxpc2htZW50RWxlbWVudC5iYWdQbGFuUG9pbnRzLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIGJhZ19wbGFuX3ByaWNlOiBlc3RhYmxpc2htZW50RWxlbWVudC5iYWdQbGFuUHJpY2UudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0X3BvaW50czogZXN0YWJsaXNobWVudEVsZW1lbnQuY3JlZGl0UG9pbnRzLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdF9wcmljZTogZXN0YWJsaXNobWVudEVsZW1lbnQuY3JlZGl0UHJpY2UudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudHNJbmZvQXJyYXkucHVzaChlc3RhYmxpc2htZW50SW5mbyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgQ3lnSW52b2ljZXMuY29sbGVjdGlvbi5pbnNlcnQoe1xuICAgICAgICAgICAgICAgIGNyZWF0aW9uX3VzZXI6IE1ldGVvci51c2VySWQoKSxcbiAgICAgICAgICAgICAgICBjcmVhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIHBheW1lbnRfaGlzdG9yeV9pZDogbFBheW1lbnRIaXN0b3J5Ll9pZCxcbiAgICAgICAgICAgICAgICBjb3VudHJ5X2lkOiBsQ291bnRyeS5faWQsXG4gICAgICAgICAgICAgICAgbnVtYmVyOiB2YXJfY3VycmVudF92YWx1ZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRpb25fZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBwYXltZW50X21ldGhvZDogJ1JFU19QQVlNRU5UX0hJU1RPUlkuQ0NfUEFZTUVOVF9NRVRIT0QnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUkVTX1BBWU1FTlRfSElTVE9SWS5ERVNDUklQVElPTicsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBfZmlyc3RNb250aERheS5nZXREYXRlKCkgKyAnLycgKyAoX2ZpcnN0TW9udGhEYXkuZ2V0TW9udGgoKSArIDEpICsgJy8nICsgX2ZpcnN0TW9udGhEYXkuZ2V0RnVsbFllYXIoKSArXG4gICAgICAgICAgICAgICAgICAgICcgLSAnICsgX2xhc3RNb250aERheS5nZXREYXRlKCkgKyAnLycgKyAoX2xhc3RNb250aERheS5nZXRNb250aCgpICsgMSkgKyAnLycgKyBfbGFzdE1vbnRoRGF5LmdldEZ1bGxZZWFyKCksXG4gICAgICAgICAgICAgICAgYW1vdW50X25vX2l2YTogTWV0ZW9yLmNhbGwoJ2dldFJldHVybkJhc2UnLCBsUGF5bWVudEhpc3RvcnkucGF5bWVudFZhbHVlKS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHN1YnRvdGFsOiBsUGF5bWVudEhpc3RvcnkucGF5bWVudFZhbHVlLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgaXZhOiBcIjBcIixcbiAgICAgICAgICAgICAgICB0b3RhbDogbFBheW1lbnRIaXN0b3J5LnBheW1lbnRWYWx1ZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGN1cnJlbmN5OiBsUGF5bWVudEhpc3RvcnkuY3VycmVuY3ksXG4gICAgICAgICAgICAgICAgY29tcGFueV9pbmZvOiBjb21wYW55X2luZm8sXG4gICAgICAgICAgICAgICAgY2xpZW50X2luZm86IGNsaWVudF9pbmZvLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlZF9jb21wdXRlcl9tc2c6IGludm9pY2VfZ2VuZXJhdGVkX21zZyxcbiAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50c0luZm86IGVzdGFibGlzaG1lbnRzSW5mb0FycmF5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICogVGhpcyBmdW5jdGlvbiBnZXRzIHRoZSB0YXggdmFsdWUgYWNjb3JkaW5nIHRvIHRoZSB2YWx1ZVxuICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBfcGF5bWVudFZhbHVlXG4gICAgICAgICovXG4gICAgICAgIGdldFZhbHVlVGF4OiBmdW5jdGlvbiAoX3BheW1lbnRWYWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJUYXggPSBQYXJhbWV0ZXJzLmZpbmRPbmUoeyBuYW1lOiAnY29sb21iaWFfdGF4X2l2YScgfSk7XG4gICAgICAgICAgICBsZXQgcGVyY2VudFZhbHVlID0gTnVtYmVyKHBhcmFtZXRlclRheC52YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gKF9wYXltZW50VmFsdWUgKiBwZXJjZW50VmFsdWUpIC8gMTAwO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGdldHMgdGhlIHRheCB2YWx1ZSBhY2NvcmRpbmcgdG8gdGhlIHZhbHVlXG4gICAgICAgICogQHBhcmFtIHtudW1iZXJ9IF9wYXltZW50VmFsdWVcbiAgICAgICAgKi9cbiAgICAgICAgZ2V0UmV0dXJuQmFzZTogZnVuY3Rpb24gKF9wYXltZW50VmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgICAgICBsZXQgYW1vdW50UGVyY2VudDogbnVtYmVyID0gTWV0ZW9yLmNhbGwoJ2dldFZhbHVlVGF4JywgX3BheW1lbnRWYWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gX3BheW1lbnRWYWx1ZSAtIGFtb3VudFBlcmNlbnQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IEVtYWlsIH0gZnJvbSAnbWV0ZW9yL2VtYWlsJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9hdXRoL3VzZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci5tb2RlbCc7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuaW1wb3J0IHsgU1NSIH0gZnJvbSAnbWV0ZW9yL21ldGVvcmhhY2tzOnNzcic7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIHZhbGlkYXRlIGlmIGVzdGFibGlzaG1lbnQgdHJpYWwgcGVyaW9kIGhhcyBlbmRlZFxuICAgICAgICAgKi9cbiAgICAgICAgdmFsaWRhdGVUcmlhbFBlcmlvZDogZnVuY3Rpb24gKF9jb3VudHJ5SWQ6IHN0cmluZykge1xuXG4gICAgICAgICAgICB2YXIgY3VycmVudERhdGU6IERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJpbmc6IHN0cmluZyA9IE1ldGVvci5jYWxsKCdjb252ZXJ0RGF0ZScsIGN1cnJlbnREYXRlKTtcbiAgICAgICAgICAgIHZhciB0cmlhbERheXM6IG51bWJlciA9IE51bWJlci5wYXJzZUludChQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICd0cmlhbF9kYXlzJyB9KS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgZmlyc3RBZHZpY2VEYXlzOiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnZmlyc3RfYWR2aWNlX2RheXMnIH0pLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBzZWNvbmRBZHZpY2VEYXlzOiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAnc2Vjb25kX2FkdmljZV9kYXlzJyB9KS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgdGhpcmRBZHZpY2VEYXlzOiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoUGFyYW1ldGVycy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBuYW1lOiAndGhpcmRfYWR2aWNlX2RheXMnIH0pLnZhbHVlKTtcblxuICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY291bnRyeUlkOiBfY291bnRyeUlkLCBpc0FjdGl2ZTogdHJ1ZSwgdHN0UGVyaW9kOiB0cnVlIH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcikge1xuICAgICAgICAgICAgICAgIGxldCBkaWZmID0gTWF0aC5yb3VuZCgoY3VycmVudERhdGUudmFsdWVPZigpIC0gZXN0YWJsaXNobWVudC5jcmVhdGlvbl9kYXRlLnZhbHVlT2YoKSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpO1xuICAgICAgICAgICAgICAgIGxldCBmb3J3YXJkRGF0ZTogRGF0ZSA9IE1ldGVvci5jYWxsKCdhZGREYXlzJywgZXN0YWJsaXNobWVudC5jcmVhdGlvbl9kYXRlLCB0cmlhbERheXMpO1xuICAgICAgICAgICAgICAgIGxldCBmb3J3YXJkU3RyaW5nOiBzdHJpbmcgPSBNZXRlb3IuY2FsbCgnY29udmVydERhdGUnLCBmb3J3YXJkRGF0ZSk7XG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0QWR2aWNlRGF0ZTogRGF0ZSA9IE1ldGVvci5jYWxsKCdzdWJzdHJhY3REYXlzJywgZm9yd2FyZERhdGUsIGZpcnN0QWR2aWNlRGF5cyk7XG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0QWR2aWNlU3RyaW5nOiBzdHJpbmcgPSBNZXRlb3IuY2FsbCgnY29udmVydERhdGUnLCBmaXJzdEFkdmljZURhdGUpO1xuICAgICAgICAgICAgICAgIGxldCBzZWNvbmRBZHZpY2VEYXRlOiBEYXRlID0gTWV0ZW9yLmNhbGwoJ3N1YnN0cmFjdERheXMnLCBmb3J3YXJkRGF0ZSwgc2Vjb25kQWR2aWNlRGF5cyk7XG4gICAgICAgICAgICAgICAgbGV0IHNlY29uZEFkdmljZVN0cmluZzogc3RyaW5nID0gTWV0ZW9yLmNhbGwoJ2NvbnZlcnREYXRlJywgc2Vjb25kQWR2aWNlRGF0ZSk7XG4gICAgICAgICAgICAgICAgbGV0IHRoaXJkQWR2aWNlRGF0ZTogRGF0ZSA9IE1ldGVvci5jYWxsKCdzdWJzdHJhY3REYXlzJywgZm9yd2FyZERhdGUsIHRoaXJkQWR2aWNlRGF5cyk7XG4gICAgICAgICAgICAgICAgbGV0IHRoaXJkQWR2aWNlU3RyaW5nOiBzdHJpbmcgPSBNZXRlb3IuY2FsbCgnY29udmVydERhdGUnLCB0aGlyZEFkdmljZURhdGUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPiB0cmlhbERheXMpIHtcbiAgICAgICAgICAgICAgICAgICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi51cGRhdGUoeyBfaWQ6IGVzdGFibGlzaG1lbnQuX2lkIH0sIHsgJHNldDogeyBpc0FjdGl2ZTogZmFsc2UsIHRzdFBlcmlvZDogZmFsc2UgfSB9KVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U3RyaW5nID09IGZpcnN0QWR2aWNlU3RyaW5nIHx8IGN1cnJlbnRTdHJpbmcgPT0gc2Vjb25kQWR2aWNlU3RyaW5nIHx8IGN1cnJlbnRTdHJpbmcgPT0gdGhpcmRBZHZpY2VTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1ldGVvci5jYWxsKCdzZW5kVHJpYWxFbWFpbCcsIGVzdGFibGlzaG1lbnQuY3JlYXRpb25fdXNlciwgZm9yd2FyZFN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFwiZW1haWxTZW5kXCI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGNvbnZlcnQgdGhlIGRheSBhbmQgcmV0dXJuaW5nIGluIGZvcm1hdCB5eXl5LW0tZFxuICAgICAgICAgKi9cbiAgICAgICAgY29udmVydERhdGU6IGZ1bmN0aW9uIChfZGF0ZTogRGF0ZSkge1xuICAgICAgICAgICAgbGV0IHllYXIgPSBfZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgbGV0IG1vbnRoID0gX2RhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgICAgICBsZXQgZGF5ID0gX2RhdGUuZ2V0RGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4geWVhci50b1N0cmluZygpICsgJy0nICsgbW9udGgudG9TdHJpbmcoKSArICctJyArIGRheS50b1N0cmluZygpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBhZGQgZGF5cyB0byB0aGUgcGFzc2VkIGRhdGVcbiAgICAgICAgICovXG4gICAgICAgIGFkZERheXM6IGZ1bmN0aW9uIChfZGF0ZTogRGF0ZSwgX2RheXM6IG51bWJlcikge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlKF9kYXRlKTtcbiAgICAgICAgICAgIHJlc3VsdC5zZXREYXRlKHJlc3VsdC5nZXREYXRlKCkgKyBfZGF5cyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBzdWJzdHJhY3QgZGF5cyB0byB0aGUgcGFzc2VkIGRhdGVcbiAgICAgICAgICovXG4gICAgICAgIHN1YnN0cmFjdERheXM6IGZ1bmN0aW9uIChfZGF0ZTogRGF0ZSwgX2RheXM6IG51bWJlcikge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlKF9kYXRlKTtcbiAgICAgICAgICAgIHJlc3VsdC5zZXREYXRlKHJlc3VsdC5nZXREYXRlKCkgLSBfZGF5cyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBzZW5kIGRlIGVtYWlsIHRvIHRoZSBhY2NvdW50IGFkbWluIHJlZ2lzdGVyZWQgaWYgdHJpYWwgcGVyaW9kIGlzIGdvaW5nIHRvIGVuZFxuICAgICAgICAgKi9cbiAgICAgICAgc2VuZFRyaWFsRW1haWw6IGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcsIF9mb3J3YXJkRGF0ZTogc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgdXNlcjogVXNlciA9IFVzZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX3VzZXJJZCB9KTtcbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXI6IFBhcmFtZXRlciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2Zyb21fZW1haWwnIH0pO1xuICAgICAgICAgICAgbGV0IGVtYWlsQ29udGVudDogRW1haWxDb250ZW50ID0gRW1haWxDb250ZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBsYW5ndWFnZTogdXNlci5wcm9maWxlLmxhbmd1YWdlX2NvZGUgfSk7XG4gICAgICAgICAgICB2YXIgdHJpYWxfZW1haWxfc3ViamVjdDogc3RyaW5nID0gZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeVswXS50cmFkdWN0aW9uO1xuICAgICAgICAgICAgdmFyIGdyZWV0aW5nOiBzdHJpbmcgPSAodXNlci5wcm9maWxlICYmIHVzZXIucHJvZmlsZS5maXJzdF9uYW1lKSA/IChlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5WzFdLnRyYWR1Y3Rpb24gKyAnICcgKyB1c2VyLnByb2ZpbGUuZmlyc3RfbmFtZSArIFwiLFwiKSA6IGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnlbMV0udHJhZHVjdGlvbjtcblxuICAgICAgICAgICAgU1NSLmNvbXBpbGVUZW1wbGF0ZSgnaHRtbEVtYWlsJywgQXNzZXRzLmdldFRleHQoJ2h0bWwtZW1haWwuaHRtbCcpKTtcblxuICAgICAgICAgICAgdmFyIGVtYWlsRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBncmVldGluZzogZ3JlZXRpbmcsXG4gICAgICAgICAgICAgICAgcmVtaW5kZXJNc2dWYXI6IGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnlbN10udHJhZHVjdGlvbixcbiAgICAgICAgICAgICAgICBkYXRlVmFyOiBfZm9yd2FyZERhdGUsXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25Nc2dWYXI6IGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnlbOF0udHJhZHVjdGlvbixcbiAgICAgICAgICAgICAgICByZWdhcmRWYXI6IGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnlbNV0udHJhZHVjdGlvbixcbiAgICAgICAgICAgICAgICBmb2xsb3dNc2dWYXI6IGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnlbNl0udHJhZHVjdGlvblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBFbWFpbC5zZW5kKHtcbiAgICAgICAgICAgICAgICB0bzogdXNlci5lbWFpbHNbMF0uYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBmcm9tOiBwYXJhbWV0ZXIudmFsdWUsXG4gICAgICAgICAgICAgICAgc3ViamVjdDogdHJpYWxfZW1haWxfc3ViamVjdCxcbiAgICAgICAgICAgICAgICBodG1sOiBTU1IucmVuZGVyKCdodG1sRW1haWwnLCBlbWFpbERhdGEpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE9uZVNpZ25hbCB9IGZyb20gJ21ldGVvci9hc3Ryb2NvZGVyczpvbmUtc2lnbmFsJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzICh7XG4gICAgICAgIHNlbmRQdXNoOiBmdW5jdGlvbiAoIF91c2VyRGV2aWNlSWQgOiBzdHJpbmdbXSwgY29udGVudCA6IHN0cmluZyApe1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjb250ZW50czoge1xuICAgICAgICAgICAgICAgICAgICBlbjogY29udGVudCwgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBPbmVTaWduYWwuTm90aWZpY2F0aW9ucy5jcmVhdGUoIF91c2VyRGV2aWNlSWQsIGRhdGEgKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgSXRlbXMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9tZW51L2l0ZW0uY29sbGVjdGlvbic7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgTWV0ZW9yLm1ldGhvZHMoe1xuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIHVwZGF0ZSBpdGVtIGF2YWlsYWJsZSBmb3Igc3VwZXJ2aXNvclxuICAgICAqIEBwYXJhbSB7VXNlckRldGFpbH0gX3VzZXJEZXRhaWxcbiAgICAgKiBAcGFyYW0ge0l0ZW19IF9pdGVtXG4gICAgICovXG4gICAgdXBkYXRlSXRlbUF2YWlsYWJsZTogZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZywgX2l0ZW1JZDogc3RyaW5nKSB7XG4gICAgICBsZXQgX2l0ZW1Fc3RhYmxpc2htZW50ID0gSXRlbXMuY29sbGVjdGlvbi5maW5kT25lKHsgX2lkOiBfaXRlbUlkIH0sIHsgZmllbGRzOiB7IF9pZDogMCwgZXN0YWJsaXNobWVudHM6IDEgfSB9KTtcbiAgICAgIGxldCBhdXggPSBfaXRlbUVzdGFibGlzaG1lbnQuZXN0YWJsaXNobWVudHMuZmluZChlbGVtZW50ID0+IGVsZW1lbnQuZXN0YWJsaXNobWVudF9pZCA9PT0gX2VzdGFibGlzaG1lbnRJZCk7XG4gICAgICBJdGVtcy51cGRhdGUoeyBfaWQ6IF9pdGVtSWQsIFwiZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZFwiOiBfZXN0YWJsaXNobWVudElkIH0sIHsgJHNldDogeyAnZXN0YWJsaXNobWVudHMuJC5pc0F2YWlsYWJsZSc6ICFhdXguaXNBdmFpbGFibGUsIG1vZGlmaWNhdGlvbl9kYXRlOiBuZXcgRGF0ZSgpLCBtb2RpZmljYXRpb25fdXNlcjogTWV0ZW9yLnVzZXJJZCgpIH0gfSk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byB1cGRhdGUgaXRlbSByZWNvbW1lbmRlZFxuICAgICAqIEBwYXJhbSB7VXNlckRldGFpbH0gX3VzZXJEZXRhaWxcbiAgICAgKiBAcGFyYW0ge0l0ZW19IF9pdGVtXG4gICAgICovXG4gICAgdXBkYXRlUmVjb21tZW5kZWQ6IGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcsIF9pdGVtSWQ6IHN0cmluZykge1xuICAgICAgbGV0IF9pdGVtRXN0YWJsaXNobWVudCA9IEl0ZW1zLmNvbGxlY3Rpb24uZmluZE9uZSh7IF9pZDogX2l0ZW1JZCB9LCB7IGZpZWxkczogeyBfaWQ6IDAsIGVzdGFibGlzaG1lbnRzOiAxIH0gfSk7XG4gICAgICBsZXQgYXV4ID0gX2l0ZW1Fc3RhYmxpc2htZW50LmVzdGFibGlzaG1lbnRzLmZpbmQoZWxlbWVudCA9PiBlbGVtZW50LmVzdGFibGlzaG1lbnRfaWQgPT09IF9lc3RhYmxpc2htZW50SWQpO1xuICAgICAgSXRlbXMudXBkYXRlKHsgX2lkOiBfaXRlbUlkLCBcImVzdGFibGlzaG1lbnRzLmVzdGFibGlzaG1lbnRfaWRcIjogX2VzdGFibGlzaG1lbnRJZCB9LCB7ICRzZXQ6IHsgJ2VzdGFibGlzaG1lbnRzLiQucmVjb21tZW5kZWQnOiAhYXV4LnJlY29tbWVuZGVkLCBtb2RpZmljYXRpb25fZGF0ZTogbmV3IERhdGUoKSwgbW9kaWZpY2F0aW9uX3VzZXI6IE1ldGVvci51c2VySWQoKSB9IH0pO1xuICAgIH1cbiAgfSlcbn1cblxuXG5cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUmV3YXJkSGlzdG9yeSB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvcmV3YXJkLWhpc3RvcnkubW9kZWwnO1xuaW1wb3J0IHsgUmV3YXJkSGlzdG9yaWVzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcG9pbnRzL3Jld2FyZC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBJdGVtIH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvaXRlbS5tb2RlbCc7XG5pbXBvcnQgeyBJdGVtcyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL21lbnUvaXRlbS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFJld2FyZCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3Jld2FyZC5tb2RlbCc7XG5pbXBvcnQgeyBSZXdhcmRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50TWVkYWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWwubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudE1lZGFscyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUmV3YXJkQ29uZmlybWF0aW9uIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9yZXdhcmQtY29uZmlybWF0aW9uLm1vZGVsJztcbmltcG9ydCB7IFJld2FyZHNDb25maXJtYXRpb25zIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UG9pbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnQubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50cyB9IGZyb20gJy4uLy4uL2NvbGxlY3Rpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LXBvaW50cy5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE5lZ2F0aXZlUG9pbnRzIH0gZnJvbSAnLi4vLi4vY29sbGVjdGlvbnMvcG9pbnRzL25lZ2F0aXZlLXBvaW50cy5jb2xsZWN0aW9uJztcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZnVuY3RvbiBhbGxvdyBnZW5lcmF0ZSByZXdhcmQgaGlzdG9yeVxuICAgICAgICAgKiBAcGFyYW0ge1Jld2FyZENvbmZpcm1hdGlvbn0gX3BSZXdhcmRDb25maXJtYXRpb25cbiAgICAgICAgICovXG4gICAgICAgIGdlbmVyYXRlUmV3YXJkSGlzdG9yeTogZnVuY3Rpb24gKF9wUmV3YXJkQ29uZmlybWF0aW9uOiBSZXdhcmRDb25maXJtYXRpb24pIHtcbiAgICAgICAgICAgIGxldCBfbEVzdGFibGlzaG1lbnQ6IEVzdGFibGlzaG1lbnQgPSBFc3RhYmxpc2htZW50cy5maW5kT25lKHsgX2lkOiBfcFJld2FyZENvbmZpcm1hdGlvbi5lc3RhYmxpc2htZW50X2lkIH0pO1xuICAgICAgICAgICAgbGV0IF9sUmV3YXJkOiBSZXdhcmQgPSBSZXdhcmRzLmZpbmRPbmUoeyBfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLnJld2FyZF9pZCB9KTtcbiAgICAgICAgICAgIGxldCBfbEl0ZW06IEl0ZW0gPSBJdGVtcy5maW5kT25lKHsgX2lkOiBfbFJld2FyZC5pdGVtX2lkIH0pO1xuXG4gICAgICAgICAgICBSZXdhcmRIaXN0b3JpZXMuaW5zZXJ0KHtcbiAgICAgICAgICAgICAgICBjcmVhdGlvbl91c2VyOiBfcFJld2FyZENvbmZpcm1hdGlvbi51c2VyX2lkLFxuICAgICAgICAgICAgICAgIGNyZWF0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgZXN0YWJsaXNobWVudF9pZDogX2xFc3RhYmxpc2htZW50Ll9pZCxcbiAgICAgICAgICAgICAgICBlc3RhYmxpc2htZW50X25hbWU6IF9sRXN0YWJsaXNobWVudC5uYW1lLFxuICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfYWRkcmVzczogX2xFc3RhYmxpc2htZW50LmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgaXRlbV9uYW1lOiBfbEl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICBpdGVtX3F1YW50aXR5OiBfbFJld2FyZC5pdGVtX3F1YW50aXR5LFxuICAgICAgICAgICAgICAgIHJlZGVlbWVkX21lZGFsczogX3BSZXdhcmRDb25maXJtYXRpb24ubWVkYWxzX3RvX3JlZGVlbVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZ1bmN0aW9uIHRvIHJlZGVlbSB1c2VyIG1lZGFsc1xuICAgICAgICAgKiBAcGFyYW0ge1Jld2FyZENvbmZpcm1hdGlvbn0gX3BSZXdhcmRDb25maXJtYXRpb25cbiAgICAgICAgICovXG4gICAgICAgIHJlZGVlbVVzZXJNZWRhbHM6IGZ1bmN0aW9uIChfcFJld2FyZENvbmZpcm1hdGlvbjogUmV3YXJkQ29uZmlybWF0aW9uKSB7XG4gICAgICAgICAgICBsZXQgX2VzdGFibGlzaG1lbnRQb2ludHM6IEVzdGFibGlzaG1lbnRQb2ludCA9IEVzdGFibGlzaG1lbnRQb2ludHMuZmluZE9uZSh7IGVzdGFibGlzaG1lbnRfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLmVzdGFibGlzaG1lbnRfaWQgfSk7XG4gICAgICAgICAgICBsZXQgX3BvaW50c1Jlc3VsdDogbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KF9lc3RhYmxpc2htZW50UG9pbnRzLmN1cnJlbnRfcG9pbnRzLnRvU3RyaW5nKCkpIC0gTnVtYmVyLnBhcnNlSW50KF9wUmV3YXJkQ29uZmlybWF0aW9uLm1lZGFsc190b19yZWRlZW0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBsZXQgX2xFc3RhYmxpc2htZW50TWVkYWw6IEVzdGFibGlzaG1lbnRNZWRhbCA9IEVzdGFibGlzaG1lbnRNZWRhbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLnVzZXJfaWQsIGVzdGFibGlzaG1lbnRfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLmVzdGFibGlzaG1lbnRfaWQgfSk7XG5cbiAgICAgICAgICAgIGlmIChfcG9pbnRzUmVzdWx0ID49IDApIHtcbiAgICAgICAgICAgICAgICBFc3RhYmxpc2htZW50UG9pbnRzLnVwZGF0ZSh7IF9pZDogX2VzdGFibGlzaG1lbnRQb2ludHMuX2lkIH0sIHsgJHNldDogeyBjdXJyZW50X3BvaW50czogX3BvaW50c1Jlc3VsdCB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgX25lZ2F0aXZlUG9pbnRzOiBudW1iZXI7XG4gICAgICAgICAgICAgICAgaWYgKF9lc3RhYmxpc2htZW50UG9pbnRzLmN1cnJlbnRfcG9pbnRzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBfbmVnYXRpdmVQb2ludHMgPSBOdW1iZXIucGFyc2VJbnQoX3BSZXdhcmRDb25maXJtYXRpb24ubWVkYWxzX3RvX3JlZGVlbS50b1N0cmluZygpKSAtIE51bWJlci5wYXJzZUludChfZXN0YWJsaXNobWVudFBvaW50cy5jdXJyZW50X3BvaW50cy50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9uZWdhdGl2ZVBvaW50cyA8IDApIHsgX25lZ2F0aXZlUG9pbnRzID0gKF9uZWdhdGl2ZVBvaW50cyAqICgtMSkpOyB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX25lZ2F0aXZlUG9pbnRzID0gTnVtYmVyLnBhcnNlSW50KF9wUmV3YXJkQ29uZmlybWF0aW9uLm1lZGFsc190b19yZWRlZW0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE5lZ2F0aXZlUG9pbnRzLmluc2VydCh7XG4gICAgICAgICAgICAgICAgICAgIGVzdGFibGlzaG1lbnRfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLmVzdGFibGlzaG1lbnRfaWQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50czogX25lZ2F0aXZlUG9pbnRzLFxuICAgICAgICAgICAgICAgICAgICBwYWlkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIEVzdGFibGlzaG1lbnRQb2ludHMudXBkYXRlKHsgX2lkOiBfZXN0YWJsaXNobWVudFBvaW50cy5faWQgfSwgeyAkc2V0OiB7IGN1cnJlbnRfcG9pbnRzOiBfcG9pbnRzUmVzdWx0LCBuZWdhdGl2ZV9iYWxhbmNlOiB0cnVlIH0gfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBfbE5ld01lZGFsczogbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KF9sRXN0YWJsaXNobWVudE1lZGFsLm1lZGFscy50b1N0cmluZygpKSAtIE51bWJlci5wYXJzZUludChfcFJld2FyZENvbmZpcm1hdGlvbi5tZWRhbHNfdG9fcmVkZWVtLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgRXN0YWJsaXNobWVudE1lZGFscy51cGRhdGUoeyBfaWQ6IF9sRXN0YWJsaXNobWVudE1lZGFsLl9pZCB9LCB7XG4gICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fdXNlcjogX2xFc3RhYmxpc2htZW50TWVkYWwudXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIG1lZGFsczogX2xOZXdNZWRhbHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE1ldGVvci5jYWxsKCdnZW5lcmF0ZVJld2FyZEhpc3RvcnknLCBfcFJld2FyZENvbmZpcm1hdGlvbik7XG4gICAgICAgICAgICBSZXdhcmRzQ29uZmlybWF0aW9ucy51cGRhdGUoeyBfaWQ6IF9wUmV3YXJkQ29uZmlybWF0aW9uLl9pZCB9LCB7XG4gICAgICAgICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25fdXNlcjogX2xFc3RhYmxpc2htZW50TWVkYWwudXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uX2RhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIGlzX2NvbmZpcm1lZDogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgVXNlckRldmljZSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL2RldmljZS5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBVc2VyRGV2aWNlcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxVc2VyRGV2aWNlPigndXNlcl9kZXZpY2VzJyk7XG5cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuVXNlckRldmljZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluLFxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWVudSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL21lbnUubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgTWVudXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248TWVudT4oJ21lbnVzJyk7XG4iLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvcm9sZS5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBSb2xlcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxSb2xlPigncm9sZXMnKTtcbiIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBVc2VyRGV0YWlscyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxVc2VyRGV0YWlsPigndXNlcl9kZXRhaWxzJyk7XG5cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuVXNlckRldGFpbHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluLFxufSk7XG4iLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGXCoH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9ywqB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlckxvZ2luIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2F1dGgvdXNlci1sb2dpbi5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFVzZXIgTG9naW4gQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgVXNlcnNMb2dpbiA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxVc2VyTG9naW4+KCd1c2Vyc19sb2dpbicpO1xuXG5Vc2Vyc0xvZ2luLmFsbG93KHtcbiAgICBpbnNlcnQ6bG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VyUGVuYWx0eSB9IGZyb20gJy4uLy4uL21vZGVscy9hdXRoL3VzZXItcGVuYWx0eS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFVzZXIgUGVuYWx0aWVzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFVzZXJQZW5hbHRpZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248VXNlclBlbmFsdHk+KCd1c2VyX3BlbmFsdGllcycpO1xuXG4vKipcbiAqIEFsbG93IFVzZXIgUGVuYWx0aWVzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblVzZXJQZW5hbHRpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7XG4iLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogVXNlcnMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgVXNlcnMgPSBNb25nb09ic2VydmFibGUuZnJvbUV4aXN0aW5nKE1ldGVvci51c2Vycyk7XG5cbi8qKlxuICogQWxsb3cgVXNlcnMgY29sbGVjdGlvbiB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblVzZXJzLmFsbG93KHtcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRRUiB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQtcXIubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudFFScyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBFc3RhYmxpc2htZW50UVJzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEVzdGFibGlzaG1lbnRRUj4oJ2VzdGFibGlzaG1lbnRfcXJzJyk7XG5cbi8qKlxuICogQWxsb3cgRXN0YWJsaXNobWVudFFScyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5Fc3RhYmxpc2htZW50UVJzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQsIEVzdGFibGlzaG1lbnRUdXJuLCBFc3RhYmxpc2htZW50UHJvZmlsZSwgRXN0YWJsaXNobWVudFByb2ZpbGVJbWFnZSB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50cyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBFc3RhYmxpc2htZW50cyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxFc3RhYmxpc2htZW50PignZXN0YWJsaXNobWVudHMnKTtcblxuLyoqXG4gKiBBbGxvdyBFc3RhYmxpc2htZW50IGNvbGxlY2lvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuRXN0YWJsaXNobWVudHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7XG5cbi8qKlxuICogRXN0YWJsaXNobWVudCBUdXJucyBDb2xsZWN0aW9uXG4gKi9cblxuZXhwb3J0IGNvbnN0IEVzdGFibGlzaG1lbnRUdXJucyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxFc3RhYmxpc2htZW50VHVybj4oJ2VzdGFibGlzaG1lbnRfdHVybnMnKTtcblxuLyoqXG4gKiBBbGxvdyBFc3RhYmxpc2htZW50IFR1cm5zIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cbkVzdGFibGlzaG1lbnRUdXJucy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pO1xuXG4vKipcbiAqIEVzdGFibGlzaG1lbnQgUHJvZmlsZSBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBFc3RhYmxpc2htZW50c1Byb2ZpbGUgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248RXN0YWJsaXNobWVudFByb2ZpbGU+KCdlc3RhYmxpc2htZW50X3Byb2ZpbGUnKTtcblxuLyoqXG4gKiBBbGxvdyBFc3RhYmxpc2htZW50IFByb2ZpbGUgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuRXN0YWJsaXNobWVudHNQcm9maWxlLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pO1xuIiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBPcmRlckhpc3RvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9vcmRlci1oaXN0b3J5Lm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogT3JkZXJIaXN0b3JpZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgT3JkZXJIaXN0b3JpZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248T3JkZXJIaXN0b3J5Pignb3JkZXJfaGlzdG9yaWVzJyk7XG5cbi8qKlxuICogQWxsb3cgT3JkZXJIaXN0b3JpZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuT3JkZXJIaXN0b3JpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgT3JkZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC9vcmRlci5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIE9yZGVycyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBPcmRlcnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248T3JkZXI+KCdvcmRlcnMnKTtcblxuLyoqXG4gKiBBbGxvdyBPcmRlcnMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuT3JkZXJzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTpsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBSZXdhcmRQb2ludCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFJld2FyZFBvaW50cyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBSZXdhcmRQb2ludHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UmV3YXJkUG9pbnQ+KCdyZXdhcmRfcG9pbnRzJyk7XG5cbi8qKlxuICogQWxsb3cgUmV3YXJkUG9pbnRzIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblJld2FyZFBvaW50cy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6bG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUmV3YXJkIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VzdGFibGlzaG1lbnQvcmV3YXJkLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFJld2FyZCBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBSZXdhcmRzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFJld2FyZD4oJ3Jld2FyZHMnKTtcblxuLyoqXG4gKiBBbGxvdyBSZXdhcmQgY29sbGVjdGlvbiBpbnNlcnQsIHVwZGF0ZSBhbmQgcmVtb3ZlIGZ1bmN0aW9uc1xuICovXG5SZXdhcmRzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgVGFibGUgfSBmcm9tICcuLi8uLi9tb2RlbHMvZXN0YWJsaXNobWVudC90YWJsZS5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogVGFibGVzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFRhYmxlcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxUYWJsZT4oJ3RhYmxlcycpO1xuXG4vKipcbiAqIEFsbG93IFRhYmxlcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5UYWJsZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgV2FpdGVyQ2FsbERldGFpbCB9IGZyb20gJy4uLy4uL21vZGVscy9lc3RhYmxpc2htZW50L3dhaXRlci1jYWxsLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogV2FpdGVyQ2FsbERldGFpbHMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgV2FpdGVyQ2FsbERldGFpbHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248V2FpdGVyQ2FsbERldGFpbD4oJ3dhaXRlcl9jYWxsX2RldGFpbHMnKTtcblxuLyoqXG4gKiBBbGxvdyBXYWl0ZXJDYWxsRGV0YWlscyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5XYWl0ZXJDYWxsRGV0YWlscy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3ItcnhqcydcbmltcG9ydCB7IENvdW50cnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9jb3VudHJ5Lm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBDb3VudHJpZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgQ291bnRyaWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPENvdW50cnk+KCdjb3VudHJpZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBDb3VudHJpZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuQ291bnRyaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEN1cnJlbmN5IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvY3VycmVuY3kubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmV4cG9ydCBjb25zdCBDdXJyZW5jaWVzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEN1cnJlbmN5PignY3VycmVuY2llcycpO1xuXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbkN1cnJlbmNpZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgRW1haWxDb250ZW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvZW1haWwtY29udGVudC5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuZXhwb3J0IGNvbnN0IEVtYWlsQ29udGVudHMgPSAgbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEVtYWlsQ29udGVudD4oJ2VtYWlsX2NvbnRlbnRzJyk7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEFsbG93IEVtYWlsQ29udGVudHMgY29sbGVjaW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5FbWFpbENvbnRlbnRzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IEhvdXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9ob3VyLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5leHBvcnQgY29uc3QgSG91cnMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248SG91cj4oJ2hvdXJzJyk7XG5cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuSG91cnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTGFuZ3VhZ2UgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9sYW5ndWFnZS5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogTGFuZ3VhZ2VzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IExhbmd1YWdlcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxMYW5ndWFnZT4oJ2xhbmd1YWdlcycpO1xuXG4vKipcbiAqIEFsbG93IExhbmd1YWdlcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5MYW5ndWFnZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgUGFyYW1ldGVyIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvcGFyYW1ldGVyLm1vZGVsJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5leHBvcnQgY29uc3QgUGFyYW1ldGVycyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxQYXJhbWV0ZXI+KCdwYXJhbWV0ZXJzJyk7XG5cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuUGFyYW1ldGVycy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBQYXltZW50TWV0aG9kIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuZXhwb3J0IGNvbnN0IFBheW1lbnRNZXRob2RzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFBheW1lbnRNZXRob2Q+KCdwYXltZW50TWV0aG9kcycpO1xuXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cblBheW1lbnRNZXRob2RzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dlbmVyYWwvcG9pbnQubW9kZWwnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFBvaW50cyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBQb2ludHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UG9pbnQ+KCdwb2ludHMnKTtcblxuLyoqXG4gKiBBbGxvdyBwb2ludHMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuUG9pbnRzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJ1xuaW1wb3J0IHsgUXVldWUgfSBmcm9tICcuLi8uLi9tb2RlbHMvZ2VuZXJhbC9xdWV1ZS5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogUXVldWVzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFF1ZXVlcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxRdWV1ZT4oJ3F1ZXVlcycpO1xuXG4vKipcbiAqIEFsbG93IFF1ZXVlcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5RdWV1ZXMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgVHlwZU9mRm9vZCB9IGZyb20gJy4uLy4uL21vZGVscy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5tb2RlbCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFR5cGVzT2ZGb29kIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFR5cGVzT2ZGb29kID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFR5cGVPZkZvb2Q+KCd0eXBlc19vZl9mb29kJyk7XG5cbi8qKlxuICogQWxsb3cgVHlwZXNPZkZvb2QgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuVHlwZXNPZkZvb2QuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvbWVudS9jYXRlZ29yeS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIENhdGVnb3JpZXMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgQ2F0ZWdvcmllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxDYXRlZ29yeT4oJ2NhdGVnb3JpZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBDYXRlZ29yeSBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5DYXRlZ29yaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgSXRlbSwgSXRlbUltYWdlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL21lbnUvaXRlbS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBJdGVtcyBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBJdGVtcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxJdGVtPignaXRlbXMnKTtcblxuLyoqXG4gKiBBbGxvdyBJdGVtcyBjb2xsZWN0aW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5JdGVtcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IFNlY3Rpb24gfSBmcm9tICcuLi8uLi9tb2RlbHMvbWVudS9zZWN0aW9uLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogU2VjdGlvbiBDb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBTZWN0aW9ucyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxTZWN0aW9uPignc2VjdGlvbnMnKTtcblxuLyoqXG4gKiBBbGxvdyBTZWN0aW9uIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblNlY3Rpb25zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgU3ViY2F0ZWdvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvbWVudS9zdWJjYXRlZ29yeS5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFN1YmNhdGVnb3J5IENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFN1YmNhdGVnb3JpZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248U3ViY2F0ZWdvcnk+KCdzdWJjYXRlZ29yaWVzJyk7XG5cbi8qKlxuICogQWxsb3cgU3ViY2F0ZWdvcnkgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuU3ViY2F0ZWdvcmllcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ2NQYXltZW50TWV0aG9kIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BheW1lbnQvY2MtcGF5bWVudC1tZXRob2QubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgQ2NQYXltZW50TWV0aG9kcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxDY1BheW1lbnRNZXRob2Q+KCdjY19wYXltZW50X21ldGhvZHMnKTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpe1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogQWxsb3cgSGlzdG9yeVBheW1lbnRDb2xsZWN0aW9uIGNvbGxlY2lvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuQ2NQYXltZW50TWV0aG9kcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEN5Z0ludm9pY2UgfSBmcm9tICcuLi8uLi9tb2RlbHMvcGF5bWVudC9jeWctaW52b2ljZS5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBDeWdJbnZvaWNlcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxDeWdJbnZvaWNlPignY3lnX2ludm9pY2VzJyk7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBBbGxvdyBIaXN0b3J5UGF5bWVudENvbGxlY3Rpb24gY29sbGVjaW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5DeWdJbnZvaWNlcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTtcbiIsImltcG9ydCB7IE1vbmdvT2JzZXJ2YWJsZSB9IGZyb20gJ21ldGVvci1yeGpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgSW52b2ljZUluZm8gfSBmcm9tICcuLi8uLi9tb2RlbHMvcGF5bWVudC9pbnZvaWNlLWluZm8ubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgSW52b2ljZXNJbmZvID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEludm9pY2VJbmZvPignaW52b2ljZXNfaW5mbycpO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBBbGxvdyBIaXN0b3J5UGF5bWVudENvbGxlY3Rpb24gY29sbGVjaW9uIGluc2VydCBhbmQgdXBkYXRlIGZ1bmN0aW9uc1xuICovXG5JbnZvaWNlc0luZm8uYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQYXltZW50SGlzdG9yeSB9IGZyb20gJy4uLy4uL21vZGVscy9wYXltZW50L3BheW1lbnQtaGlzdG9yeS5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBQYXltZW50c0hpc3RvcnkgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248UGF5bWVudEhpc3Rvcnk+KCdwYXltZW50c19oaXN0b3J5Jyk7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEFsbG93IEhpc3RvcnlQYXltZW50Q29sbGVjdGlvbiBjb2xsZWNpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblBheW1lbnRzSGlzdG9yeS5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBheW1lbnRUcmFuc2FjdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscy9wYXltZW50L3BheW1lbnQtdHJhbnNhY3Rpb24ubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgUGF5bWVudFRyYW5zYWN0aW9ucyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxQYXltZW50VHJhbnNhY3Rpb24+KCdwYXltZW50X3RyYW5zYWN0aW9uJyk7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEFsbG93IEhpc3RvcnlQYXltZW50Q29sbGVjdGlvbiBjb2xsZWNpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblBheW1lbnRUcmFuc2FjdGlvbnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgQmFnUGxhbkhpc3RvcnkgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2JhZy1wbGFuLWhpc3RvcnkubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBCYWdQbGFuSGlzdG9yaWVzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEJhZ1BsYW5IaXN0b3JpZXMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248QmFnUGxhbkhpc3Rvcnk+KCdiYWdfcGxhbl9oaXN0b3JpZXMnKTtcblxuQmFnUGxhbkhpc3Rvcmllcy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW4sXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBCYWdQbGFuIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9iYWctcGxhbi5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEJhZ1BsYW5zIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEJhZ1BsYW5zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPEJhZ1BsYW4+KCdiYWdfcGxhbnMnKTtcblxuQmFnUGxhbnMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluLFxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudE1lZGFsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRNZWRhbHMgQ29sbGVjdGlvblxuICovXG5leHBvcnQgY29uc3QgRXN0YWJsaXNobWVudE1lZGFscyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxFc3RhYmxpc2htZW50TWVkYWw+KCdlc3RhYmxpc2htZW50X21lZGFscycpO1xuXG4vKipcbiAqIEFsbG93IEVzdGFibGlzaG1lbnRNZWRhbHMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuRXN0YWJsaXNobWVudE1lZGFscy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UG9pbnQgfSBmcm9tICcuLi8uLi9tb2RlbHMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnQubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCl7XG4gICAgcmV0dXJuICEhTWV0ZW9yLnVzZXIoKTtcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50UG9pbnRzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEVzdGFibGlzaG1lbnRQb2ludHMgPSBuZXcgTW9uZ29PYnNlcnZhYmxlLkNvbGxlY3Rpb248RXN0YWJsaXNobWVudFBvaW50PignZXN0YWJsaXNobWVudF9wb2ludHMnKTtcblxuLyoqXG4gKiBBbGxvdyBFc3RhYmxpc2htZW50UG9pbnRzIGNvbGxlY3Rpb24gaW5zZXJ0LCB1cGRhdGUgYW5kIHJlbW92ZSBmdW5jdGlvbnNcbiAqL1xuRXN0YWJsaXNobWVudFBvaW50cy5hbGxvdyh7XG4gICAgaW5zZXJ0OiBsb2dnZWRJbixcbiAgICB1cGRhdGU6IGxvZ2dlZEluLFxuICAgIHJlbW92ZTogbG9nZ2VkSW4sXG59KTsiLCJpbXBvcnQgeyBNb25nb09ic2VydmFibGUgfSBmcm9tICdtZXRlb3Itcnhqcyc7XG5pbXBvcnQgeyBOZWdhdGl2ZVBvaW50IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9uZWdhdGl2ZS1wb2ludC5tb2RlbCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmFsaWRhdGUgaWYgdXNlciBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbG9nZ2VkSW4oKXtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIE5lZ2F0aXZlUG9pbnRzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IE5lZ2F0aXZlUG9pbnRzID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPE5lZ2F0aXZlUG9pbnQ+KCduZWdhdGl2ZV9wb2ludHMnKTtcblxuTmVnYXRpdmVQb2ludHMuYWxsb3coe1xuICAgIGluc2VydDogbG9nZ2VkSW4sXG4gICAgdXBkYXRlOiBsb2dnZWRJbixcbiAgICByZW1vdmU6IGxvZ2dlZEluLFxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgUmV3YXJkQ29uZmlybWF0aW9uIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3BvaW50cy9yZXdhcmQtY29uZmlybWF0aW9uLm1vZGVsJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2YWxpZGF0ZSBpZiB1c2VyIGV4aXN0c1xuICovXG5mdW5jdGlvbiBsb2dnZWRJbigpIHtcbiAgICByZXR1cm4gISFNZXRlb3IudXNlcigpO1xufVxuXG4vKipcbiAqIFJld2FyZHNDb25maXJtYXRpb25zIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFJld2FyZHNDb25maXJtYXRpb25zID0gbmV3IE1vbmdvT2JzZXJ2YWJsZS5Db2xsZWN0aW9uPFJld2FyZENvbmZpcm1hdGlvbj4oJ3Jld2FyZHNfY29uZmlybWF0aW9ucycpO1xuXG4vKipcbiAqIEFsbG93IFJld2FyZHNDb25maXJtYXRpb25zIGNvbGxlY3Rpb24gaW5zZXJ0IGFuZCB1cGRhdGUgZnVuY3Rpb25zXG4gKi9cblJld2FyZHNDb25maXJtYXRpb25zLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW4sXG4gICAgcmVtb3ZlOiBsb2dnZWRJblxufSk7IiwiaW1wb3J0IHsgTW9uZ29PYnNlcnZhYmxlIH0gZnJvbSAnbWV0ZW9yLXJ4anMnO1xuaW1wb3J0IHsgUmV3YXJkSGlzdG9yeSB9IGZyb20gJy4uLy4uL21vZGVscy9wb2ludHMvcmV3YXJkLWhpc3RvcnkubW9kZWwnO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZhbGlkYXRlIGlmIHVzZXIgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGxvZ2dlZEluKCkge1xuICAgIHJldHVybiAhIU1ldGVvci51c2VyKCk7XG59XG5cbi8qKlxuICogUmV3YXJkSGlzdG9yaWVzIENvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFJld2FyZEhpc3RvcmllcyA9IG5ldyBNb25nb09ic2VydmFibGUuQ29sbGVjdGlvbjxSZXdhcmRIaXN0b3J5PigncmV3YXJkc19oaXN0b3JpZXMnKTtcblxuLyoqXG4gKiBBbGxvdyBSZXdhcmRIaXN0b3JpZXMgY29sbGVjdGlvbiBpbnNlcnQgYW5kIHVwZGF0ZSBmdW5jdGlvbnNcbiAqL1xuUmV3YXJkSGlzdG9yaWVzLmFsbG93KHtcbiAgICBpbnNlcnQ6IGxvZ2dlZEluLFxuICAgIHVwZGF0ZTogbG9nZ2VkSW5cbn0pOyIsImltcG9ydCB7IENvbGxlY3Rpb25PYmplY3QgfSBmcm9tICcuLi9jb2xsZWN0aW9uLW9iamVjdC5tb2RlbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXNlckRldmljZSBleHRlbmRzIENvbGxlY3Rpb25PYmplY3Qge1xuICAgIHVzZXJfaWQ6IHN0cmluZztcbiAgICBkZXZpY2VzIDogRGV2aWNlW107XG59XG5cbmV4cG9ydCBjbGFzcyBEZXZpY2Uge1xuICAgIHBsYXllcl9pZDogc3RyaW5nO1xuICAgIGlzX2FjdGl2ZSA6IGJvb2xlYW47XG59XG5cbiIsImltcG9ydCB7IENvbGxlY3Rpb25PYmplY3QgfSBmcm9tICcuLi9jb2xsZWN0aW9uLW9iamVjdC5tb2RlbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXNlckRldGFpbCBleHRlbmRzIENvbGxlY3Rpb25PYmplY3Qge1xuICAgIHVzZXJfaWQ6IHN0cmluZztcbiAgICByb2xlX2lkOiBzdHJpbmc7XG4gICAgaXNfYWN0aXZlOiBib29sZWFuO1xuXG4gICAgLy9maWVsZHMgZm9yIGFkbWluIHJlZ2lzdGVyXG4gICAgY29udGFjdF9waG9uZT86IHN0cmluZztcbiAgICBkbmlfbnVtYmVyPzogc3RyaW5nO1xuICAgIGFkZHJlc3M/OiBzdHJpbmc7XG4gICAgY291bnRyeV9pZD86IHN0cmluZztcbiAgICBjaXR5X2lkPzogc3RyaW5nO1xuICAgIG90aGVyX2NpdHk/OiBzdHJpbmc7XG4gICAgc2hvd19hZnRlcl9yZXN0X2NyZWF0aW9uPzogYm9vbGVhbjtcbiAgICAvL1xuXG4gICAgZXN0YWJsaXNobWVudF93b3JrPzogc3RyaW5nO1xuICAgIHBlbmFsdGllcz86IFVzZXJEZXRhaWxQZW5hbHR5W107XG4gICAgZ3JhbnRfc3RhcnRfcG9pbnRzPzogYm9vbGVhbjtcbiAgICBiaXJ0aGRhdGU/OiBEYXRlO1xuICAgIHBob25lPzogc3RyaW5nO1xuICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgIGltYWdlPzogVXNlckRldGFpbEltYWdlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFVzZXJEZXRhaWxQZW5hbHR5IHtcbiAgICBkYXRlOiBEYXRlO1xufVxuXG4vKipcbiAqIFVzZXIgRGV0YWlsIEltYWdlIE1vZGVsXG4gKi9cbmV4cG9ydCBjbGFzcyBVc2VyRGV0YWlsSW1hZ2Uge1xuICAgIF9pZD86IHN0cmluZztcbiAgICBmaWxlbmFtZTogc3RyaW5nO1xuICAgIGhhbmRsZTogc3RyaW5nO1xuICAgIG1pbWV0eXBlOiBzdHJpbmc7XG4gICAgb3JpZ2luYWxQYXRoOiBzdHJpbmc7XG4gICAgc2l6ZTogc3RyaW5nO1xuICAgIHNvdXJjZTogc3RyaW5nO1xuICAgIHVybDogc3RyaW5nO1xuICAgIG9yaWdpbmFsRmlsZT86IE9iamVjdDtcbiAgICBzdGF0dXM/OiBzdHJpbmc7XG4gICAga2V5Pzogc3RyaW5nO1xuICAgIGNvbnRhaW5lcj86IHN0cmluZztcbiAgICB1cGxvYWRJZDogc3RyaW5nO1xufSIsIi8qKlxuICogVXNlciBMb2dpbiBNb2RlbFxuICovXG5leHBvcnQgY2xhc3MgVXNlckxvZ2luIHtcbiAgICB1c2VyX2lkOiBzdHJpbmc7XG4gICAgbG9naW5fZGF0ZTogRGF0ZTtcbiAgICBhcHBfY29kZV9uYW1lOiBzdHJpbmc7XG4gICAgYXBwX25hbWU6IHN0cmluZztcbiAgICBhcHBfdmVyc2lvbjogc3RyaW5nO1xuICAgIGNvb2tpZV9lbmFibGVkOiBib29sZWFuO1xuICAgIGxhbmd1YWdlOiBzdHJpbmc7XG4gICAgcGxhdGZvcm06IHN0cmluZztcbiAgICBjb3Jkb3ZhX3ZlcnNpb24/OiBzdHJpbmc7XG4gICAgbW9kZWw/OiBzdHJpbmc7XG4gICAgcGxhdGZvcm1fZGV2aWNlPzogc3RyaW5nO1xuICAgIHZlcnNpb24/OiBzdHJpbmc7XG59IiwiaW1wb3J0IHsgQ29sbGVjdGlvbk9iamVjdCB9IGZyb20gJy4uL2NvbGxlY3Rpb24tb2JqZWN0Lm1vZGVsJztcblxuLyoqXG4gKiBVc2VyIFByb2ZpbGUgTW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIFVzZXJQcm9maWxlIHtcbiAgICBmaXJzdF9uYW1lPzogc3RyaW5nO1xuICAgIGxhc3RfbmFtZT86IHN0cmluZztcbiAgICBsYW5ndWFnZV9jb2RlPzogc3RyaW5nO1xuICAgIGdlbmRlcj86IHN0cmluZztcbiAgICBmdWxsX25hbWU6IHN0cmluZztcbn0iLCJpbXBvcnQgeyBDb2xsZWN0aW9uT2JqZWN0IH0gZnJvbSAnLi4vY29sbGVjdGlvbi1vYmplY3QubW9kZWwnO1xuXG4vKipcbiAqIEVzdGFibGlzaG1lbnQgbW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50IGV4dGVuZHMgQ29sbGVjdGlvbk9iamVjdCB7XG4gICAgY291bnRyeUlkOiBzdHJpbmc7XG4gICAgY2l0eTogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBjdXJyZW5jeUlkOiBzdHJpbmc7XG4gICAgYWRkcmVzczogc3RyaW5nO1xuICAgIGluZGljYXRpdmU6IHN0cmluZztcbiAgICBwaG9uZTogc3RyaW5nO1xuICAgIGVzdGFibGlzaG1lbnRfY29kZTogc3RyaW5nO1xuICAgIHBheW1lbnRNZXRob2RzOiBzdHJpbmdbXTtcbiAgICB0YWJsZXNfcXVhbnRpdHk6IG51bWJlcjtcbiAgICBpbWFnZT86IEVzdGFibGlzaG1lbnRJbWFnZTtcbiAgICBpc0FjdGl2ZTogYm9vbGVhbjtcbiAgICBmaXJzdFBheTogYm9vbGVhbjtcbiAgICBmcmVlRGF5cz86IGJvb2xlYW47XG4gICAgaXNfcHJlbWl1bT86IGJvb2xlYW47XG4gICAgaXNfYmV0YV90ZXN0ZXI6IGJvb2xlYW47XG4gICAgYmFnX3BsYW5zX2lkOiBzdHJpbmc7XG4gICAgaXNfZnJlZW1pdW06IGJvb2xlYW47XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudEltYWdlIG1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudEltYWdlIHtcbiAgICBfaWQ/OiBzdHJpbmc7XG4gICAgZmlsZW5hbWU6IHN0cmluZztcbiAgICBoYW5kbGU6IHN0cmluZztcbiAgICBtaW1ldHlwZTogc3RyaW5nO1xuICAgIG9yaWdpbmFsUGF0aDogc3RyaW5nO1xuICAgIHNpemU6IHN0cmluZztcbiAgICBzb3VyY2U6IHN0cmluZztcbiAgICB1cmw6IHN0cmluZztcbiAgICBvcmlnaW5hbEZpbGU/OiBPYmplY3Q7XG4gICAgc3RhdHVzPzogc3RyaW5nO1xuICAgIGtleT86IHN0cmluZztcbiAgICBjb250YWluZXI/OiBzdHJpbmc7XG4gICAgdXBsb2FkSWQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBFc3RhYmxpc2htZW50TG9jYXRpb24gbW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50TG9jYXRpb24ge1xuICAgIGxhdDogbnVtYmVyO1xuICAgIGxuZzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRTY2hlZHVsZSBtb2RlbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVzdGFibGlzaG1lbnRTY2hlZHVsZSB7XG4gICAgbW9uZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfSxcbiAgICB0dWVzZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfSxcbiAgICB3ZWRuZXNkYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIHRodXJzZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfSxcbiAgICBmcmlkYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIHNhdHVyZGF5Pzoge1xuICAgICAgICBpc0FjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgb3BlbmluZ190aW1lOiBzdHJpbmcsXG4gICAgICAgIGNsb3NpbmdfdGltZTogc3RyaW5nXG4gICAgfSxcbiAgICBzdW5kYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIGhvbGlkYXk/OiB7XG4gICAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgICBvcGVuaW5nX3RpbWU6IHN0cmluZyxcbiAgICAgICAgY2xvc2luZ190aW1lOiBzdHJpbmdcbiAgICB9XG59O1xuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRUdXJuIG1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudFR1cm4gZXh0ZW5kcyBDb2xsZWN0aW9uT2JqZWN0IHtcbiAgICBlc3RhYmxpc2htZW50X2lkOiBzdHJpbmcsXG4gICAgdHVybjogbnVtYmVyLFxuICAgIGxhc3Rfd2FpdGVyX2lkOiBzdHJpbmcsXG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudFNvY2lhbE5ldHdvcmsgTW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50U29jaWFsTmV0d29yayB7XG4gICAgZmFjZWJvb2s/OiBzdHJpbmc7XG4gICAgdHdpdHRlcj86IHN0cmluZztcbiAgICBpbnN0YWdyYW0/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogRXN0YWJsaXNobWVudCBQcm9maWxlIE1vZGVsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXN0YWJsaXNobWVudFByb2ZpbGUgZXh0ZW5kcyBDb2xsZWN0aW9uT2JqZWN0IHtcbiAgICBfaWQ/OiBzdHJpbmc7XG4gICAgZXN0YWJsaXNobWVudF9pZDogc3RyaW5nO1xuICAgIGVzdGFibGlzaG1lbnRfZGVzY3JpcHRpb246IHN0cmluZztcbiAgICB3ZWJfcGFnZT86IHN0cmluZztcbiAgICBlbWFpbD86IHN0cmluZztcbiAgICBzb2NpYWxfbmV0d29ya3M/OiBFc3RhYmxpc2htZW50U29jaWFsTmV0d29yaztcbiAgICBpbWFnZXM/OkVzdGFibGlzaG1lbnRQcm9maWxlSW1hZ2VbXTtcbiAgICBzY2hlZHVsZTogRXN0YWJsaXNobWVudFNjaGVkdWxlO1xuICAgIGxvY2F0aW9uOiBFc3RhYmxpc2htZW50TG9jYXRpb247XG4gICAgdHlwZXNfb2ZfZm9vZD86IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEVzdGFibGlzaG1lbnRQcm9maWxlSW1hZ2UgbW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc3RhYmxpc2htZW50UHJvZmlsZUltYWdlIHtcbiAgICBfaWQ/OiBzdHJpbmc7XG4gICAgZmlsZW5hbWU6IHN0cmluZztcbiAgICBoYW5kbGU6IHN0cmluZztcbiAgICBtaW1ldHlwZTogc3RyaW5nO1xuICAgIG9yaWdpbmFsUGF0aDogc3RyaW5nO1xuICAgIHNpemU6IHN0cmluZztcbiAgICBzb3VyY2U6IHN0cmluZztcbiAgICB1cmw6IHN0cmluZztcbiAgICBvcmlnaW5hbEZpbGU/OiBPYmplY3Q7XG4gICAgc3RhdHVzPzogc3RyaW5nO1xuICAgIGtleT86IHN0cmluZztcbiAgICBjb250YWluZXI/OiBzdHJpbmc7XG4gICAgdXBsb2FkSWQ6IHN0cmluZztcbn0iLCJleHBvcnQgY2xhc3MgTm9kZSB7XG4gICAgcHJpdmF0ZSBmcmVjdWVuY3k6bnVtYmVyO1xuICAgIHByaXZhdGUgY2hhcnM6bnVtYmVyO1xuICAgIHByaXZhdGUgbm9kZUxlZnQ6Tm9kZTtcbiAgICBwcml2YXRlIG5vZGVSaWdodDpOb2RlO1xuXG4gICAgY3JlYXRlTm9kZSggX3BDaGFyczpudW1iZXIgKTp2b2lke1xuICAgICAgICB0aGlzLmZyZWN1ZW5jeSA9IDE7XG4gICAgICAgIHRoaXMuY2hhcnMgPSBfcENoYXJzO1xuICAgIH1cblxuICAgIGNyZWF0ZU5vZGVFeHRlbmQoIF9wRnJlY3VlbmN5Om51bWJlciwgX3BDaGFyczpudW1iZXIsIF9wTGVmdDpOb2RlLCBfcFJpZ2h0Ok5vZGUgKXtcbiAgICAgICAgdGhpcy5mcmVjdWVuY3kgPSBfcEZyZWN1ZW5jeTtcbiAgICAgICAgdGhpcy5jaGFycyA9IF9wQ2hhcnM7XG4gICAgICAgIHRoaXMubm9kZUxlZnQgPSBfcExlZnQ7XG4gICAgICAgIHRoaXMubm9kZVJpZ2h0ID0gX3BSaWdodDtcbiAgICB9XG5cbiAgICBnZXRDaGFyKCk6bnVtYmVye1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFycztcbiAgICB9XG5cbiAgICBzZXRDaGFyKCBfcENoYXI6bnVtYmVyICk6dm9pZHtcbiAgICAgICAgdGhpcy5jaGFycyA9IF9wQ2hhcjtcbiAgICB9XG5cbiAgICBnZXRGcmVjdWVuY3koKTpudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmZyZWN1ZW5jeTtcbiAgICB9XG5cbiAgICBzZXRGcmVjdWVuY3koIF9wRnJlY3VlbmN5Om51bWJlciApOnZvaWR7XG4gICAgICAgIHRoaXMuZnJlY3VlbmN5ID0gX3BGcmVjdWVuY3k7XG4gICAgfVxuXG4gICAgZ2V0Tm9kZUxlZnQoKTpOb2Rle1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlTGVmdDtcbiAgICB9XG5cbiAgICBzZXROb2RlTGVmdCggX3BMZWZ0Ok5vZGUgKTp2b2lke1xuICAgICAgICB0aGlzLm5vZGVMZWZ0ID0gX3BMZWZ0O1xuICAgIH1cblxuICAgIGdldE5vZGVSaWdodCgpOk5vZGV7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVSaWdodDtcbiAgICB9XG5cbiAgICBzZXROb2RlUmlnaHQoIF9wTm9kZVJpZ2h0Ok5vZGUgKTp2b2lke1xuICAgICAgICB0aGlzLm5vZGVSaWdodCA9IF9wTm9kZVJpZ2h0O1xuICAgIH0gIFxufSIsIi8qKlxuICogUmVzcG9uc2VRdWVyeSBtb2RlbFxuICovXG5leHBvcnQgY2xhc3MgUmVzcG9uc2VRdWVyeSB7XG4gICAgbGFuZ3VhZ2U6IHN0cmluZztcbiAgICBjb21tYW5kOiBzdHJpbmc7XG4gICAgbWVyY2hhbnQ6IE1lcmNoYW50O1xuICAgIGRldGFpbHM6IERldGFpbHM7XG4gICAgdGVzdDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNZXJjaGFudCBtb2RlbFxuICovXG5leHBvcnQgY2xhc3MgTWVyY2hhbnQge1xuICAgIGFwaUtleTogc3RyaW5nO1xuICAgIGFwaUxvZ2luOiBzdHJpbmc7XG59XG5cbi8qKlxuICogRGV0YWlscyBtb2RlbFxuICovXG5leHBvcnQgY2xhc3MgRGV0YWlscyB7XG4gICAgdHJhbnNhY3Rpb25JZDogc3RyaW5nO1xufSIsImltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xuXG5leHBvcnQgY2xhc3MgQ3VzdG9tVmFsaWRhdG9ycyB7XG5cbiAgcHVibGljIHN0YXRpYyBlbWFpbFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZS5tYXRjaCgvW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcLlthLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSspKkAoPzpbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XFwuKStbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSkrPy8pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWRFbWFpbEFkZHJlc3MnOiB0cnVlIH07XG4gICAgfVxuICB9XG5cbiAgLypcbiAgcHVibGljIHN0YXRpYyBudW1lcmljVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuICAgIGlmIChjb250cm9sLnZhbHVlLm1hdGNoKC9eKDB8WzEtOV1bMC05XSopJC8pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWROdW1lcmljRmllbGQnOiB0cnVlIH07XG4gICAgfVxuICB9XG4gICovXG4gIHB1YmxpYyBzdGF0aWMgbnVtZXJpY1ZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZE51bWVyaWNGaWVsZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGxldHRlclZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZS5tYXRjaCgvXltBLXpdKyQvKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkTGV0dGVyRmllbGQnOiB0cnVlIH07XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBsZXR0ZXJTcGFjZVZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZS5tYXRjaCgvXlthLXpBLVpcXHNdKiQvKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ICdpbnZhbGlkTGV0dGVyU3BhY2VGaWVsZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGRheU9mRGF0ZVZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZSA+PSAxICYmIGNvbnRyb2wudmFsdWUgPD0gMzEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAnaW52YWxpZERheUZpZWxkJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbW9udGhPZkRhdGVWYWxpZGF0b3IoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgaWYgKGNvbnRyb2wudmFsdWUgPj0gMSAmJiBjb250cm9sLnZhbHVlIDw9IDEyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWRNb250aEZpZWxkJzogdHJ1ZSB9O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgeWVhck9mRGF0ZVZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZiAoY29udHJvbC52YWx1ZSA+PSAxOTcwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgJ2ludmFsaWRZZWFyRmllbGQnOiB0cnVlIH07XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub1NwYWNlc1ZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICBpZihjb250cm9sLnZhbHVlICE9PSBudWxsICYmIGNvbnRyb2wudmFsdWUgIT09IHVuZGVmaW5lZCl7XG4gICAgICBpZiAoY29udHJvbC52YWx1ZS5tYXRjaCgvXlxcUyokLykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4geyAnaW52YWxpZE5vU3BhY2VzVmFsaWRhdG9yJzogdHJ1ZSB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qUGFzc3dvcmQgY29uc3RyYWludHNcbiAgICBtaW4gNiBjaGFyYWN0ZXJzXG4gICAgbWF4IDIwIGNoYXJhY3RlcnNcbiAgICBsb3dlciBhbmQgdXBwZXIgbGV0dGVyc1xuICAgIG51bWJlcnNcbiAgICBhbGxvd2VkIGNoYXJhY3RlcnMgIUAjJCVeJipcbiAgKi9cbiAgLypwdWJsaWMgc3RhdGljIHBhc3N3b3JkVmFsaWRhdG9yKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xuXHQgICAgaWYgKGNvbnRyb2wudmFsdWUubWF0Y2goL14oPz0uKlswLTldKVthLXpBLVowLTkhQCMkJV4mKl17NiwyMH0kLykpIHtcblx0ICAgICAgcmV0dXJuIG51bGw7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICByZXR1cm4geydpbnZhbGlkUGFzc3dvcmQnOiB0cnVlIH07XG5cdCAgICB9XG4gIH0qL1xufSAiLCJpbXBvcnQgeyBBY2NvdW50cyB9IGZyb20gJ21ldGVvci9hY2NvdW50cy1iYXNlJztcblxuQWNjb3VudHMub25DcmVhdGVVc2VyKGZ1bmN0aW9uIChvcHRpb25zLCB1c2VyKSB7XG5cbiAgICB1c2VyLnByb2ZpbGUgPSBvcHRpb25zLnByb2ZpbGUgfHwge307XG4gICAgdXNlci5wcm9maWxlLmZ1bGxfbmFtZSA9IG9wdGlvbnMucHJvZmlsZS5mdWxsX25hbWU7XG4gICAgdXNlci5wcm9maWxlLmxhbmd1YWdlX2NvZGUgPSBvcHRpb25zLnByb2ZpbGUubGFuZ3VhZ2VfY29kZTtcbiAgICB1c2VyLnByb2ZpbGUuZ2VuZGVyID0gb3B0aW9ucy5wcm9maWxlLmdlbmRlcjtcblxuICAgIC8vIFJldHVybnMgdGhlIHVzZXIgb2JqZWN0XG4gICAgcmV0dXJuIHVzZXI7XG59KTsiLCJpbXBvcnQgeyBBY2NvdW50cyB9IGZyb20gJ21ldGVvci9hY2NvdW50cy1iYXNlJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUGFyYW1ldGVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9wYXJhbWV0ZXIubW9kZWwnO1xuaW1wb3J0IHsgUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wYXJhbWV0ZXIuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQubW9kZWwnO1xuXG5BY2NvdW50cy51cmxzLnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiAodG9rZW4pIHtcbiAgICByZXR1cm4gTWV0ZW9yLmFic29sdXRlVXJsKCdyZXNldC1wYXNzd29yZC8nICsgdG9rZW4pO1xufTtcblxuZnVuY3Rpb24gZ3JlZXQoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh1c2VyLCB1cmwpIHtcblxuICAgICAgICBsZXQgZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQgPSBFbWFpbENvbnRlbnRzLmNvbGxlY3Rpb24uZmluZE9uZSh7IGxhbmd1YWdlOiB1c2VyLnByb2ZpbGUubGFuZ3VhZ2VfY29kZSB9KTtcbiAgICAgICAgbGV0IGdyZWV0VmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdncmVldFZhcicpO1xuICAgICAgICBsZXQgd2VsY29tZU1zZ1ZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnd2VsY29tZU1zZ1ZhcicpO1xuICAgICAgICBsZXQgYnRuVGV4dFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnYnRuVGV4dFZhcicpO1xuICAgICAgICBsZXQgYmVmb3JlTXNnVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdiZWZvcmVNc2dWYXInKTtcbiAgICAgICAgbGV0IHJlZ2FyZFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAncmVnYXJkVmFyJyk7XG4gICAgICAgIGxldCBmb2xsb3dNc2dWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2ZvbGxvd01zZ1ZhcicpO1xuXG4gICAgICAgIGxldCBmYWNlYm9va1ZhciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2ZhY2Vib29rX2xpbmsnIH0pLnZhbHVlO1xuICAgICAgICBsZXQgdHdpdHRlclZhciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ3R3aXR0ZXJfbGluaycgfSkudmFsdWU7XG4gICAgICAgIGxldCBpbnN0YWdyYW1WYXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpbnN0YWdyYW1fbGluaycgfSkudmFsdWU7XG4gICAgICAgIGxldCBpdXJlc3RWYXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdpdXJlc3RfdXJsJyB9KS52YWx1ZTtcbiAgICAgICAgbGV0IGl1cmVzdEltZ1ZhciA9IFBhcmFtZXRlcnMuY29sbGVjdGlvbi5maW5kT25lKHsgbmFtZTogJ2l1cmVzdF9pbWdfdXJsJyB9KS52YWx1ZTtcblxuICAgICAgICB2YXIgZ3JlZXRpbmcgPSAodXNlci5wcm9maWxlICYmIHVzZXIucHJvZmlsZS5maXJzdF9uYW1lKSA/IChncmVldFZhciArICcgJyArIHVzZXIucHJvZmlsZS5maXJzdF9uYW1lICsgXCIsXCIpIDogZ3JlZXRWYXI7XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgPHRhYmxlIGJvcmRlcj1cIjBcIiB3aWR0aD1cIjEwMCVcIiBjZWxsc3BhY2luZz1cIjBcIiBjZWxscGFkZGluZz1cIjBcIiBiZ2NvbG9yPVwiI2Y1ZjVmNVwiPlxuICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMjBweCAwIDMwcHggMDtcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPVwiYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgYm94LXNoYWRvdzogMCAycHggMnB4IDAgcmdiYSgwLCAwLCAwLCAwLjE0KSwgMCAxcHggNXB4IDAgcmdiYSgwLCAwLCAwLCAwLjEyKSwgMCAzcHggMXB4IC0ycHggcmdiYSgwLCAwLCAwLCAwLjIpO1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI9XCIwXCIgd2lkdGg9XCI2MCVcIiBjZWxsc3BhY2luZz1cIjBcIiBjZWxscGFkZGluZz1cIjBcIiBhbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMTBweCAwIDEwcHggMDtcIiBhbGlnbj1cImNlbnRlclwiIGJnY29sb3I9XCIjM2M0MTQ2XCI+PGltZyBzdHlsZT1cImRpc3BsYXk6IGJsb2NrO1wiIHNyYz0ke2l1cmVzdEltZ1Zhcn1sb2dvX2l1cmVzdF93aGl0ZS5wbmcgYWx0PVwiUmVzZXQgcGFzc3dkXCIgLz48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAxMHB4IDMwcHggMTBweCAzMHB4O1wiIGJnY29sb3I9XCIjZmZmZmZmXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgYm9yZGVyPVwiMFwiIHdpZHRoPVwiMTAwJVwiIGNlbGxzcGFjaW5nPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMTVweCAwIDAgMDsgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOyBmb250LXNpemU6IDI0cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7Z3JlZXRpbmd9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMTVweCAwIDEwcHggMDsgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmO1wiPiR7d2VsY29tZU1zZ1Zhcn08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJwYWRkaW5nOiAyMHB4IDAgMjBweCAwOyBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBhbGlnbj1cImNlbnRlclwiPjxhIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7IGJvcmRlci1zdHlsZTogc29saWQ7IGJvcmRlci13aWR0aDogMnB4OyBjb2xvcjogI0VGNTM1MDsgdGV4dC1hbGlnbjogY2VudGVyOyBwYWRkaW5nOiAxMHB4IDMwcHg7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgZm9udC13ZWlnaHQ6IGJvbGQgXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9XCIke3VybH1cIj4ke2J0blRleHRWYXJ9PC9hPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMCAwIDAgMDsgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmO1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7YmVmb3JlTXNnVmFyfSA8YnIgLz4gJHtyZWdhcmRWYXJ9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPVwicGFkZGluZzogMHB4IDMwcHggMTBweCAzMHB4O1wiIGJnY29sb3I9XCIjZmZmZmZmXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aHIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBib3JkZXI9XCIwXCIgd2lkdGg9XCIxMDAlXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7XCI+JHtmb2xsb3dNc2dWYXJ9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBhbGlnbj1cInJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGJvcmRlcj1cIjBcIiBjZWxsc3BhY2luZz1cIjBcIiBjZWxscGFkZGluZz1cIjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD48YSBocmVmPSR7ZmFjZWJvb2tWYXJ9PiA8aW1nIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7XCIgc3JjPSR7aXVyZXN0SW1nVmFyfWZhY2Vib29rX3JlZC5wbmcgYWx0PVwiRmFjZWJvb2tcIiAvPiA8L2E+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJmb250LXNpemU6IDA7IGxpbmUtaGVpZ2h0OiAwO1wiIHdpZHRoPVwiMjBcIj4mbmJzcDs8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD48YSBocmVmPSR7dHdpdHRlclZhcn0+IDxpbWcgc3R5bGU9XCJkaXNwbGF5OiBibG9jaztcIiBzcmM9JHtpdXJlc3RJbWdWYXJ9dHdpdHRlcl9yZWQucG5nIGFsdD1cIlR3aXR0ZXJcIiAvPiA8L2E+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJmb250LXNpemU6IDA7IGxpbmUtaGVpZ2h0OiAwO1wiIHdpZHRoPVwiMjBcIj4mbmJzcDs8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD48YSBocmVmPSR7aW5zdGFncmFtVmFyfT4gPGltZyBzdHlsZT1cImRpc3BsYXk6IGJsb2NrO1wiIHNyYz0ke2l1cmVzdEltZ1Zhcn1pbnN0YWdyYW1fcmVkLnBuZyBhbHQ9XCJJbnN0YWdyYW1cIiAvPiA8L2E+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgcGFkZGluZzogMTBweCAwIDEwcHggMDtcIj48YSBzdHlsZT1cImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBmbG9hdDogbGVmdDtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPSR7aXVyZXN0VmFyfT5pdXJlc3QuY29tPC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGJvZHk+XG4gICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgIGA7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZ3JlZXRUZXh0KCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodXNlciwgdXJsKSB7XG5cbiAgICAgICAgbGV0IGVtYWlsQ29udGVudDogRW1haWxDb250ZW50ID0gRW1haWxDb250ZW50cy5jb2xsZWN0aW9uLmZpbmRPbmUoeyBsYW5ndWFnZTogdXNlci5wcm9maWxlLmxhbmd1YWdlX2NvZGUgfSk7XG4gICAgICAgIGxldCBncmVldFZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnZ3JlZXRWYXInKTtcbiAgICAgICAgbGV0IHdlbGNvbWVNc2dWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3dlbGNvbWVNc2dWYXInKTtcbiAgICAgICAgbGV0IGJ0blRleHRWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ2J0blRleHRWYXInKTtcbiAgICAgICAgbGV0IGJlZm9yZU1zZ1ZhciA9IE1ldGVvci5jYWxsKCdnZXRFbWFpbENvbnRlbnQnLCBlbWFpbENvbnRlbnQubGFuZ19kaWN0aW9uYXJ5LCAnYmVmb3JlTXNnVmFyJyk7XG4gICAgICAgIGxldCByZWdhcmRWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3JlZ2FyZFZhcicpO1xuICAgICAgICBsZXQgZm9sbG93TXNnVmFyID0gTWV0ZW9yLmNhbGwoJ2dldEVtYWlsQ29udGVudCcsIGVtYWlsQ29udGVudC5sYW5nX2RpY3Rpb25hcnksICdmb2xsb3dNc2dWYXInKTtcblxuICAgICAgICB2YXIgZ3JlZXRpbmcgPSAodXNlci5wcm9maWxlICYmIHVzZXIucHJvZmlsZS5maXJzdF9uYW1lKSA/IChncmVldFZhciArIHVzZXIucHJvZmlsZS5maXJzdF9uYW1lICsgXCIsXCIpIDogZ3JlZXRWYXI7XG5cbiAgICAgICAgcmV0dXJuIGAgICAgJHtncmVldGluZ31cbiAgICAgICAgICAgICAgICAgICAgJHt3ZWxjb21lTXNnVmFyfVxuICAgICAgICAgICAgICAgICAgICAke3VybH1cbiAgICAgICAgICAgICAgICAgICAgJHtiZWZvcmVNc2dWYXJ9XG4gICAgICAgICAgICAgICAgICAgICR7cmVnYXJkVmFyfVxuICAgICAgICAgICAgICAgYDtcbiAgICB9XG59XG5cbkFjY291bnRzLmVtYWlsVGVtcGxhdGVzID0ge1xuICAgIGZyb206ICcnLFxuICAgIHNpdGVOYW1lOiBNZXRlb3IuYWJzb2x1dGVVcmwoKS5yZXBsYWNlKC9eaHR0cHM/OlxcL1xcLy8sICcnKS5yZXBsYWNlKC9cXC8kLywgJycpLFxuICAgIHJlc2V0UGFzc3dvcmQ6IHtcbiAgICAgICAgc3ViamVjdDogZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIGxldCBlbWFpbENvbnRlbnQ6IEVtYWlsQ29udGVudCA9IEVtYWlsQ29udGVudHMuY29sbGVjdGlvbi5maW5kT25lKHsgbGFuZ3VhZ2U6IHVzZXIucHJvZmlsZS5sYW5ndWFnZV9jb2RlIH0pO1xuICAgICAgICAgICAgbGV0IHN1YmplY3RWYXIgPSBNZXRlb3IuY2FsbCgnZ2V0RW1haWxDb250ZW50JywgZW1haWxDb250ZW50LmxhbmdfZGljdGlvbmFyeSwgJ3Jlc2V0UGFzc3dvcmRTdWJqZWN0VmFyJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdWJqZWN0VmFyICsgJyAnICsgQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuc2l0ZU5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIGh0bWw6IGdyZWV0KCksXG4gICAgICAgIHRleHQ6IGdyZWV0VGV4dCgpLFxuICAgIH0sXG4gICAgdmVyaWZ5RW1haWw6IHtcbiAgICAgICAgc3ViamVjdDogZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkhvdyB0byB2ZXJpZnkgZW1haWwgYWRkcmVzcyBvbiBcIiArIEFjY291bnRzLmVtYWlsVGVtcGxhdGVzLnNpdGVOYW1lO1xuICAgICAgICB9LFxuICAgICAgICB0ZXh0OiBncmVldCgpXG4gICAgfSxcbiAgICBlbnJvbGxBY2NvdW50OiB7XG4gICAgICAgIHN1YmplY3Q6IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJBbiBhY2NvdW50IGhhcyBiZWVuIGNyZWF0ZWQgZm9yIHlvdSBvbiBcIiArIEFjY291bnRzLmVtYWlsVGVtcGxhdGVzLnNpdGVOYW1lO1xuICAgICAgICB9LFxuICAgICAgICB0ZXh0OiBncmVldCgpXG4gICAgfVxufTtcblxuXG5BY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5yZXNldFBhc3N3b3JkLmZyb20gPSAoKSA9PiB7XG4gICAgbGV0IGZyb21WYXIgPSBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uZmluZE9uZSh7IG5hbWU6ICdmcm9tX2VtYWlsJyB9KS52YWx1ZTtcbiAgICByZXR1cm4gZnJvbVZhcjtcbn07XG4iLCJpbXBvcnQgeyBNZW51cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9tZW51LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTWVudSB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2F1dGgvbWVudS5tb2RlbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTWVudXMoKSB7XG5cbiAgICBpZiAoTWVudXMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwKSB7XG5cbiAgICAgICAgY29uc3QgbWVudXM6IE1lbnVbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiOTAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuREFTSEJPQVJELkRBU0hCT0FSRFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2Rhc2hib2FyZFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJ0cmVuZGluZyB1cFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA5MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjkxMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkRBU0hCT0FSRC5EQVNIQk9BUkRcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9kYXNoYm9hcmRzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInRyZW5kaW5nIHVwXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDkxMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5SRVdBUkRTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvcmV3YXJkc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJncmFkZVwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTUwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BUFBST1ZFX1JFV0FSRFNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9hcHByb3ZlLXJld2FyZHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiYXNzaWdubWVudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxNTAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTYwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5HSVZFX01FREFMXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvZ2l2ZS1tZWRhbHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiY2FyZF9naWZ0Y2FyZFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxNjAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLk1BTkFHRU1FTlRcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInN1cGVydmlzb3IgYWNjb3VudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOlxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5SRVNUQVVSQU5UU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMTAwMTFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5NWV9SRVNUQVVSQU5UU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2VzdGFibGlzaG1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDExXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDEyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uUFJPRklMRVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2VzdGFibGlzaG1lbnQtcHJvZmlsZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwMTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0vKiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAxM1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLk1PTlRITFlfQ09ORklHXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvZXN0YWJsaXNobWVudC1saXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAxMDAxM1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0vKiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uVEFCTEVTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIxMDAyMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLkFETUlOSVNUUkFUSU9OLlRBQkxFU19TRUFSQ0hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC90YWJsZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDEwMDIxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDIyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQURNSU5JU1RSQVRJT04uVEFCTEVfQ09OVFJPTFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2VzdGFibGlzaG1lbnQtdGFibGUtY29udHJvbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwMjJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSovLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjEwMDNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5DT0xMQUJPUkFUT1JTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvY29sbGFib3JhdG9yc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMTAwM1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMTAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuQVBQUk9WRV9SRVdBUkRTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc3VwZXJ2aXNvci1hcHByb3ZlLXJld2FyZHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiYXNzaWdubWVudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMTAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMjAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuR0lWRV9NRURBTFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3N1cGVydmlzb3ItZ2l2ZS1tZWRhbHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiY2FyZF9naWZ0Y2FyZFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyp7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjEyMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5UQUJMRVNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9zdXBlcnZpc29yLXRhYmxlc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJyZXN0YXVyYW50XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjEzMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5UQUJMRV9DT05UUk9MXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc3VwZXJ2aXNvci1lc3RhYmxpc2htZW50LXRhYmxlLWNvbnRyb2xcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwibGlzdFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMzAwXG4gICAgICAgICAgICB9LCovXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjIwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5QQVlNRU5UUy5CQUdTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJwYXltZW50XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDIwMDAsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46XG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMjAwMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlBBWU1FTlRTLlBVUkNIQVNFX0JBR1NcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9iYWdzLXBheW1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDIwMDFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjIwMDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5QQVlNRU5UUy5QQVlNRU5UX0hJU1RPUllcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9wYXltZW50LWhpc3RvcnlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDIwMDJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5NRU5VX0RFRklOSVRJT05cIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImxpc3RcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMzAwMCxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjpcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIzMDAxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLlNFQ1RJT05TXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc2VjdGlvbnNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IDMwMDFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IFwiMzAwMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLk1FTlVfREVGSU5JVElPTi5DQVRFR09SSUVTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvY2F0ZWdvcmllc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwMlxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogXCIzMDAzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuTUVOVV9ERUZJTklUSU9OLlNVQkNBVEVHT1JJRVNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9zdWJjYXRlZ29yaWVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAzMDAzXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBcIjMwMDZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uSVRFTVNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9pdGVtc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogMzAwNlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyp7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjMxMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uSVRFTVNfRU5BQkxFXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvaXRlbXMtZW5hYmxlLXN1cFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJkb25lIGFsbFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAzMTAwXG4gICAgICAgICAgICB9LCovXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjQwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5PUkRFUlNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9vcmRlcnNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwiZG5zXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDQwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjYwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5XQUlURVJfQ0FMTFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL3dhaXRlci1jYWxsXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInJlY29yZF92b2ljZV9vdmVyXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDYwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjcwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uT1JERVJTX0NIRUZcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9jaGVmLW9yZGVyc1wiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDcwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjgwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5DQUxMU1wiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2NhbGxzXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInBhbl90b29sXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDgwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjkwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5NRU5VX0RFRklOSVRJT04uTUVOVV9ERUZJTklUSU9OXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvbWVudS1saXN0XCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcInJlc3RhdXJhbnRfbWVudVwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiA5MDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIyMDAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlNFVFRJTkdTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvc2V0dGluZ3NcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwic2V0dGluZ3NcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogMjAwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiBcIjExMDAwXCIsXG4gICAgICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTUVOVVMuVEFCTEVTXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcHAvdGFibGUtY2hhbmdlXCIsXG4gICAgICAgICAgICAgICAgaWNvbl9uYW1lOiBcImNvbXBhcmVfYXJyb3dzXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDExMDAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9pZDogXCIxMjAwMFwiLFxuICAgICAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1FTlVTLlJFU1RBVVJBTlRfRVhJVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBwL2VzdGFibGlzaG1lbnQtZXhpdFwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJleGl0X3RvX2FwcFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxMjAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTkwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5QT0lOVFNcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9wb2ludHNcIixcbiAgICAgICAgICAgICAgICBpY29uX25hbWU6IFwicGF5bWVudFwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxOTAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6IFwiMTMwMDBcIixcbiAgICAgICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJNRU5VUy5BRE1JTklTVFJBVElPTi5PUkRFUlNfVE9EQVlcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwcC9jYXNoaWVyLW9yZGVycy10b2RheVwiLFxuICAgICAgICAgICAgICAgIGljb25fbmFtZTogXCJhc3NpZ25tZW50XCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEzMDAwXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIG1lbnVzLmZvckVhY2goKG1lbnU6IE1lbnUpID0+IE1lbnVzLmluc2VydChtZW51KSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUm9sZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvcm9sZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3JvbGUubW9kZWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFJvbGVzKCkge1xuXG4gICAgaWYgKFJvbGVzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuXG4gICAgICAgIGNvbnN0IHJvbGVzOiBSb2xlW10gPSBbe1xuICAgICAgICAgICAgX2lkOiBcIjEwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogXCJST0xFLkFETUlOSVNUUkFUT1JcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImVzdGFibGlzaG1lbnQgYWRtaW5pc3RyYXRvclwiLFxuICAgICAgICAgICAgbWVudXM6IFtcIjkwMFwiLCBcIjEwMDBcIiwgXCIyMDAwXCIsIFwiMzAwMFwiLCBcIjEwMDAwXCIsIFwiMTUwMDBcIiwgXCIxNjAwMFwiLCBcIjIwMDAwXCJdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIF9pZDogXCI0MDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IFwiUk9MRS5DVVNUT01FUlwiLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiZXN0YWJsaXNobWVudCBjdXN0b21lclwiLFxuICAgICAgICAgICAgbWVudXM6IFtcIjQwMDBcIiwgXCI2MDAwXCIsIFwiMTEwMDBcIiwgXCIxMjAwMFwiLCBcIjIwMDAwXCIsIFwiMTkwMDBcIl1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgX2lkOiBcIjYwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogXCJST0xFLlNVUEVSVklTT1JcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImVzdGFibGlzaG1lbnQgc3VwZXJ2aXNvclwiLFxuICAgICAgICAgICAgbWVudXM6IFtcIjkxMFwiLCBcIjExMDBcIiwgXCIxMjAwXCIsIFwiMjAwMDBcIl0sXG4gICAgICAgICAgICB1c2VyX3ByZWZpeDogJ3NwJ1xuICAgICAgICB9XTtcblxuICAgICAgICByb2xlcy5mb3JFYWNoKChyb2xlOiBSb2xlKSA9PiBSb2xlcy5pbnNlcnQocm9sZSkpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENvdW50cnkgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL2NvdW50cnkubW9kZWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZENvdW50cmllcygpIHtcbiAgICBpZiAoQ291bnRyaWVzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBjb3VudHJpZXM6IENvdW50cnlbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BTEJBTklBJywgYWxmYUNvZGUyOiAnQUwnLCBhbGZhQ29kZTM6ICdBTEInLCBudW1lcmljQ29kZTogJzAwOCcsIGluZGljYXRpdmU6ICcoKyAzNTUpJywgY3VycmVuY3lJZDogJzI3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5HRVJNQU5ZJywgYWxmYUNvZGUyOiAnREUnLCBhbGZhQ29kZTM6ICdERVUnLCBudW1lcmljQ29kZTogJzI3NicsIGluZGljYXRpdmU6ICcoKyA0OSknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFORE9SUkEnLCBhbGZhQ29kZTI6ICdBRCcsIGFsZmFDb2RlMzogJ0FORCcsIG51bWVyaWNDb2RlOiAnMDIwJywgaW5kaWNhdGl2ZTogJygrIDM3NiknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFSR0VOVElOQScsIGFsZmFDb2RlMjogJ0FSJywgYWxmYUNvZGUzOiAnQVJHJywgbnVtZXJpY0NvZGU6ICcwMzInLCBpbmRpY2F0aXZlOiAnKCsgNTQpJywgY3VycmVuY3lJZDogJzM3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BUk1FTklBJywgYWxmYUNvZGUyOiAnQU0nLCBhbGZhQ29kZTM6ICdBUk0nLCBudW1lcmljQ29kZTogJzA1MScsIGluZGljYXRpdmU6ICcoKyAzNzQpJywgY3VycmVuY3lJZDogJzE5MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5BVVNUUklBJywgYWxmYUNvZGUyOiAnQVQnLCBhbGZhQ29kZTM6ICdBVVQnLCBudW1lcmljQ29kZTogJzA0MCcsIGluZGljYXRpdmU6ICcoKyA0MyknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkFaRVJCQUlKQU4nLCBhbGZhQ29kZTI6ICdBWicsIGFsZmFDb2RlMzogJ0FaRScsIG51bWVyaWNDb2RlOiAnMDMxJywgaW5kaWNhdGl2ZTogJygrIDk5NCknLCBjdXJyZW5jeUlkOiAnMzUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJFTEdJVU0nLCBhbGZhQ29kZTI6ICdCRScsIGFsZmFDb2RlMzogJ0JFTCcsIG51bWVyaWNDb2RlOiAnMDU2JywgaW5kaWNhdGl2ZTogJygrIDMyKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQkVMSVpFJywgYWxmYUNvZGUyOiAnQlonLCBhbGZhQ29kZTM6ICdCTFonLCBudW1lcmljQ29kZTogJzA4NCcsIGluZGljYXRpdmU6ICcoKyA1MDEpJywgY3VycmVuY3lJZDogJzEzMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQkVSTVVEQVMnLCBhbGZhQ29kZTI6ICdCTScsIGFsZmFDb2RlMzogJ0JNVScsIG51bWVyaWNDb2RlOiAnMDYwJywgaW5kaWNhdGl2ZTogJygrIDEwMDQpJywgY3VycmVuY3lJZDogJzE0MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTEwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQkVMQVJVUycsIGFsZmFDb2RlMjogJ0JZJywgYWxmYUNvZGUzOiAnQkxSJywgbnVtZXJpY0NvZGU6ICcxMTInLCBpbmRpY2F0aXZlOiAnKCsgMzc1KScsIGN1cnJlbmN5SWQ6ICc0NDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJPTElWSUEnLCBhbGZhQ29kZTI6ICdCTycsIGFsZmFDb2RlMzogJ0JPTCcsIG51bWVyaWNDb2RlOiAnMDY4JywgaW5kaWNhdGl2ZTogJygrIDU5MSknLCBjdXJyZW5jeUlkOiAnMzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJPU05JQV9IRVJaRUdPVklOQScsIGFsZmFDb2RlMjogJ0JBJywgYWxmYUNvZGUzOiAnQklIJywgbnVtZXJpY0NvZGU6ICcwNzAnLCBpbmRpY2F0aXZlOiAnKCsgMzg3KScsIGN1cnJlbmN5SWQ6ICczNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkJSQVpJTCcsIGFsZmFDb2RlMjogJ0JSJywgYWxmYUNvZGUzOiAnQlJBJywgbnVtZXJpY0NvZGU6ICcwNzYnLCBpbmRpY2F0aXZlOiAnKCsgNTUpJywgY3VycmVuY3lJZDogJzQzMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQlVMR0FSSUEnLCBhbGZhQ29kZTI6ICdCRycsIGFsZmFDb2RlMzogJ0JHUicsIG51bWVyaWNDb2RlOiAnMTAwJywgaW5kaWNhdGl2ZTogJygrIDM1OSknLCBjdXJyZW5jeUlkOiAnMzEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5DQU5BREEnLCBhbGZhQ29kZTI6ICdDQScsIGFsZmFDb2RlMzogJ0NBTicsIG51bWVyaWNDb2RlOiAnMTI0JywgaW5kaWNhdGl2ZTogJygrIDAwMSknLCBjdXJyZW5jeUlkOiAnMTUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5DSElMRScsIGFsZmFDb2RlMjogJ0NMJywgYWxmYUNvZGUzOiAnQ0hMJywgbnVtZXJpY0NvZGU6ICcxNTInLCBpbmRpY2F0aXZlOiAnKCsgNTYpJywgY3VycmVuY3lJZDogJzM4MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuQ1lQUlVTJywgYWxmYUNvZGUyOiAnQ1knLCBhbGZhQ29kZTM6ICdDWVAnLCBudW1lcmljQ29kZTogJzE5NicsIGluZGljYXRpdmU6ICcoKzM1NyknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxOTAwJywgaXNfYWN0aXZlOiB0cnVlLCBuYW1lOiAnQ09VTlRSSUVTLkNPTE9NQklBJywgYWxmYUNvZGUyOiAnQ08nLCBhbGZhQ29kZTM6ICdDT0wnLCBudW1lcmljQ29kZTogJzE3MCcsIGluZGljYXRpdmU6ICcoKyA1NyknLCBjdXJyZW5jeUlkOiAnMzkwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJzAgNyAqLzIgKiAqJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcqIDggKiAqIConIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNPU1RBX1JJQ0EnLCBhbGZhQ29kZTI6ICdDUicsIGFsZmFDb2RlMzogJ0NSSScsIG51bWVyaWNDb2RlOiAnMTg4JywgaW5kaWNhdGl2ZTogJygrIDUwNiknLCBjdXJyZW5jeUlkOiAnNDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIxMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNST0FUSUEnLCBhbGZhQ29kZTI6ICdIUicsIGFsZmFDb2RlMzogJ0hSVicsIG51bWVyaWNDb2RlOiAnMTkxJywgaW5kaWNhdGl2ZTogJygrIDM4NSknLCBjdXJyZW5jeUlkOiAnMjUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5ERU5NQVJLJywgYWxmYUNvZGUyOiAnREsnLCBhbGZhQ29kZTM6ICdETksnLCBudW1lcmljQ29kZTogJzIwOCcsIGluZGljYXRpdmU6ICcoKyA0NSknLCBjdXJyZW5jeUlkOiAnNzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkVDVUFET1InLCBhbGZhQ29kZTI6ICdFQycsIGFsZmFDb2RlMzogJ0VDVScsIG51bWVyaWNDb2RlOiAnMjE4JywgaW5kaWNhdGl2ZTogJygrIDU5MyknLCBjdXJyZW5jeUlkOiAnMTYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5FTF9TQUxWQURPUicsIGFsZmFDb2RlMjogJ1NWJywgYWxmYUNvZGUzOiAnU0xWJywgbnVtZXJpY0NvZGU6ICcyMjInLCBpbmRpY2F0aXZlOiAnKCsgNTAzKScsIGN1cnJlbmN5SWQ6ICcxNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlNMT1ZBS0lBJywgYWxmYUNvZGUyOiAnU0snLCBhbGZhQ29kZTM6ICdTVksnLCBudW1lcmljQ29kZTogJzcwMycsIGluZGljYXRpdmU6ICcoKyA0MjEpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjYwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0xPVkVOSUEnLCBhbGZhQ29kZTI6ICdTSScsIGFsZmFDb2RlMzogJ1NWTicsIG51bWVyaWNDb2RlOiAnNzA1JywgaW5kaWNhdGl2ZTogJygrIDM4NiknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TUEFJTicsIGFsZmFDb2RlMjogJ0VTJywgYWxmYUNvZGUzOiAnRVNQJywgbnVtZXJpY0NvZGU6ICc3MjQnLCBpbmRpY2F0aXZlOiAnKCsgMzQpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVU5JVEVEX1NUQVRFUycsIGFsZmFDb2RlMjogJ1VTJywgYWxmYUNvZGUzOiAnVVNBJywgbnVtZXJpY0NvZGU6ICc4NDAnLCBpbmRpY2F0aXZlOiAnKCsgMSknLCBjdXJyZW5jeUlkOiAnMTYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyOTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5FU1RPTklBJywgYWxmYUNvZGUyOiAnRUUnLCBhbGZhQ29kZTM6ICdFU1QnLCBudW1lcmljQ29kZTogJzIzMycsIGluZGljYXRpdmU6ICcoKyAzNzIpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuRklOTEFORCcsIGFsZmFDb2RlMjogJ0ZJJywgYWxmYUNvZGUzOiAnRklOJywgbnVtZXJpY0NvZGU6ICcyNDYnLCBpbmRpY2F0aXZlOiAnKCsgMzU4KScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMxMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkZSQU5DRScsIGFsZmFDb2RlMjogJ0ZSJywgYWxmYUNvZGUzOiAnRlJBJywgbnVtZXJpY0NvZGU6ICcyNTAnLCBpbmRpY2F0aXZlOiAnKCsgMzMpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR0VPUkdJQScsIGFsZmFDb2RlMjogJ0dFJywgYWxmYUNvZGUzOiAnR0VPJywgbnVtZXJpY0NvZGU6ICcyNjgnLCBpbmRpY2F0aXZlOiAnKCsgOTk1KScsIGN1cnJlbmN5SWQ6ICcyNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkdSRUVDRScsIGFsZmFDb2RlMjogJ0dSJywgYWxmYUNvZGUzOiAnR1JDJywgbnVtZXJpY0NvZGU6ICczMDAnLCBpbmRpY2F0aXZlOiAnKCsgMzApJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR1JFRU5MQU5EJywgYWxmYUNvZGUyOiAnR0wnLCBhbGZhQ29kZTM6ICdHUkwnLCBudW1lcmljQ29kZTogJzMwNCcsIGluZGljYXRpdmU6ICcoKyAyOTkpJywgY3VycmVuY3lJZDogJzcwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczNTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5HVUFURU1BTEEnLCBhbGZhQ29kZTI6ICdHVCcsIGFsZmFDb2RlMzogJ0dUTScsIG51bWVyaWNDb2RlOiAnMzIwJywgaW5kaWNhdGl2ZTogJygrIDUwMiknLCBjdXJyZW5jeUlkOiAnNDIwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczNjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5GUkVOQ0hfR1VJQU5BJywgYWxmYUNvZGUyOiAnR0YnLCBhbGZhQ29kZTM6ICdHVUYnLCBudW1lcmljQ29kZTogJzI1NCcsIGluZGljYXRpdmU6ICcoKyA1OTQpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzcwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuR1VZQU5BJywgYWxmYUNvZGUyOiAnR1knLCBhbGZhQ29kZTM6ICdHVVknLCBudW1lcmljQ29kZTogJzMyOCcsIGluZGljYXRpdmU6ICcoKyA1OTIpJywgY3VycmVuY3lJZDogJzE3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuSE9ORFVSQVMnLCBhbGZhQ29kZTI6ICdITicsIGFsZmFDb2RlMzogJ0hORCcsIG51bWVyaWNDb2RlOiAnMzQwJywgaW5kaWNhdGl2ZTogJygrIDUwNCknLCBjdXJyZW5jeUlkOiAnMjgwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczOTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5IVU5HQVJZJywgYWxmYUNvZGUyOiAnSFUnLCBhbGZhQ29kZTM6ICdIVU4nLCBudW1lcmljQ29kZTogJzM0OCcsIGluZGljYXRpdmU6ICcoKyAzNiknLCBjdXJyZW5jeUlkOiAnMjEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0MDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5JUkVMQU5EJywgYWxmYUNvZGUyOiAnSUUnLCBhbGZhQ29kZTM6ICdJUkwnLCBudW1lcmljQ29kZTogJzM3MicsIGluZGljYXRpdmU6ICcoKyAzNTMpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDEwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuSUNFTEFORCcsIGFsZmFDb2RlMjogJ0lTJywgYWxmYUNvZGUzOiAnSVNMJywgbnVtZXJpY0NvZGU6ICczNTInLCBpbmRpY2F0aXZlOiAnKCsgMzU0KScsIGN1cnJlbmN5SWQ6ICc4MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuRkFMS0xBTkRfSVNMQU5EUycsIGFsZmFDb2RlMjogJ0ZLJywgYWxmYUNvZGUzOiAnRkxLJywgbnVtZXJpY0NvZGU6ICcyMzgnLCBpbmRpY2F0aXZlOiAnKCsgNTAwKScsIGN1cnJlbmN5SWQ6ICczMzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQzMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLklUQUxZJywgYWxmYUNvZGUyOiAnSVQnLCBhbGZhQ29kZTM6ICdJVEEnLCBudW1lcmljQ29kZTogJzM4MCcsIGluZGljYXRpdmU6ICcoKyAzOSknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5LQVpBS0hTVEFOJywgYWxmYUNvZGUyOiAnS1onLCBhbGZhQ29kZTM6ICdLQVonLCBudW1lcmljQ29kZTogJzM5OCcsIGluZGljYXRpdmU6ICcoKyA3MzEpJywgY3VycmVuY3lJZDogJzQ3MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDUwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTEFUVklBJywgYWxmYUNvZGUyOiAnTFYnLCBhbGZhQ29kZTM6ICdMVkEnLCBudW1lcmljQ29kZTogJzQyOCcsIGluZGljYXRpdmU6ICcoKyAzNzEpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDYwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTElFQ0hURU5TVEVJTicsIGFsZmFDb2RlMjogJ0xJJywgYWxmYUNvZGUzOiAnTElFJywgbnVtZXJpY0NvZGU6ICc0MzgnLCBpbmRpY2F0aXZlOiAnKCsgNDE3KScsIGN1cnJlbmN5SWQ6ICcyMjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ3MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkxJVEhVQU5JQScsIGFsZmFDb2RlMjogJ0xUJywgYWxmYUNvZGUzOiAnTFRVJywgbnVtZXJpY0NvZGU6ICc0NDAnLCBpbmRpY2F0aXZlOiAnKCsgMzcwKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkxVWEVNQk9VUkcnLCBhbGZhQ29kZTI6ICdMVScsIGFsZmFDb2RlMzogJ0xVWCcsIG51bWVyaWNDb2RlOiAnNDQyJywgaW5kaWNhdGl2ZTogJygrIDM1MiknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0OTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NQUNFRE9OSUEnLCBhbGZhQ29kZTI6ICdNSycsIGFsZmFDb2RlMzogJ01LRCcsIG51bWVyaWNDb2RlOiAnODA3JywgaW5kaWNhdGl2ZTogJygrIDM4OSknLCBjdXJyZW5jeUlkOiAnMTEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1MDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NQUxUQScsIGFsZmFDb2RlMjogJ01UJywgYWxmYUNvZGUzOiAnTUxUJywgbnVtZXJpY0NvZGU6ICc0NzAnLCBpbmRpY2F0aXZlOiAnKCsgMzU2KScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUxMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLk1FWElDTycsIGFsZmFDb2RlMjogJ01YJywgYWxmYUNvZGUzOiAnTUVYJywgbnVtZXJpY0NvZGU6ICc0ODQnLCBpbmRpY2F0aXZlOiAnKCsgNTIpJywgY3VycmVuY3lJZDogJzQwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTU9MREFWSUEnLCBhbGZhQ29kZTI6ICdNRCcsIGFsZmFDb2RlMzogJ01EQScsIG51bWVyaWNDb2RlOiAnNDk4JywgaW5kaWNhdGl2ZTogJygrIDM3MyknLCBjdXJyZW5jeUlkOiAnMjkwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1MzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NT05BQ08nLCBhbGZhQ29kZTI6ICdNQycsIGFsZmFDb2RlMzogJ01DTycsIG51bWVyaWNDb2RlOiAnNDkyJywgaW5kaWNhdGl2ZTogJygrIDM3NyknLCBjdXJyZW5jeUlkOiAnMjAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1NDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5NT05URU5FR1JPJywgYWxmYUNvZGUyOiAnTUUnLCBhbGZhQ29kZTM6ICdNTkUnLCBudW1lcmljQ29kZTogJzQ5OScsIGluZGljYXRpdmU6ICcoKyAzODIpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTUwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTklDQVJBR1VBJywgYWxmYUNvZGUyOiAnTkknLCBhbGZhQ29kZTM6ICdOSUMnLCBudW1lcmljQ29kZTogJzU1OCcsIGluZGljYXRpdmU6ICcoKyA1MDUpJywgY3VycmVuY3lJZDogJzUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc1NjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5OT1JXQVknLCBhbGZhQ29kZTI6ICdOTycsIGFsZmFDb2RlMzogJ05PUicsIG51bWVyaWNDb2RlOiAnNTc4JywgaW5kaWNhdGl2ZTogJygrIDQ3KScsIGN1cnJlbmN5SWQ6ICc5MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTcwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuTkVUSEVSTEFORFMnLCBhbGZhQ29kZTI6ICdOTCcsIGFsZmFDb2RlMzogJ05MRCcsIG51bWVyaWNDb2RlOiAnNTI4JywgaW5kaWNhdGl2ZTogJygrIDMxKScsIGN1cnJlbmN5SWQ6ICcyMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzU4MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlBBTkFNQScsIGFsZmFDb2RlMjogJ1BBJywgYWxmYUNvZGUzOiAnUEFOJywgbnVtZXJpY0NvZGU6ICc1OTEnLCBpbmRpY2F0aXZlOiAnKCsgNTA3KScsIGN1cnJlbmN5SWQ6ICcxMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuUEFSQUdVQVknLCBhbGZhQ29kZTI6ICdQWScsIGFsZmFDb2RlMzogJ1BSWScsIG51bWVyaWNDb2RlOiAnNjAwJywgaW5kaWNhdGl2ZTogJygrIDU5NSknLCBjdXJyZW5jeUlkOiAnMjQwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MDAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5QRVJVJywgYWxmYUNvZGUyOiAnUEUnLCBhbGZhQ29kZTM6ICdQRVInLCBudW1lcmljQ29kZTogJzYwNCcsIGluZGljYXRpdmU6ICcoKyA1MSknLCBjdXJyZW5jeUlkOiAnNDYwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5QT0xBTkQnLCBhbGZhQ29kZTI6ICdQTCcsIGFsZmFDb2RlMzogJ1BPTCcsIG51bWVyaWNDb2RlOiAnNjE2JywgaW5kaWNhdGl2ZTogJygrIDQ4KScsIGN1cnJlbmN5SWQ6ICc0ODAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzYyMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlBPUlRVR0FMJywgYWxmYUNvZGUyOiAnUFQnLCBhbGZhQ29kZTM6ICdQUlQnLCBudW1lcmljQ29kZTogJzYyMCcsIGluZGljYXRpdmU6ICcoKyAzNTEpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjMwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVU5JVEVEX0tJTkdET00nLCBhbGZhQ29kZTI6ICdHQicsIGFsZmFDb2RlMzogJ0dCUicsIG51bWVyaWNDb2RlOiAnODI2JywgaW5kaWNhdGl2ZTogJygrIDQ0KScsIGN1cnJlbmN5SWQ6ICczMjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY0MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLkNaRUNIX1JFUFVCTElDJywgYWxmYUNvZGUyOiAnQ1onLCBhbGZhQ29kZTM6ICdDWkUnLCBudW1lcmljQ29kZTogJzIwMycsIGluZGljYXRpdmU6ICcoKyA0MiknLCBjdXJyZW5jeUlkOiAnNjAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlJPTUFOSUEnLCBhbGZhQ29kZTI6ICdSTycsIGFsZmFDb2RlMzogJ1JPVScsIG51bWVyaWNDb2RlOiAnNjQyJywgaW5kaWNhdGl2ZTogJygrIDQwKScsIGN1cnJlbmN5SWQ6ICczMDAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzY2MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlJVU1NJQScsIGFsZmFDb2RlMjogJ1JVJywgYWxmYUNvZGUzOiAnUlVTJywgbnVtZXJpY0NvZGU6ICc2NDMnLCBpbmRpY2F0aXZlOiAnKCsgNyknLCBjdXJyZW5jeUlkOiAnNDUwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2NzAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TQU5fTUFSSU5PJywgYWxmYUNvZGUyOiAnU00nLCBhbGZhQ29kZTM6ICdTTVInLCBudW1lcmljQ29kZTogJzY3NCcsIGluZGljYXRpdmU6ICcoKyAzNzgpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjgwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0FJTlRfUElFUlJFX01JUVVFTE9OJywgYWxmYUNvZGUyOiAnUE0nLCBhbGZhQ29kZTM6ICdTUE0nLCBudW1lcmljQ29kZTogJzY2NicsIGluZGljYXRpdmU6ICcoKyA1MDgpJywgY3VycmVuY3lJZDogJzIwMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNjkwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU0VSQklBJywgYWxmYUNvZGUyOiAnUlMnLCBhbGZhQ29kZTM6ICdTUkInLCBudW1lcmljQ29kZTogJzY4OCcsIGluZGljYXRpdmU6ICcoKyAzODEpJywgY3VycmVuY3lJZDogJzEyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzAwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU1dFREVOJywgYWxmYUNvZGUyOiAnU0UnLCBhbGZhQ29kZTM6ICdTV0UnLCBudW1lcmljQ29kZTogJzc1MicsIGluZGljYXRpdmU6ICcoKyA0NiknLCBjdXJyZW5jeUlkOiAnMTAwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3MTAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5TV0lUWkVSTEFORCcsIGFsZmFDb2RlMjogJ0NIJywgYWxmYUNvZGUzOiAnQ0hFJywgbnVtZXJpY0NvZGU6ICc3NTYnLCBpbmRpY2F0aXZlOiAnKCsgNDEpJywgY3VycmVuY3lJZDogJzIyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzIwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuU1VSSU5BTScsIGFsZmFDb2RlMjogJ1NSJywgYWxmYUNvZGUzOiAnU1VSJywgbnVtZXJpY0NvZGU6ICc3NDAnLCBpbmRpY2F0aXZlOiAnKCsgNTk3KScsIGN1cnJlbmN5SWQ6ICcxODAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzczMDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlRVUktFWScsIGFsZmFDb2RlMjogJ1RSJywgYWxmYUNvZGUzOiAnVFVSJywgbnVtZXJpY0NvZGU6ICc3OTInLCBpbmRpY2F0aXZlOiAnKCsgOTApJywgY3VycmVuY3lJZDogJzM0MCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzQwMCcsIGlzX2FjdGl2ZTogZmFsc2UsIG5hbWU6ICdDT1VOVFJJRVMuVUtSQUlORScsIGFsZmFDb2RlMjogJ1VBJywgYWxmYUNvZGUzOiAnVUtSJywgbnVtZXJpY0NvZGU6ICc4MDQnLCBpbmRpY2F0aXZlOiAnKCsgMzgwKScsIGN1cnJlbmN5SWQ6ICcyMzAnLCBpdGVtc1dpdGhEaWZmZXJlbnRUYXg6IGZhbHNlLCBjcm9uQ2hlY2tDdXJyZW50TWVkYWxzOiAnJywgY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHM6ICcnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzc1MDAnLCBpc19hY3RpdmU6IGZhbHNlLCBuYW1lOiAnQ09VTlRSSUVTLlVSVUdVQVknLCBhbGZhQ29kZTI6ICdVWScsIGFsZmFDb2RlMzogJ1VSWScsIG51bWVyaWNDb2RlOiAnODU4JywgaW5kaWNhdGl2ZTogJygrIDU5OCknLCBjdXJyZW5jeUlkOiAnNDEwJywgaXRlbXNXaXRoRGlmZmVyZW50VGF4OiBmYWxzZSwgY3JvbkNoZWNrQ3VycmVudE1lZGFsczogJycsIGNyb25DaGVja05lZ2F0aXZlTWVkYWxzOiAnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3NjAwJywgaXNfYWN0aXZlOiBmYWxzZSwgbmFtZTogJ0NPVU5UUklFUy5WRU5FWlVFTEEnLCBhbGZhQ29kZTI6ICdWRScsIGFsZmFDb2RlMzogJ1ZFTicsIG51bWVyaWNDb2RlOiAnODYyJywgaW5kaWNhdGl2ZTogJygrIDU4KScsIGN1cnJlbmN5SWQ6ICcyMCcsIGl0ZW1zV2l0aERpZmZlcmVudFRheDogZmFsc2UsIGNyb25DaGVja0N1cnJlbnRNZWRhbHM6ICcnLCBjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFsczogJycgfVxuICAgICAgICBdO1xuICAgICAgICBjb3VudHJpZXMuZm9yRWFjaCgoY291bnRyeTogQ291bnRyeSkgPT4gQ291bnRyaWVzLmluc2VydChjb3VudHJ5KSk7XG4gICAgfVxufSIsImltcG9ydCB7IEN1cnJlbmN5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9jdXJyZW5jeS5tb2RlbCc7XG5pbXBvcnQgeyBDdXJyZW5jaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2N1cnJlbmN5LmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEN1cnJlbmNpZXMoKXtcbiAgICBpZiggQ3VycmVuY2llcy5maW5kKCkuY3Vyc29yLmNvdW50KCkgPT09IDAgKXtcbiAgICAgICAgY29uc3QgY3VycmVuY2llczogQ3VycmVuY3lbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQkFMQk9BJywgY29kZTogJ1BBQicsIG51bWVyaWNDb2RlOiAnNTkwJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CT0xJVkFSJywgY29kZTogJ1ZFRicsIG51bWVyaWNDb2RlOiAnOTM3JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CT0xJVklBTk8nLCBjb2RlOiAnQk9CJywgbnVtZXJpY0NvZGU6ICcwNjgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPU1RBX1JJQ0FfQ09MT04nLCBjb2RlOiAnQ1JDJywgbnVtZXJpY0NvZGU6ICcxODgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPUkRPQkEnLCBjb2RlOiAnTklPJywgbnVtZXJpY0NvZGU6ICc1NTgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzYwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNaRUNIX1JFUFVCTElDX0tPUlVOQScsIGNvZGU6ICdDWksnLCBudW1lcmljQ29kZTogJzIwMycsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuREVOTUFSS19LUk9ORScsIGNvZGU6ICdES0snLCBudW1lcmljQ29kZTogJzIwOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnODAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuSUNFTEFORF9LUk9OQScsIGNvZGU6ICdJU0snLCBudW1lcmljQ29kZTogJzM1MicsIGRlY2ltYWw6IDAgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnOTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuTk9SV0FZX0tST05FJywgY29kZTogJ05PSycsIG51bWVyaWNDb2RlOiAnNTc4JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMDAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuU1dFREVOX0tST05BJywgY29kZTogJ1NFSycsIG51bWVyaWNDb2RlOiAnNzUyJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuREVOQVInLCBjb2RlOiAnTUtEJywgbnVtZXJpY0NvZGU6ICc4MDcnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5TRVJCSUFfRElOQVInLCBjb2RlOiAnUlNEJywgbnVtZXJpY0NvZGU6ICc5NDEnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEzMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CRUxJWkVfRE9MTEFSJywgY29kZTogJ0JaRCcsIG51bWVyaWNDb2RlOiAnMDg0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNDAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQkVSTVVESUFOX0RPTExBUicsIGNvZGU6ICdCTUQnLCBudW1lcmljQ29kZTogJzA2MCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNBTkFESUFOX0RPTExBUicsIGNvZGU6ICdDQUQnLCBudW1lcmljQ29kZTogJzEyNCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTYwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVOSVRFRF9TVEFURVNfRE9MTEFSJywgY29kZTogJ1VTRCcsIG51bWVyaWNDb2RlOiAnODQwJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuR1VZQU5BX0RPTExBUicsIGNvZGU6ICdHWUQnLCBudW1lcmljQ29kZTogJzMyOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTgwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlNVUklOQU1FX0RPTExBUicsIGNvZGU6ICdTUkQnLCBudW1lcmljQ29kZTogJzk2OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTkwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFSTUVOSUFNX0RSQU0nLCBjb2RlOiAnQU1EJywgbnVtZXJpY0NvZGU6ICcwNTEnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5FVVJPJywgY29kZTogJ0VVUicsIG51bWVyaWNDb2RlOiAnOTc4JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMTAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuSFVOR0FSWV9GT1JJTlQnLCBjb2RlOiAnSFVGJywgbnVtZXJpY0NvZGU6ICczNDgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIyMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5GUkFOQycsIGNvZGU6ICdDSEYnLCBudW1lcmljQ29kZTogJzc1NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjMwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVLUkFJTkVfSFJZVk5JQScsIGNvZGU6ICdVQUgnLCBudW1lcmljQ29kZTogJzk4MCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkdVQVJBTkknLCBjb2RlOiAnUFlHJywgbnVtZXJpY0NvZGU6ICc2MDAnLCBkZWNpbWFsOiAwIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI1MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5LVU5BJywgY29kZTogJ0hSSycsIG51bWVyaWNDb2RlOiAnMTkxJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyNjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuTEFSSScsIGNvZGU6ICdHRUwnLCBudW1lcmljQ29kZTogJzk4MScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjcwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkxFSycsIGNvZGU6ICdBTEwnLCBudW1lcmljQ29kZTogJzAwOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjgwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkxFTVBJUkEnLCBjb2RlOiAnSE5MJywgbnVtZXJpY0NvZGU6ICczNDAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzI5MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5NT0xET1ZBX0xFVScsIGNvZGU6ICdNREwnLCBudW1lcmljQ29kZTogJzQ5OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlJPTUFOSUFOX0xFVScsIGNvZGU6ICdST04nLCBudW1lcmljQ29kZTogJzk0NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzEwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkJVTEdBUklBX0xFVicsIGNvZGU6ICdCR04nLCBudW1lcmljQ29kZTogJzk3NScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzIwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlBPVU5EX1NURVJMSU5HJywgY29kZTogJ0dCUCcsIG51bWVyaWNDb2RlOiAnODI2JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuRkFMS0xBTkRfSVNMQU5EU19QT1VORCcsIGNvZGU6ICdGS1AnLCBudW1lcmljQ29kZTogJzIzOCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlRVUktJU0hfTElSQScsIGNvZGU6ICdUUlknLCBudW1lcmljQ29kZTogJzk0OScsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzUwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFaRVJCQUlKQU5JX01BTkFUJywgY29kZTogJ0FaTicsIG51bWVyaWNDb2RlOiAnOTQ0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczNjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQ09OVkVSVElCTEVfTUFSSycsIGNvZGU6ICdCQU0nLCBudW1lcmljQ29kZTogJzk3NycsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzcwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkFSR0VOVElOQV9QRVNPJywgY29kZTogJ0FSUycsIG51bWVyaWNDb2RlOiAnMDMyJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczODAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuQ0hJTEVfUEVTTycsIGNvZGU6ICdDTFAnLCBudW1lcmljQ29kZTogJzE1MicsIGRlY2ltYWw6IDAgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzkwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkNPTE9NQklBX1BFU08nLCBjb2RlOiAnQ09QJywgbnVtZXJpY0NvZGU6ICcxNzAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5NRVhJQ09fUEVTTycsIGNvZGU6ICdNWE4nLCBudW1lcmljQ29kZTogJzQ4NCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDEwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlVSVUdVQVlfUEVTTycsIGNvZGU6ICdVWVUnLCBudW1lcmljQ29kZTogJzg1OCcsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDIwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLlFVRVRaQUwnLCBjb2RlOiAnR1RRJywgbnVtZXJpY0NvZGU6ICczMjAnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQzMCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5CUkFaSUxJQU5fUkVBTCcsIGNvZGU6ICdCUkwnLCBudW1lcmljQ29kZTogJzk4NicsIGRlY2ltYWw6IDAuMDEgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDQwJywgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdDVVJSRU5DSUVTLkJFTEFSVVNJQU5fUlVCTEUnLCBjb2RlOiAnQllSJywgbnVtZXJpY0NvZGU6ICc5NzQnLCBkZWNpbWFsOiAwIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ1MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5SVVNTSUFOX1JVQkxFJywgY29kZTogJ1JVQicsIG51bWVyaWNDb2RlOiAnNjQzJywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NjAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuU09MJywgY29kZTogJ1BFTicsIG51bWVyaWNDb2RlOiAnNjA0JywgZGVjaW1hbDogMC4wMSB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc0NzAnLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ0NVUlJFTkNJRVMuVEVOR0UnLCBjb2RlOiAnS1pUJywgbnVtZXJpY0NvZGU6ICczOTgnLCBkZWNpbWFsOiAwLjAxIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQ4MCcsIGlzQWN0aXZlOiB0cnVlLCBuYW1lOiAnQ1VSUkVOQ0lFUy5aTE9UWScsIGNvZGU6ICdQTE4nLCBudW1lcmljQ29kZTogJzk4NScsIGRlY2ltYWw6IDAuMDEgfVxuICAgICAgICBdOyAgICAgICAgXG4gICAgICAgIGN1cnJlbmNpZXMuZm9yRWFjaCggKCBjdXI6Q3VycmVuY3kgKSA9PiBDdXJyZW5jaWVzLmluc2VydCggY3VyICkgKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgRW1haWxDb250ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9lbWFpbC1jb250ZW50Lm1vZGVsJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFbWFpbENvbnRlbnRzKCkge1xuICAgIGlmIChFbWFpbENvbnRlbnRzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBlbWFpbENvbnRlbnRzOiBFbWFpbENvbnRlbnRbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcxMDAnLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgICAgICAgICAgIGxhbmdfZGljdGlvbmFyeTogW1xuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnY2hhcmdlU29vbkVtYWlsU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdZb3VyIG1vbnRobHkgY29tZXlnYW5hIHNlcnZpY2Ugd2lsbCBlbmRzIHNvb24nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdncmVldFZhcicsIHRyYWR1Y3Rpb246ICdIZWxsbycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3dlbGNvbWVNc2dWYXInLCB0cmFkdWN0aW9uOiAnV2UgZ290IGEgcmVxdWVzdCB0byByZXNldCB5b3UgcGFzc3dvcmQsIGlmIGl0IHdhcyB5b3UgY2xpY2sgdGhlIGJ1dHRvbiBhYm92ZS4nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdidG5UZXh0VmFyJywgdHJhZHVjdGlvbjogJ1Jlc2V0JyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnYmVmb3JlTXNnVmFyJywgdHJhZHVjdGlvbjogJ0lmIHlvdSBkbyBub3Qgd2FudCB0byBjaGFuZ2UgdGhlIHBhc3N3b3JkLCBpZ25vcmUgdGhpcyBtZXNzYWdlLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlZ2FyZFZhcicsIHRyYWR1Y3Rpb246ICdUaGFua3MsIGNvbWV5Z2FuYSB0ZWFtLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2ZvbGxvd01zZ1ZhcicsIHRyYWR1Y3Rpb246ICdGb2xsb3cgdXMgb24gc29jaWFsIG5ldHdvcmtzJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyJywgdHJhZHVjdGlvbjogJ1JlbWVtYmVyIHRoYXQgeW91ciBtb250aGx5IGNvbWV5Z2FuYSBzZXJ2aWNlIGZvcjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyMicsIHRyYWR1Y3Rpb246ICdFbmRzIG9uOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdpbnN0cnVjdGlvbmNoYXJnZVNvb25Nc2dWYXInLCB0cmFkdWN0aW9uOiAnSWYgeW91IHdhbnQgdG8gY29udGludWUgdXNpbmcgYWxsIHRoZSBzeXN0ZW0gZmVhdHVyZXMsIGVudGVyaW5nIHdpdGggeW91ciBlbWFpbCBvciB1c2VybmFtZSBhbmQgc2VsZWN0IHRoZSBtZW51IEVzdGFibGlzaG1lbnRzID4gQWRtaW5pc3RyYXRpb24gPiBFZGl0IGVzdGFibGlzaG1lbnQgPiAjIFRhYmxlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyRXhwaXJlU29vbk1zZ1ZhcicsIHRyYWR1Y3Rpb246ICdSZW1lbWJlciB0aGF0IHlvdXIgbW9udGhseSBjb21leWdhbmEgc2VydmljZSBmb3I6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyRXhwaXJlU29vbk1zZ1ZhcjInLCB0cmFkdWN0aW9uOiAnRXhwaXJlcyBvbjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyMycsIHRyYWR1Y3Rpb246ICdJZiB5b3Ugd2FudCB0byBjb250aW51ZSB1c2luZyBhbGwgdGhlIHN5c3RlbSBmZWF0dXJlcywgZW50ZXJpbmcgd2l0aCB5b3VyIGVtYWlsIG9yIHVzZXJuYW1lIGFuZCBzZWxlY3QgdGhlIG1lbnUgUGF5bWVudHMgPiBNb250aGx5IHBheW1lbnQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdleHBpcmVTb29uRW1haWxTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1lvdXIgY29tZXlnYW5hIHNlcnZpY2Ugd2lsbCBleHBpcmUgc29vbicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyUmVzdEV4cGlyZWRWYXInLCB0cmFkdWN0aW9uOiAnWW91ciBtb250aGx5IGNvbWV5Z2FuYSBzZXJ2aWNlIGZvcjogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJSZXN0RXhwaXJlZFZhcjInLCB0cmFkdWN0aW9uOiAnSGFzIGV4cGlyZWQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlclJlc3RFeHBpcmVkVmFyMycsIHRyYWR1Y3Rpb246ICdJZiB5b3Ugd2FudCB0byBjb250aW51ZSB1c2luZyBhbGwgdGhlIHN5c3RlbSBmZWF0dXJlcywgZW50ZXJpbmcgd2l0aCB5b3VyIGVtYWlsIG9yIHVzZXJuYW1lIGFuZCBzZWxlY3QgdGhlIG1lbnUgUGF5bWVudHMgPiBSZWFjdGl2YXRlICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3Jlc3RFeHBpcmVkRW1haWxTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1lvdXIgY29tZXlnYW5hIHNlcnZpY2UgaGFzIGV4cGlyZWQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZXNldFBhc3N3b3JkU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdSZXNldCB5b3VyIHBhc3N3b3JkIG9uJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDdXJyZW50TWVkYWxzMScsIHRyYWR1Y3Rpb246ICdTb29uIHlvdSB3aWxsIGZpbmlzaCB5b3VyIG1lZGFscyBmb3IgJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDdXJyZW50TWVkYWxzMicsIHRyYWR1Y3Rpb246ICdZb3Ugb25seSBoYXZlICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyQ3VycmVudE1lZGFsczMnLCB0cmFkdWN0aW9uOiAnIG1lZGFscycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyQ3VycmVudE1lZGFsczQnLCB0cmFkdWN0aW9uOiAnU2VsZWN0IHRoZSBtZW51IFBhY2thZ2VzID4gQnV5IHBhY2thZ2VzIGFuZCBjb250aW51ZXMgbG95YWx0eSB5b3VyIGN1c3RvbWVycyB3aXRoIGNvbWV5Z2FuYScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2NoZWNrTWVkYWxzU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdZb3VyIG1lZGFscyB3aWxsIGVuZCBzb29uJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczEnLCB0cmFkdWN0aW9uOiAnWW91IGhhdmUgZmluaXNoZWQgeW91ciBtZWRhbHMgZm9yICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyTmVnYXRpdmVNZWRhbHMyJywgdHJhZHVjdGlvbjogJ0J1dCBkbyBub3Qgd29ycnksIHdlIGhhdmUgbGVudCB5b3UgJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczMnLCB0cmFkdWN0aW9uOiAnbWVkYWxzIHdoaWxlIHlvdSBidXkgYSBuZXcgcGFja2FnZScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyTmVnYXRpdmVNZWRhbHM0JywgdHJhZHVjdGlvbjogJ1RvIGJ1eSBhIG5ldyBwYWNrYWdlIHNlbGVjdCB0aGUgbWVudSBQYWNrYWdlcyA+IEJ1eSBwYWNrYWdlcyBhbmQgY29udGludWVzIGxveWFsdHkgeW91ciBjdXN0b21lcnMgd2l0aCBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdjaGVja05lZ2F0aXZlU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdZb3VyIG1lZGFscyBhcmUgb3ZlcicgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiAnMjAwJyxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTogJ2VzJyxcbiAgICAgICAgICAgICAgICBsYW5nX2RpY3Rpb25hcnk6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2NoYXJnZVNvb25FbWFpbFN1YmplY3RWYXInLCB0cmFkdWN0aW9uOiAnVHUgc2VydmljaW8gbWVuc3VhbCBkZSBjb21leWdhbmEgdGVybWluYXLDoSBwcm9udG8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdncmVldFZhcicsIHRyYWR1Y3Rpb246ICdIb2xhJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnd2VsY29tZU1zZ1ZhcicsIHRyYWR1Y3Rpb246ICdIZW1vcyByZWNpYmlkbyB1bmEgcGV0aWNpw7NuIHBhcmEgY2FtYmlhciB0dSBjb250cmFzZcOxYSwgc2kgZnVpc3RlIHR1IGhheiBjbGljayBlbiBlbCBib3TDs24gYWJham8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdidG5UZXh0VmFyJywgdHJhZHVjdGlvbjogJ0NhbWJpYXInIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdiZWZvcmVNc2dWYXInLCB0cmFkdWN0aW9uOiAnU2kgbm8gcXVpZXJlcyBjYW1iaWFyIGxhIGNvbnRyYXNlw7FhLCBpZ25vcmEgZXN0ZSBtZW5zYWplLicgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlZ2FyZFZhcicsIHRyYWR1Y3Rpb246ICdHcmFjaWFzLCBlcXVpcG8gY29tZXlnYW5hJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnZm9sbG93TXNnVmFyJywgdHJhZHVjdGlvbjogJ1NpZ3Vlbm9zIGVuIHJlZGVzIHNvY2lhbGVzJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJDaGFyZ2VTb29uTXNnVmFyJywgdHJhZHVjdGlvbjogJ1JlY3VlcmRhIHF1ZSB0dSBzZXJ2aWNpbyBtZW5zdWFsIGRlIGNvbWV5Z2FuYSBwYXJhOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckNoYXJnZVNvb25Nc2dWYXIyJywgdHJhZHVjdGlvbjogJ0ZpbmFsaXphIGVsOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdpbnN0cnVjdGlvbmNoYXJnZVNvb25Nc2dWYXInLCB0cmFkdWN0aW9uOiAnU2kgZGVzZWFzIHNlZ3VpciB1c2FuZG8gdG9kYXMgbGFzIGZ1bmNpb25hbGlkYWRlcyBkZWwgc2lzdGVtYSwgaW5ncmVzYSBjb24gdHUgdXN1YXJpbyBvIGNvcnJlbyB5IHNlbGVjY2lvbmEgZWwgbWVuw7ogRXN0YWJsZWNpbWllbnRvcyA+IEFkbWluaXN0cmFjacOzbiA+IEVkaXRhciBlc3RhYmxlY2ltaWVudG8gPiAjIE1lc2FzJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyJywgdHJhZHVjdGlvbjogJ1JlY3VlcmRhIHF1ZSB0dSBzZXJ2aWNpbyBtZW5zdWFsIGRlIGNvbWV5Z2FuYSBwYXJhOiAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckV4cGlyZVNvb25Nc2dWYXIyJywgdHJhZHVjdGlvbjogJ0V4cGlyYSBlbDogJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJFeHBpcmVTb29uTXNnVmFyMycsIHRyYWR1Y3Rpb246ICdTaSBkZXNlYXMgc2VndWlyIHVzYW5kbyB0b2RhcyBsYXMgZnVuY2lvbmFsaWRhZGVzIGRlbCBzaXN0ZW1hLCBpbmdyZXNhIGNvbiB0dSB1c3VhcmlvIG8gY29ycmVvIHkgc2VsZWNjaW9uYSBlbCBtZW7DuiBQYWdvcyA+IFBhZ28gbWVuc3VhbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ2V4cGlyZVNvb25FbWFpbFN1YmplY3RWYXInLCB0cmFkdWN0aW9uOiAnVHUgc2VydmljaW8gY29tZXlnYW5hIGV4cGlyYXLDoSBwcm9udG8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlclJlc3RFeHBpcmVkVmFyJywgdHJhZHVjdGlvbjogJ1R1IHNlcnZpY2lvIG1lbnN1YWwgZGUgY29tZXlnYW5hIHBhcmE6ICcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyUmVzdEV4cGlyZWRWYXIyJywgdHJhZHVjdGlvbjogJ2hhIGV4cGlyYWRvJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJSZXN0RXhwaXJlZFZhcjMnLCB0cmFkdWN0aW9uOiAnU2kgZGVzZWFzIHNlZ3VpciB1c2FuZG8gdG9kYXMgbGFzIGZ1bmNpb25hbGlkYWRlcyBkZWwgc2lzdGVtYSwgaW5ncmVzYSBjb24gdHUgdXN1YXJpbyBvIGNvcnJlbyB5IHNlbGVjY2lvbmEgbGEgb3BjacOzbiBQYWdvcyA+IFJlYWN0aXZhciAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZXN0RXhwaXJlZEVtYWlsU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdUdSBzZXJ2aWNpbyBkZSBjb21leWdhbmEgaGEgZXhwaXJhZG8nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZXNldFBhc3N3b3JkU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdDYW1iaW8gZGUgY29udHJhc2XDsWEgZW4nIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckN1cnJlbnRNZWRhbHMxJywgdHJhZHVjdGlvbjogJ1Byb250byB0ZXJtaW5hcsOhcyB0dXMgbWVkYWxsYXMgcGFyYSAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckN1cnJlbnRNZWRhbHMyJywgdHJhZHVjdGlvbjogJ8OabmljYW1lbnRlIHRpZW5lcyAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlckN1cnJlbnRNZWRhbHMzJywgdHJhZHVjdGlvbjogJyBtZWRhbGxhcycgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyQ3VycmVudE1lZGFsczQnLCB0cmFkdWN0aW9uOiAnU2VsZWNjaW9uYSBlbCBtZW7DuiBQYXF1ZXRlcyA+IENvbXByYSBkZSBwYXF1ZXRlcywgeSBjb250aW51YSBmaWRlbGl6YW5kbyBhIHR1cyBjbGllbnRlcyBjb24gY29tZXlnYW5hJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnY2hlY2tNZWRhbHNTdWJqZWN0VmFyJywgdHJhZHVjdGlvbjogJ1R1cyBtZWRhbGxhcyBjb21leWdhbmEgZXN0w6FuIHByw7N4aW1hcyBhIHRlcm1pbmFyJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAncmVtaW5kZXJOZWdhdGl2ZU1lZGFsczEnLCB0cmFkdWN0aW9uOiAnSGFzIHRlcm1pbmFkbyBsYXMgbWVkYWxsYXMgcGFyYSAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlck5lZ2F0aXZlTWVkYWxzMicsIHRyYWR1Y3Rpb246ICdQZXJvIG5vIHRlIHByZW9jdXBlcyB0ZSBwcsOpc3RhbW9zIGxhcyAnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdyZW1pbmRlck5lZ2F0aXZlTWVkYWxzMycsIHRyYWR1Y3Rpb246ICdtZWRhbGxhcyBxdWUgaGFzIHVzYWRvLCBtaWVudHJhcyBhZHF1aWVyZXMgdW4gbnVldm8gcGFxdWV0ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogJ3JlbWluZGVyTmVnYXRpdmVNZWRhbHM0JywgdHJhZHVjdGlvbjogJ1BhcmEgY29tcHJhciB1biBudWV2byBwYXF1ZXRlIHNlbGVjY2lvbmEgZWwgbWVudSBQYXF1ZXRlcyA+IENvbXByYSBkZSBwYXF1ZXRlcywgeSBjb250aW51YSBmaWRlbGl6YW5kbyB0dSBjbGllbnRlIGNvbiBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdjaGVja05lZ2F0aXZlU3ViamVjdFZhcicsIHRyYWR1Y3Rpb246ICdUdXMgbWVkYWxsYXMgc2UgaGFuIGFjYWJhZG8nIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIGVtYWlsQ29udGVudHMuZm9yRWFjaCgoZW1haWxDb250ZW50OiBFbWFpbENvbnRlbnQpID0+IEVtYWlsQ29udGVudHMuaW5zZXJ0KGVtYWlsQ29udGVudCkpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBIb3VyIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9ob3VyLm1vZGVsJztcbmltcG9ydCB7IEhvdXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2hvdXJzLmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEhvdXJzKCkge1xuXG4gICAgaWYoSG91cnMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwICl7XG4gICAgICAgIGNvbnN0IGhvdXJzOiBIb3VyW10gPSBbXG4gICAgICAgICAgICB7IGhvdXI6JzAwOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMDozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDE6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzAxOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMjowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDI6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzAzOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwMzozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDQ6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA0OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwNTowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDU6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA2OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwNjozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDc6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA3OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwODowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMDg6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzA5OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicwOTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTA6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzEwOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxMTowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTE6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzEyOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxMjozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTM6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzEzOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNDowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTQ6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE1OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTY6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE2OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxNzowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTc6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE4OjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicxODozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMTk6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzE5OjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMDowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjA6MzAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzIxOjAwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMTozMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjI6MDAnIH0sXG4gICAgICAgICAgICB7IGhvdXI6JzIyOjMwJyB9LFxuICAgICAgICAgICAgeyBob3VyOicyMzowMCcgfSxcbiAgICAgICAgICAgIHsgaG91cjonMjM6MzAnIH1cbiAgICAgICAgXTtcblxuICAgICAgICBob3Vycy5mb3JFYWNoKChob3VyOkhvdXIpID0+IEhvdXJzLmluc2VydChob3VyKSk7XG4gICAgfVxufSIsImltcG9ydCB7IExhbmd1YWdlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IExhbmd1YWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9sYW5ndWFnZS5tb2RlbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTGFuZ3VhZ2VzKCl7XG4gICAgaWYoTGFuZ3VhZ2VzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCl7XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlczogTGFuZ3VhZ2VbXSA9IFt7XG4gICAgICAgICAgICBfaWQ6IFwiMTAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbGFuZ3VhZ2VfY29kZTogJ2VzJyxcbiAgICAgICAgICAgIG5hbWU6ICdFc3Bhw7FvbCcsXG4gICAgICAgICAgICBpbWFnZTogbnVsbFxuICAgICAgICB9LHtcbiAgICAgICAgICAgIF9pZDogXCIyMDAwXCIsXG4gICAgICAgICAgICBpc19hY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBsYW5ndWFnZV9jb2RlOiAnZW4nLFxuICAgICAgICAgICAgbmFtZTogJ0VuZ2xpc2gnLFxuICAgICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICAgICAgfSx7XG4gICAgICAgICAgICBfaWQ6IFwiMzAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdmcicsXG4gICAgICAgICAgICBuYW1lOiAnRnJhbsOnYWlzJyxcbiAgICAgICAgICAgIGltYWdlOiBudWxsXG4gICAgICAgIH0se1xuICAgICAgICAgICAgX2lkOiBcIjQwMDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICBsYW5ndWFnZV9jb2RlOiAncHQnLFxuICAgICAgICAgICAgbmFtZTogJ1BvcnR1Z3Vlc2UnLFxuICAgICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICAgICAgfSx7XG4gICAgICAgICAgICBfaWQ6IFwiNTAwMFwiLFxuICAgICAgICAgICAgaXNfYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdpdCcsXG4gICAgICAgICAgICBuYW1lOiAnSXRhbGlhbm8nLFxuICAgICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICB9Lyose1xuICAgICAgICAgICAgX2lkOiBcIjYwMDBcIixcbiAgICAgICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGxhbmd1YWdlX2NvZGU6ICdhbCcsXG4gICAgICAgICAgICBuYW1lOiAnRGV1dHNjaCcsXG4gICAgICAgICAgICBpbWFnZTogbnVsbFxuICAgICAgICB9Ki9cbiAgICAgICAgXTtcblxuICAgICAgICBsYW5ndWFnZXMuZm9yRWFjaCgobGFuZ3VhZ2UgOiBMYW5ndWFnZSkgPT4gTGFuZ3VhZ2VzLmluc2VydChsYW5ndWFnZSkpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBQYXJhbWV0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL3BhcmFtZXRlci5tb2RlbCc7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQYXJhbWV0ZXJzKCkge1xuICAgIGlmIChQYXJhbWV0ZXJzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJbXSA9IFtcbiAgICAgICAgICAgIHsgX2lkOiAnMTAwJywgbmFtZTogJ3N0YXJ0X3BheW1lbnRfZGF5JywgdmFsdWU6ICcxJywgZGVzY3JpcHRpb246ICdpbml0aWFsIGRheSBvZiBtb250aCB0byB2YWxpZGF0ZSBjbGllbnQgcGF5bWVudCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjAwJywgbmFtZTogJ2VuZF9wYXltZW50X2RheScsIHZhbHVlOiAnNScsIGRlc2NyaXB0aW9uOiAnZmluYWwgZGF5IG9mIG1vbnRoIHRvIHZhbGlkYXRlIGNsaWVudCBwYXltZW50JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMDAnLCBuYW1lOiAnZnJvbV9lbWFpbCcsIHZhbHVlOiAnY29tZXlnYW5hIDxuby1yZXBseUBjb21leWdhbmEuY29tPicsIGRlc2NyaXB0aW9uOiAnZGVmYXVsdCBmcm9tIGFjY291bnQgZW1haWwgdG8gc2VuZCBtZXNzYWdlcycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAwJywgbmFtZTogJ2ZpcnN0X3BheV9kaXNjb3VudCcsIHZhbHVlOiAnNTAnLCBkZXNjcmlwdGlvbjogJ2Rpc2NvdW50IGluIHBlcmNlbnQgdG8gc2VydmljZSBmaXJzdCBwYXknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwMCcsIG5hbWU6ICdjb2xvbWJpYV90YXhfaXZhJywgdmFsdWU6ICcxOScsIGRlc2NyaXB0aW9uOiAnQ29sb21iaWEgdGF4IGl2YSB0byBtb250aGx5IGNvbWV5Z2FuYSBwYXltZW50JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc2MDAnLCBuYW1lOiAncGF5dV9zY3JpcHRfdGFnJywgdmFsdWU6ICdodHRwczovL21hZi5wYWdvc29ubGluZS5uZXQvd3MvZnAvdGFncy5qcz9pZD0nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3Igc2VjdXJpdHkgc2NyaXB0IGZvciBwYXl1IGZvcm0gaW4gPHNjcmlwdD4gdGFnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc3MDAnLCBuYW1lOiAncGF5dV9ub3NjcmlwdF90YWcnLCB2YWx1ZTogJ2h0dHBzOi8vbWFmLnBhZ29zb25saW5lLm5ldC93cy9mcC90YWdzLmpzP2lkPScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBzZWN1cml0eSBzY3JpcHQgZm9yIHBheXUgZm9ybSBpbiA8bm9zY3JpcHQ+IHRhZycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnODAwJywgbmFtZTogJ3BheXVfc2NyaXB0X2NvZGUnLCB2YWx1ZTogJzgwMjAwJywgZGVzY3JpcHRpb246ICd1cmwgZW5kZWQgY29kZSBmb3Igc2VjdXJpdHkgdGFnIGZvciBwYXl1IGZvcm0gaW4gPHNjcmlwdD4gYW5kIDxub3NjcmlwdD4gdGFnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc5MDAnLCBuYW1lOiAncGF5dV9zY3JpcHRfb2JqZWN0X3RhZycsIHZhbHVlOiAnaHR0cHM6Ly9tYWYucGFnb3NvbmxpbmUubmV0L3dzL2ZwL2ZwLnN3Zj9pZD0nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3Igc2VjdXJpdHkgc2NyaXB0IGZvciBwYXl1IGZvcm0gaW4gPG9iamVjdD4gdGFnJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMDAwJywgbmFtZTogJ3BheXVfcGF5bWVudHNfdXJsX3Rlc3QnLCB2YWx1ZTogJ2h0dHBzOi8vc2FuZGJveC5hcGkucGF5dWxhdGFtLmNvbS9wYXltZW50cy1hcGkvNC4wL3NlcnZpY2UuY2dpJywgZGVzY3JpcHRpb246ICd1cmwgZm9yIGNvbm5lY3QgdGVzdCBwYXl1IHBheW1lbnRzIEFQSScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjAwMCcsIG5hbWU6ICdwYXl1X3JlcG9ydHNfdXJsX3Rlc3QnLCB2YWx1ZTogJ2h0dHBzOi8vc2FuZGJveC5hcGkucGF5dWxhdGFtLmNvbS9yZXBvcnRzLWFwaS80LjAvc2VydmljZS5jZ2knLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgY29ubmVjdCB0ZXN0IHBheXUgcmVwb3J0cyBBUEknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzMwMDAnLCBuYW1lOiAnaXBfcHVibGljX3NlcnZpY2VfdXJsJywgdmFsdWU6ICdodHRwczovL2FwaS5pcGlmeS5vcmc/Zm9ybWF0PWpzb24nLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgcmV0cmlldmUgdGhlIGNsaWVudCBwdWJsaWMgaXAnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzExMDAnLCBuYW1lOiAnY29tcGFueV9uYW1lJywgdmFsdWU6ICdSZWFsYmluZCBTLkEuUycsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgY29tcGFueSBuYW1lIGZvciBpbnZvaWNlJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMTUwJywgbmFtZTogJ2NvbXBhbnlfcGhvbmUnLCB2YWx1ZTogJ1RlbDogKDU3IDEpIDY5NTk1MzcnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIHBob25lJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxMjAwJywgbmFtZTogJ2NvbXBhbnlfYWRkcmVzcycsIHZhbHVlOiAnQ3JhIDYgIyA1OC00MyBPZiAyMDEnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIGNvbXBhbnkgYWRkcmVzcycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTMwMCcsIG5hbWU6ICdjb21wYW55X2NvdW50cnknLCB2YWx1ZTogJ0NvbG9tYmlhJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBjb3VudHJ5IGxvY2F0aW9uJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNDAwJywgbmFtZTogJ2NvbXBhbnlfY2l0eScsIHZhbHVlOiAnQm9nb3TDoScsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgY2l0eSBsb2NhdGlvbicgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTUwMCcsIG5hbWU6ICdjb21wYW55X25pdCcsIHZhbHVlOiAnTklUOiA5MDEuMDM2LjU4NS0wJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBOSVQnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE1MTAnLCBuYW1lOiAnY29tcGFueV9yZWdpbWUnLCB2YWx1ZTogJ1LDqWdpbWVuIGNvbcO6bicsIGRlc2NyaXB0aW9uOiAnUmVhbGJpbmQgcmVnaW1lIGluIENvbG9tYmlhJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNTIwJywgbmFtZTogJ2NvbXBhbnlfY29udHJpYnV0aW9uJywgdmFsdWU6ICdObyBzb21vcyBncmFuZGVzIGNvbnRyaWJ1eWVudGVzJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCBjb250cmlidXRpb24gaW4gQ29sb21iaWEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE1MzAnLCBuYW1lOiAnY29tcGFueV9yZXRhaW5lcicsIHZhbHVlOiAnTm8gc29tb3MgYXV0b3JldGVuZWRvcmVzIHBvciB2ZW50YXMgbmkgc2VydmljaW9zJywgZGVzY3JpcHRpb246ICdSZWFsYmluZCByZXRlbnRpb24gaW4gQ29sb21iaWEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE1NDAnLCBuYW1lOiAnY29tcGFueV9hZ2VudF9yZXRhaW5lcicsIHZhbHVlOiAnTm8gc29tb3MgYWdlbnRlcyByZXRlbmVkb3JlcyBkZSBJVkEgZSBJQ0EnLCBkZXNjcmlwdGlvbjogJ1JlYWxiaW5kIGl2YSBhbmQgaWNhIGFnZW50IHJldGVudGlvbiBpbiBDb2xvbWJpYScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTU1MCcsIG5hbWU6ICdpbnZvaWNlX2dlbmVyYXRlZF9tc2cnLCB2YWx1ZTogJ0ZhY3R1cmEgZW1pdGlkYSBwb3IgY29tcHV0YWRvcicsIGRlc2NyaXB0aW9uOiAnSW52b2ljZSBtZXNzYWdlIGZvciBpbnZvaWNlJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNjAwJywgbmFtZTogJ2l1cmVzdF91cmwnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3LmNvbWV5Z2FuYS5jb20nLCBkZXNjcmlwdGlvbjogJ2NvbWV5Z2FuYSB1cmwgcGFnZScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMTY1MCcsIG5hbWU6ICdpdXJlc3RfdXJsX3Nob3J0JywgdmFsdWU6ICd3d3cuY29tZXlnYW5hLmNvbScsIGRlc2NyaXB0aW9uOiAnY29tZXlnYW5hIHVybCBwYWdlIHNob3J0JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNzAwJywgbmFtZTogJ2ZhY2Vib29rX2xpbmsnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9jb21leWdhbmEvJywgZGVzY3JpcHRpb246ICdmYWNlYm9vayBsaW5rIGZvciBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE4MDAnLCBuYW1lOiAndHdpdHRlcl9saW5rJywgdmFsdWU6ICdodHRwczovL3R3aXR0ZXIuY29tL0NvbWV5Z2FuYUFwcCcsIGRlc2NyaXB0aW9uOiAndHdpdHRlciBsaW5rIGZvciBjb21leWdhbmEnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzE5MDAnLCBuYW1lOiAnaW5zdGFncmFtX2xpbmsnLCB2YWx1ZTogJ2h0dHBzOi8vd3d3Lmluc3RhZ3JhbS5jb20vY29tZXlnYW5hJywgZGVzY3JpcHRpb246ICdpbnN0YWdyYW0gbGluayBmb3IgY29tZXlnYW5hJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcxNjEwJywgbmFtZTogJ2l1cmVzdF9pbWdfdXJsJywgdmFsdWU6ICcgaHR0cHM6Ly9hcHAuY29tZXlnYW5hLmNvbS9pbWFnZXMvJywgZGVzY3JpcHRpb246ICdjb21leWdhbmEgaW1hZ2VzIHVybCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzEwMCcsIG5hbWU6ICdpcF9wdWJsaWNfc2VydmljZV91cmwyJywgdmFsdWU6ICdodHRwczovL2lwaW5mby5pby9qc29uJywgZGVzY3JpcHRpb246ICd1cmwgZm9yIHJldHJpZXZlIHRoZSBjbGllbnQgcHVibGljIGlwICMyJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICczMjAwJywgbmFtZTogJ2lwX3B1YmxpY19zZXJ2aWNlX3VybDMnLCB2YWx1ZTogJ2h0dHBzOi8vaWZjb25maWcuY28vanNvbicsIGRlc2NyaXB0aW9uOiAndXJsIGZvciByZXRyaWV2ZSB0aGUgY2xpZW50IHB1YmxpYyBpcCAjMycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnOTAwMCcsIG5hbWU6ICdwYXl1X2lzX3Byb2QnLCB2YWx1ZTogJ3RydWUnLCBkZXNjcmlwdGlvbjogJ0ZsYWcgdG8gZW5hYmxlIHRvIHByb2QgcGF5dSBwYXltZW50JyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc5MTAwJywgbmFtZTogJ3BheXVfdGVzdF9zdGF0ZScsIHZhbHVlOiAnQVBQUk9WRUQnLCBkZXNjcmlwdGlvbjogJ1Rlc3Qgc3RhdGUgZm9yIHBheXUgcGF5bWVudCB0cmFuc2FjdGlvbicgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnOTIwMCcsIG5hbWU6ICdwYXl1X3JlZmVyZW5jZV9jb2RlJywgdmFsdWU6ICdDWUdfUF8nLCBkZXNjcmlwdGlvbjogJ1ByZWZpeCBmb3IgcmVmZXJlbmNlIGNvZGUgb24gcGF5dSB0cmFuc2FjdGlvbnMnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIxMDAnLCBuYW1lOiAnbWF4X3VzZXJfcGVuYWx0aWVzJywgdmFsdWU6ICczJywgZGVzY3JpcHRpb246ICdNYXggbnVtYmVyIG9mIHVzZXIgcGVuYWx0aWVzJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMjAwJywgbmFtZTogJ3BlbmFsdHlfZGF5cycsIHZhbHVlOiAnMzAnLCBkZXNjcmlwdGlvbjogJ1VzZXIgcGVuYWx0eSBkYXlzJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICc4MDAwJywgbmFtZTogJ2RhdGVfdGVzdF9tb250aGx5X3BheScsIHZhbHVlOiAnTWFyY2ggNSwgMjAxOCcsIGRlc2NyaXB0aW9uOiAnRGF0ZSB0ZXN0IGZvciBtb250aGx5IHBheW1lbnQgb2YgY29tZXlnYW5hIHNlcnZpY2UnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzEwMDAwJywgbmFtZTogJ3BheXVfcGF5bWVudHNfdXJsX3Byb2QnLCB2YWx1ZTogJ2h0dHBzOi8vYXBpLnBheXVsYXRhbS5jb20vcGF5bWVudHMtYXBpLzQuMC9zZXJ2aWNlLmNnaScsIGRlc2NyaXB0aW9uOiAndXJsIGZvciBjb25uZWN0IHByb2QgcGF5dSBwYXltZW50cyBBUEknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzIwMDAwJywgbmFtZTogJ3BheXVfcmVwb3J0c191cmxfcHJvZCcsIHZhbHVlOiAnaHR0cHM6Ly9hcGkucGF5dWxhdGFtLmNvbS9yZXBvcnRzLWFwaS80LjAvc2VydmljZS5jZ2knLCBkZXNjcmlwdGlvbjogJ3VybCBmb3IgY29ubmVjdCBwcm9kIHBheXUgcmVwb3J0cyBBUEknIH0sXG4gICAgICAgICAgICB7IF9pZDogJzg1MDAnLCBuYW1lOiAnZGF0ZV90ZXN0X3JlYWN0aXZhdGUnLCB2YWx1ZTogJ0phbnVhcnkgNiwgMjAxOCcsIGRlc2NyaXB0aW9uOiAnRGF0ZSB0ZXN0IGZvciByZWFjdGl2YXRlIHJlc3RhdXJhbnQgZm9yIHBheScgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAwMDAnLCBuYW1lOiAndGVybXNfdXJsJywgdmFsdWU6ICdodHRwczovL3d3dy5jb21leWdhbmEuY29tLycsIGRlc2NyaXB0aW9uOiAndXJsIHRvIHNlZSB0ZXJtcyBhbmQgY29uZGl0aW9ucycgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNDAwMDAnLCBuYW1lOiAncG9saWN5X3VybCcsIHZhbHVlOiAnaHR0cHM6Ly93d3cuY29tZXlnYW5hLmNvbS8nLCBkZXNjcmlwdGlvbjogJ3VybCB0byBzZWUgcHJpdmFjeSBwb2xpY3knIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwMDAwJywgbmFtZTogJ1FSX2NvZGVfdXJsJywgdmFsdWU6ICdodHRwczovL3d3dy5jb21leWdhbmEuY29tL2dhbmEtcG9yLWNvbWVyJywgZGVzY3JpcHRpb246ICdUaGlzIHVybCByZWRpcmVjdCB0byBwYWdlIHRoZSBjb21leWdhbmEvZG93bmxvYWQgd2hlbiBzY2FubmVkIFFSIGNvZGUgZnJvbSBvdGhlciBhcHBsaWNhdGlvbicgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMjMwMCcsIG5hbWU6ICd1c2VyX3N0YXJ0X3BvaW50cycsIHZhbHVlOiAnMScsIGRlc2NyaXB0aW9uOiAnVXNlciBzdGFydCBwb2ludHMnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzUwMDAnLCBuYW1lOiAnbWF4X21lZGFsc190b19hZHZpY2UnLCB2YWx1ZTogJzUwJywgZGVzY3JpcHRpb246ICdNYXggbWVkYWxzIHRvIGV2YWx1YXRlIG9uIGNyb24gdG8gc2VuZCBlbWFpbCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnNTUwMCcsIG5hbWU6ICdtYXhfZGF5c190b19hZHZpY2UnLCB2YWx1ZTogJzInLCBkZXNjcmlwdGlvbjogJ01heCBkYXkgdG8gYWR2aWNlIHBlbmRpbmcgbWVkYWxzJyB9XG4gICAgICAgIF07XG4gICAgICAgIHBhcmFtZXRlcnMuZm9yRWFjaCgocGFyYW1ldGVyOiBQYXJhbWV0ZXIpID0+IFBhcmFtZXRlcnMuaW5zZXJ0KHBhcmFtZXRlcikpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBQYXltZW50TWV0aG9kIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZ2VuZXJhbC9wYXltZW50TWV0aG9kLm1vZGVsJztcbmltcG9ydCB7IFBheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BheW1lbnRNZXRob2QuY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkUGF5bWVudE1ldGhvZHMoKXtcbiAgICBpZiggUGF5bWVudE1ldGhvZHMuZmluZCgpLmN1cnNvci5jb3VudCgpID09PSAwICl7XG4gICAgICAgIGNvbnN0IHBheW1lbnRzOiBQYXltZW50TWV0aG9kW10gPSBbXG4gICAgICAgICAgICB7IF9pZDogXCIxMFwiLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ1BBWU1FTlRfTUVUSE9EUy5DQVNIJyB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjBcIiwgaXNBY3RpdmU6IHRydWUsIG5hbWU6ICdQQVlNRU5UX01FVEhPRFMuQ1JFRElUX0NBUkQnIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMFwiLCBpc0FjdGl2ZTogdHJ1ZSwgbmFtZTogJ1BBWU1FTlRfTUVUSE9EUy5ERUJJVF9DQVJEJyB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiNDBcIiwgaXNBY3RpdmU6IGZhbHNlLCBuYW1lOiAnUEFZTUVOVF9NRVRIT0RTLk9OTElORScgfSxcbiAgICAgICAgXTtcbiAgICAgICAgcGF5bWVudHMuZm9yRWFjaCggKCBwYXk6UGF5bWVudE1ldGhvZCApID0+IFBheW1lbnRNZXRob2RzLmluc2VydCggcGF5ICkgKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL3BvaW50Lm1vZGVsJztcbmltcG9ydCB7IFBvaW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wb2ludC5jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQb2ludHMoKSB7XG4gICAgaWYoUG9pbnRzLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCApe1xuICAgICAgICBjb25zdCBwb2ludHM6IFBvaW50W10gPSBbXG4gICAgICAgICAgICB7IF9pZDogXCIxXCIsIHBvaW50OiAxIH0sIFxuICAgICAgICAgICAgeyBfaWQ6IFwiMlwiLCBwb2ludDogMiB9LCBcbiAgICAgICAgICAgIHsgX2lkOiBcIjNcIiwgcG9pbnQ6IDMgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjRcIiwgcG9pbnQ6IDQgfSwgXG4gICAgICAgICAgICB7IF9pZDogXCI1XCIsIHBvaW50OiA1IH0sIFxuICAgICAgICAgICAgeyBfaWQ6IFwiNlwiLCBwb2ludDogNiB9LCBcbiAgICAgICAgICAgIHsgX2lkOiBcIjdcIiwgcG9pbnQ6IDcgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjhcIiwgcG9pbnQ6IDggfSwgXG4gICAgICAgICAgICB7IF9pZDogXCI5XCIsIHBvaW50OiA5IH0sIFxuICAgICAgICAgICAgeyBfaWQ6IFwiMTBcIiwgcG9pbnQ6IDEwIH1cbiAgICAgICAgXTtcbiAgICAgICAgcG9pbnRzLmZvckVhY2goKHBvaW50OlBvaW50KSA9PiBQb2ludHMuaW5zZXJ0KHBvaW50KSk7XG4gICAgfVxufSIsImltcG9ydCB7IFR5cGVPZkZvb2QgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5tb2RlbCc7XG5pbXBvcnQgeyBUeXBlc09mRm9vZCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC90eXBlLW9mLWZvb2QuY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkVHlwZXNPZkZvb2QoKSB7XG4gICAgaWYgKFR5cGVzT2ZGb29kLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBjb25zdCB0eXBlczogVHlwZU9mRm9vZFtdID0gW1xuICAgICAgICAgICAgeyBfaWQ6IFwiMTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5HRVJNQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkFNRVJJQ0FOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5BUkFCSUNfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCI0MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkFSR0VOVElORV9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjUwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQVNJQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCI2MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkJSQVpJTElBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjcwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuSE9NRU1BREVfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCI4MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkNISUxFQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCI5MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkNISU5FU0VfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxMDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5DT0xPTUJJQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxMTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5DT1JFQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxMjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5NSURETEVfRUFTVEVSTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjEzMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlNQQU5JU0hfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxNDBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5GUkVOQ0hfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxNTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5GVVNJT05fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxNjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5HT1VSTUVUX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMTcwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuR1JFRUtfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxODBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5JTkRJQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIxOTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5JTlRFUk5BVElPTkFMX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjAwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuSVRBTElBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjIxMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkpBUEFORVNFX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjIwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuTEFUSU5fQU1FUklDQU5fRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyMzBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5NRURJVEVSUkFORUFOX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjQwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuTUVYSUNBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjI1MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELk9SR0FOSUNfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyNjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5QRVJVVklBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjI3MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELkZBU1RfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIyODBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5USEFJX0ZPT0RcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMjkwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuVkVHRVRBUklBTl9GT09EXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjMwMFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlZJRVROQU1FU0VfRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzMTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5PVEhFUlNcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzIwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuQkFSQkVDVUVcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzMwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuUEFTVEFcIiB9LFxuICAgICAgICAgICAgeyBfaWQ6IFwiMzQwXCIsIHR5cGVfb2ZfZm9vZDogXCJUWVBFX09GX0ZPT0QuRklTSF9BTkRfU0VBRk9PRFwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzNTBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5QSVpaQVwiIH0sXG4gICAgICAgICAgICB7IF9pZDogXCIzNjBcIiwgdHlwZV9vZl9mb29kOiBcIlRZUEVfT0ZfRk9PRC5TQU5EV0lDSEVTXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjM3MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlNVU0hJXCIgfSxcbiAgICAgICAgICAgIHsgX2lkOiBcIjM4MFwiLCB0eXBlX29mX2Zvb2Q6IFwiVFlQRV9PRl9GT09ELlZFR0FOSVNNXCIgfVxuICAgICAgICBdO1xuICAgICAgICB0eXBlcy5mb3JFYWNoKCh0eXBlOiBUeXBlT2ZGb29kKSA9PiB7IFR5cGVzT2ZGb29kLmluc2VydCh0eXBlKSB9KTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ2NQYXltZW50TWV0aG9kIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZC5tb2RlbCc7XG5pbXBvcnQgeyBDY1BheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2NjLXBheW1lbnQtbWV0aG9kcy5jb2xsZWN0aW9uJ1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZENjUGF5bWVudE1ldGhvZHMoKSB7XG4gICAgaWYgKENjUGF5bWVudE1ldGhvZHMuZmluZCgpLmN1cnNvci5jb3VudCgpID09IDApIHtcbiAgICAgICAgY29uc3QgY2NQYXltZW50TWV0aG9kczogQ2NQYXltZW50TWV0aG9kW10gPSBbXG4gICAgICAgICAgICB7IF9pZDogJzEwJywgaXNfYWN0aXZlOiB0cnVlLCBuYW1lOiAnVmlzYScsIHBheXVfY29kZTogJ1ZJU0EnLCBsb2dvX25hbWU6ICd2aXNhJyB9LFxuICAgICAgICAgICAgeyBfaWQ6ICcyMCcsIGlzX2FjdGl2ZTogdHJ1ZSwgbmFtZTogJ01hc3RlcmNhcmQnLCBwYXl1X2NvZGU6ICdNQVNURVJDQVJEJywgbG9nb19uYW1lOiAnbWFzdGVyY2FyZCcgfSxcbiAgICAgICAgICAgIHsgX2lkOiAnMzAnLCBpc19hY3RpdmU6IHRydWUsIG5hbWU6ICdBbWVyaWNhbiBFeHByZXNzJywgcGF5dV9jb2RlOiAnQU1FWCcsIGxvZ29fbmFtZTogJ2FtZXgnIH0sXG4gICAgICAgICAgICB7IF9pZDogJzQwJywgaXNfYWN0aXZlOiB0cnVlLCBuYW1lOiAnRGluZXJzIENsdWInLCBwYXl1X2NvZGU6ICdESU5FUlMnLCBsb2dvX25hbWU6ICdkaW5lcnMnIH1cbiAgICAgICAgXTtcbiAgICAgICAgY2NQYXltZW50TWV0aG9kcy5mb3JFYWNoKChjY1BheW1lbnRNZXRob2Q6IENjUGF5bWVudE1ldGhvZCkgPT4geyBDY1BheW1lbnRNZXRob2RzLmluc2VydChjY1BheW1lbnRNZXRob2QpIH0pO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBJbnZvaWNlSW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL3BheW1lbnQvaW52b2ljZS1pbmZvLm1vZGVsJztcbmltcG9ydCB7IEludm9pY2VzSW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEludm9pY2VzSW5mbygpIHtcbiAgICBpZiAoSW52b2ljZXNJbmZvLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PSAwKSB7XG4gICAgICAgIGNvbnN0IGludm9pY2VzSW5mbzogSW52b2ljZUluZm9bXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICcxMDAnLFxuICAgICAgICAgICAgICAgIGNvdW50cnlfaWQ6ICcxOTAwJyxcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uX29uZTogJzMxMDAwMDA4OTUwOScsXG4gICAgICAgICAgICAgICAgcHJlZml4X29uZTogJ0k0VCcsXG4gICAgICAgICAgICAgICAgc3RhcnRfZGF0ZV9vbmU6IG5ldyBEYXRlKCcyMDE3LTA4LTMxVDAwOjAwOjAwLjAwWicpLFxuICAgICAgICAgICAgICAgIGVuZF9kYXRlX29uZTogbmV3IERhdGUoJzIwMTctMTAtMzFUMDA6MDA6MDAuMDBaJyksXG4gICAgICAgICAgICAgICAgc3RhcnRfdmFsdWVfb25lOiA0MjIwMDAsXG4gICAgICAgICAgICAgICAgZW5kX3ZhbHVlX29uZTogMTAwMDAwMCxcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uX3R3bzogbnVsbCxcbiAgICAgICAgICAgICAgICBwcmVmaXhfdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJ0X2RhdGVfdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIGVuZF9kYXRlX3R3bzogbnVsbCxcbiAgICAgICAgICAgICAgICBzdGFydF92YWx1ZV90d286IG51bGwsXG4gICAgICAgICAgICAgICAgZW5kX3ZhbHVlX3R3bzogbnVsbCxcbiAgICAgICAgICAgICAgICBlbmFibGVfdHdvOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50X3ZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJ0X25ld192YWx1ZTogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGludm9pY2VzSW5mby5mb3JFYWNoKChpbnZvaWNlSW5mbzogSW52b2ljZUluZm8pID0+IEludm9pY2VzSW5mby5pbnNlcnQoaW52b2ljZUluZm8pKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQmFnUGxhbiwgUHJpY2VQb2ludHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9wb2ludHMvYmFnLXBsYW4ubW9kZWwnO1xuaW1wb3J0IHsgQmFnUGxhbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9iYWctcGxhbnMuY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQmFnUGxhbnMoKSB7XG4gICAgaWYgKEJhZ1BsYW5zLmZpbmQoKS5jdXJzb3IuY291bnQoKSA9PSAwKSB7XG4gICAgICAgIGNvbnN0IGJhZ1BsYW5zOiBCYWdQbGFuW10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiAnMTAwJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZnJlZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdCQUdfUExBTi5GUkVFJyxcbiAgICAgICAgICAgICAgICBwcmljZTogW3tcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeV9pZDogXCIxOTAwXCIsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiAwLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeTogJ0NPUCdcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICB2YWx1ZV9wb2ludHM6IDM1LFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiAnMjAwJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc21hbGwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnQkFHX1BMQU4uU01BTEwnLFxuICAgICAgICAgICAgICAgIHByaWNlOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5X2lkOiBcIjE5MDBcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IDQ1OTAwLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeTogJ0NPUCdcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICB2YWx1ZV9wb2ludHM6IDUwLFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiAnMzAwJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnbWVkaXVtJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0JBR19QTEFOLk1FRElVTScsXG4gICAgICAgICAgICAgICAgcHJpY2U6IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50cnlfaWQ6IFwiMTkwMFwiLFxuICAgICAgICAgICAgICAgICAgICBwcmljZTogNTA5MDAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5OiAnQ09QJ1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHZhbHVlX3BvaW50czogODAsXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfaWQ6ICc0MDAnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdsYXJnZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdCQUdfUExBTi5MQVJHRScsXG4gICAgICAgICAgICAgICAgcHJpY2U6IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50cnlfaWQ6IFwiMTkwMFwiLFxuICAgICAgICAgICAgICAgICAgICBwcmljZTogNTQ5MDAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5OiAnQ09QJ1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHZhbHVlX3BvaW50czogMTAwLFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICBiYWdQbGFucy5mb3JFYWNoKChiYWdQbGFuOiBCYWdQbGFuKSA9PiBCYWdQbGFucy5pbnNlcnQoYmFnUGxhbikpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBNZW51cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC9tZW51LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUm9sZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvcm9sZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEhvdXJzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2hvdXJzLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ3VycmVuY2llcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jdXJyZW5jeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BheW1lbnRNZXRob2QuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IExhbmd1YWdlcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9sYW5ndWFnZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVtYWlsQ29udGVudHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvZW1haWwtY29udGVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBhcmFtZXRlcnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGFyYW1ldGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ2NQYXltZW50TWV0aG9kcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZHMuY29sbGVjdGlvbidcbmltcG9ydCB7IFBvaW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9wb2ludC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFR5cGVzT2ZGb29kIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEJhZ1BsYW5zIH0gZnJvbSBcIi4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2JhZy1wbGFucy5jb2xsZWN0aW9uXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVGaXh0dXJlcygpIHtcbiAgICAvKipcbiAgICAgKiBSZW1vdmUgTWVudXMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIE1lbnVzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgUm9sZXMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIFJvbGVzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgSG91cnMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIEhvdXJzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgQ3VycmVuY2llcyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgQ3VycmVuY2llcy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIFBheW1lbnRNZXRob2RzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBQYXltZW50TWV0aG9kcy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIENvdW50cmllcyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgQ291bnRyaWVzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgTGFuZ3VhZ2VzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBMYW5ndWFnZXMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBFbWFpbENvbnRlbnRzIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBFbWFpbENvbnRlbnRzLnJlbW92ZSh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgUGFyYW1ldGVycyBDb2xsZWN0aW9uXG4gICAgICovXG4gICAgUGFyYW1ldGVycy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIENjUGF5bWVudE1ldGhvZHMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIENjUGF5bWVudE1ldGhvZHMucmVtb3ZlKHt9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBQb2ludHMgQ29sbGVjdGlvblxuICAgICAqL1xuICAgIFBvaW50cy5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIFR5cGVzT2ZGb29kIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBUeXBlc09mRm9vZC5yZW1vdmUoe30pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIEJhZ1BsYW5zIENvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBCYWdQbGFucy5yZW1vdmUoe30pO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2F1dGgvdXNlci5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5cblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJzRGV0YWlsc0ZvckVzdGFibGlzaG1lbnQnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRfd29yazogc3RyaW5nKSB7XG4gICAgaWYgKF9lc3RhYmxpc2htZW50X3dvcmspIHtcbiAgICAgICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyBlc3RhYmxpc2htZW50X3dvcms6IF9lc3RhYmxpc2htZW50X3dvcmsgfSk7XG4gICAgfVxufSk7XG5cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudF93b3JrOiBzdHJpbmcpIHtcbiAgICBpZiAoX2VzdGFibGlzaG1lbnRfd29yaykge1xuICAgICAgICBsZXQgX2xVc2VyRGV0YWlsczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgY2hlY2soX2VzdGFibGlzaG1lbnRfd29yaywgU3RyaW5nKTtcblxuICAgICAgICBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmQoeyBlc3RhYmxpc2htZW50X3dvcms6IF9lc3RhYmxpc2htZW50X3dvcmsgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxVc2VyRGV0YWlsPih1c2RldCwgaW5kZXgsIGFycikge1xuICAgICAgICAgICAgX2xVc2VyRGV0YWlscy5wdXNoKHVzZGV0LnVzZXJfaWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFVzZXJzLmZpbmQoeyBfaWQ6IHsgJGluOiBfbFVzZXJEZXRhaWxzIH0gfSk7XG4gICAgfVxufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUm9sZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvcm9sZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IE1lbnVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL21lbnUuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLm1vZGVsJztcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldE1lbnVzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBNZW51cy5maW5kKHt9LCB7IHNvcnQ6IHsgb3JkZXI6IDEgfSB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVXNlcnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXIubW9kZWwnO1xuaW1wb3J0IHsgUm9sZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvcm9sZS5jb2xsZWN0aW9uJztcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFJvbGVDb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUm9sZXMuZmluZCh7fSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFJvbGVDb2xsYWJvcmF0b3JzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSb2xlcy5maW5kKHtfaWQ6IHsgJGluOiBbIFwiNjAwXCIgXSB9fSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJzRGV0YWlscycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVXNlckRldGFpbHMuZmluZCh7fSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJEZXRhaWxzQnlVc2VyJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFVzZXJEZXRhaWxzLmZpbmQoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xufSk7XG5cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VyRGV0YWlsc0J5Q3VycmVudFRhYmxlJywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZywgX3RhYmxlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHsgY3VycmVudF9lc3RhYmxpc2htZW50OiBfZXN0YWJsaXNobWVudElkLCBjdXJyZW50X3RhYmxlOiBfdGFibGVJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdXNlcnMgYnkgZXN0YWJsaXNobWVudHMgSWRcbiAqIEBwYXJhbSB7c3RyaW5nW119IF9wRXN0YWJsaXNobWVudHNJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnNCeUVzdGFibGlzaG1lbnRzSWQnLCBmdW5jdGlvbiAoX3BFc3RhYmxpc2htZW50c0lkOiBTdHJpbmdbXSkge1xuICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHsgY3VycmVudF9lc3RhYmxpc2htZW50OiB7ICRpbjogX3BFc3RhYmxpc2htZW50c0lkIH0gfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIHVzZXJzIGRldGFpbHMgYnkgYWRtaW4gdXNlclxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlckRldGFpbHNCeUFkbWluVXNlcicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIGxldCBfbEVzdGFibGlzaG1lbnRzSWQ6IHN0cmluZ1tdID0gW107XG4gICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KS5mZXRjaCgpLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcnIpIHtcbiAgICAgICAgX2xFc3RhYmxpc2htZW50c0lkLnB1c2goZXN0YWJsaXNobWVudC5faWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHsgY3VycmVudF9lc3RhYmxpc2htZW50OiB7ICRpbjogX2xFc3RhYmxpc2htZW50c0lkIH0gfSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFVzZXJEZXRhaWxzQnlFc3RhYmxpc2htZW50V29yaycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIGxldCBfbFVzZXJEZXRhaWw6IFVzZXJEZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcbiAgICBpZiAoX2xVc2VyRGV0YWlsKSB7XG4gICAgICAgIHJldHVybiBVc2VyRGV0YWlscy5maW5kKHsgY3VycmVudF9lc3RhYmxpc2htZW50OiBfbFVzZXJEZXRhaWwuZXN0YWJsaXNobWVudF93b3JrIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGVzdGFibGlzaG1lbnQgY29sbGFib3JhdG9yc1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnNDb2xsYWJvcmF0b3JzQnlFc3RhYmxpc2htZW50c0lkJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gVXNlckRldGFpbHMuZmluZCh7IGVzdGFibGlzaG1lbnRfd29yazogeyAkaW46IF9wRXN0YWJsaXNobWVudHNJZCB9IH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VycyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VyU2V0dGluZ3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFVzZXJzLmZpbmQoeyBfaWQ6IHRoaXMudXNlcklkIH0sIHsgZmllbGRzOiB7IHVzZXJuYW1lOiAxLCBcInNlcnZpY2VzLnByb2ZpbGUubmFtZVwiOiAxLCBcInNlcnZpY2VzLmZhY2Vib29rXCI6IDEsIFwic2VydmljZXMudHdpdHRlclwiOiAxLCBcInNlcnZpY2VzLmdvb2dsZVwiOiAxIH0gfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGlzaCwgZ2V0IGFsbCB1c2Vyc1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFVzZXJzLmZpbmQoe30pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1Ymxpc2guIEdldCB1c2VyIGJ5IElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2VyQnlVc2VySWQnLCBmdW5jdGlvbiAoX3VzcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogX3VzcklkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB1c2VycyB3aXRoIGVzdGFibGlzaG1lbnQgYW5kIHRhYmxlIElkIGNvbmRpdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBfcEVzdGFibGlzaG1lbnRJZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wVGFibGVJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlckJ5VGFibGVJZCcsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRJZDogc3RyaW5nLCBfcFRhYmxlSWQpIHtcbiAgICBjaGVjayhfcEVzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICBjaGVjayhfcFRhYmxlSWQsIFN0cmluZyk7XG4gICAgbGV0IF9sVXNlcnM6IHN0cmluZ1tdID0gW107XG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5maW5kKHsgY3VycmVudF9lc3RhYmxpc2htZW50OiBfcEVzdGFibGlzaG1lbnRJZCwgY3VycmVudF90YWJsZTogX3BUYWJsZUlkIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8VXNlckRldGFpbD4odXNlciwgaW5kZXgsIGFycikge1xuICAgICAgICBfbFVzZXJzLnB1c2godXNlci51c2VyX2lkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogeyAkaW46IF9sVXNlcnMgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdXNlcnMgYnkgYWRtaW4gdXNlciBJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0VXNlcnNCeUFkbWluVXNlcicsIGZ1bmN0aW9uIChfcFVzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3BVc2VySWQsIFN0cmluZyk7XG4gICAgbGV0IF9sRXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgX2xVc2Vyczogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfcFVzZXJJZCB9KS5mZXRjaCgpLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcnIpIHtcbiAgICAgICAgX2xFc3RhYmxpc2htZW50c0lkLnB1c2goZXN0YWJsaXNobWVudC5faWQpO1xuICAgIH0pO1xuICAgIFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uZmluZCh7IGN1cnJlbnRfZXN0YWJsaXNobWVudDogeyAkaW46IF9sRXN0YWJsaXNobWVudHNJZCB9IH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8VXNlckRldGFpbD4odXNlckRldGFpbCwgaW5kZXgsIGFycikge1xuICAgICAgICBfbFVzZXJzLnB1c2godXNlckRldGFpbC51c2VyX2lkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogeyAkaW46IF9sVXNlcnMgfSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdXNlcnMgd2l0aCBlc3RhYmxpc2htZW50IGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF9wRXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRVc2Vyc0J5RXN0YWJsaXNobWVudElkJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfcEVzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICBsZXQgX2xVc2Vyczogc3RyaW5nW10gPSBbXTtcbiAgICBVc2VyRGV0YWlscy5jb2xsZWN0aW9uLmZpbmQoeyBjdXJyZW50X2VzdGFibGlzaG1lbnQ6IF9wRXN0YWJsaXNobWVudElkIH0pLmZldGNoKCkuZm9yRWFjaChmdW5jdGlvbiA8VXNlckRldGFpbD4odXNlciwgaW5kZXgsIGFycikge1xuICAgICAgICBfbFVzZXJzLnB1c2godXNlci51c2VyX2lkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gVXNlcnMuZmluZCh7IF9pZDogeyAkaW46IF9sVXNlcnMgfSB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFFScyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LXFyLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBnZXRFc3RhYmxpc2htZW50UVJzQnlBZG1pbiB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudFFSc0J5QWRtaW4nLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudFFScy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMsIEVzdGFibGlzaG1lbnRzUHJvZmlsZSB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2F1dGgvdXNlci1kZXRhaWwuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBVc2VyRGV0YWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvYXV0aC91c2VyLWRldGFpbC5tb2RlbCc7XG5pbXBvcnQgeyBQYXltZW50c0hpc3RvcnkgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5tb2RlbCc7XG5pbXBvcnQgeyBQYXltZW50SGlzdG9yeSB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5Lm1vZGVsJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gZXN0YWJsaXNobWVudHMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2VzdGFibGlzaG1lbnRzJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9ucyBlc3RhYmxpc2htZW50QnlFc3RhYmxpc2htZW50V29ya1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudEJ5RXN0YWJsaXNobWVudFdvcmsnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICB2YXIgdXNlcl9kZXRhaWwgPSBVc2VyRGV0YWlscy5maW5kT25lKHsgdXNlcl9pZDogX3VzZXJJZCB9KTtcbiAgICBpZiAodXNlcl9kZXRhaWwpIHtcbiAgICAgICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzLmZpbmQoeyBfaWQ6IHVzZXJfZGV0YWlsLmVzdGFibGlzaG1lbnRfd29yayB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgfVxufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHRvIGZpbmQgY3VycmVudCBlc3RhYmxpc2htZW50cyB3aXRoIG5vIHBheVxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2N1cnJlbnRFc3RhYmxpc2htZW50c05vUGF5ZWQnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcblxuICAgIGxldCBjdXJyZW50RGF0ZTogRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGN1cnJlbnRNb250aDogc3RyaW5nID0gKGN1cnJlbnREYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xuICAgIGxldCBjdXJyZW50WWVhcjogc3RyaW5nID0gY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xuICAgIGxldCBoaXN0b3J5UGF5bWVudFJlczogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgZXN0YWJsaXNobWVudHNJbml0aWFsOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCwgaXNBY3RpdmU6IHRydWUsIGZyZWVEYXlzOiBmYWxzZSB9KS5mZXRjaCgpLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcnIpIHtcbiAgICAgICAgZXN0YWJsaXNobWVudHNJbml0aWFsLnB1c2goZXN0YWJsaXNobWVudC5faWQpO1xuICAgIH0pO1xuXG4gICAgUGF5bWVudHNIaXN0b3J5LmNvbGxlY3Rpb24uZmluZCh7XG4gICAgICAgIGVzdGFibGlzaG1lbnRJZHM6IHtcbiAgICAgICAgICAgICRpbjogZXN0YWJsaXNobWVudHNJbml0aWFsXG4gICAgICAgIH0sIG1vbnRoOiBjdXJyZW50TW9udGgsIHllYXI6IGN1cnJlbnRZZWFyLCAkb3I6IFt7IHN0YXR1czogJ1RSQU5TQUNUSU9OX1NUQVRVUy5BUFBST1ZFRCcgfSwgeyBzdGF0dXM6ICdUUkFOU0FDVElPTl9TVEFUVVMuUEVORElORycgfV1cbiAgICB9KS5mZXRjaCgpLmZvckVhY2goZnVuY3Rpb24gPFBheW1lbnRIaXN0b3J5PihoaXN0b3J5UGF5bWVudCwgaW5kZXgsIGFycikge1xuICAgICAgICBoaXN0b3J5UGF5bWVudC5lc3RhYmxpc2htZW50X2lkcy5mb3JFYWNoKChlc3RhYmxpc2htZW50KSA9PiB7XG4gICAgICAgICAgICBoaXN0b3J5UGF5bWVudFJlcy5wdXNoKGVzdGFibGlzaG1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHsgX2lkOiB7ICRuaW46IGhpc3RvcnlQYXltZW50UmVzIH0sIGNyZWF0aW9uX3VzZXI6IF91c2VySWQsIGlzQWN0aXZlOiB0cnVlLCBmcmVlRGF5czogZmFsc2UgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gdG8gZmluZCBpbmFjdGl2ZSBlc3RhYmxpc2htZW50cyBieSB1c2VyXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRJbmFjdGl2ZUVzdGFibGlzaG1lbnRzJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkLCBpc0FjdGl2ZTogZmFsc2UgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGFjdGl2ZSBlc3RhYmxpc2htZW50cyBieSB1c2VyXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0QWN0aXZlRXN0YWJsaXNobWVudHMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQsIGlzQWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBlc3RhYmxpc2htZW50cyBieSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRCeUlkJywgZnVuY3Rpb24gKF9wSWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wSWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEVzdGFibGlzaG1lbnRzLmZpbmQoeyBfaWQ6IF9wSWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGVzdGFibGlzaG1lbnQgcHJvZmlsZSBieSBlc3RhYmxpc2htZW50IGlkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50UHJvZmlsZScsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50c1Byb2ZpbGUuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50SWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGVzdGFibGlzaG1lbnRzIGJ5IGlkc1xuICogQHBhcmFtIHtzdHJpbmdbXX0gX3BJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudHNCeUlkcycsIGZ1bmN0aW9uIChfcElkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7IF9pZDogeyAkaW46IF9wSWRzIH0gfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGVzdGFibGlzaG1lbnRzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50cycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudHMuZmluZCh7fSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IFJld2FyZFBvaW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9yZXdhcmQtcG9pbnQubW9kZWwnO1xuaW1wb3J0IHsgUmV3YXJkUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3Jld2FyZC1wb2ludC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIHVzZXIgcmV3YXJkIHBvaW50c1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VyX2lkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRSZXdhcmRQb2ludHNCeVVzZXJJZCcsIGZ1bmN0aW9uIChfdXNlcl9pZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJfaWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFJld2FyZFBvaW50cy5maW5kKHsgaWRfdXNlcjogX3VzZXJfaWQgfSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJld2FyZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgSXRlbXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvaXRlbS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXdhcmRzIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFJld2FyZHMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gUmV3YXJkcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gcmV3YXJkcyBieSBlc3RhYmxpc2htZW50IElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50UmV3YXJkcycsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIHJldHVybiBSZXdhcmRzLmZpbmQoeyBlc3RhYmxpc2htZW50czogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb25zIGdldFJld2FyZHNCeUVzdGFibGlzaG1lbnRXb3JrXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5cbk1ldGVvci5wdWJsaXNoKCdnZXRSZXdhcmRzQnlFc3RhYmxpc2htZW50V29yaycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHZhciB1c2VyX2RldGFpbCA9IFVzZXJEZXRhaWxzLmZpbmRPbmUoeyB1c2VyX2lkOiBfdXNlcklkIH0pO1xuICAgIGlmICh1c2VyX2RldGFpbCkge1xuICAgICAgICByZXR1cm4gUmV3YXJkcy5maW5kKHsgZXN0YWJsaXNobWVudHM6IHsgJGluOiBbdXNlcl9kZXRhaWwuZXN0YWJsaXNobWVudF93b3JrXSB9IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gdG8gcmV0dXJuIHRoZSByZXdhcmRzIFxuICovXG5NZXRlb3JbXCJwdWJsaXNoQ29tcG9zaXRlXCJdKCdnZXRSZXdhcmRzVG9JdGVtcycsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuXG4gICAgaWYgKF9lc3RhYmxpc2htZW50SWQgIT09IG51bGwgfHwgX2VzdGFibGlzaG1lbnRJZCAhPT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbmQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyAnZXN0YWJsaXNobWVudHMuZXN0YWJsaXNobWVudF9pZCc6IHsgJGluOiBbX2VzdGFibGlzaG1lbnRJZF0gfSB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICAgICAgICBmaW5kKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJld2FyZHMuZmluZCh7IGl0ZW1faWQ6IGl0ZW0uX2lkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFRhYmxlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC90YWJsZS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVXNlckRldGFpbCB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL2F1dGgvdXNlci1kZXRhaWwubW9kZWwnO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB0YWJsZXMgd2l0aCB1c2VyIGNyZWF0aW9uIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ3RhYmxlcycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBUYWJsZXMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGFsbCB0YWJsZXNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEFsbFRhYmxlcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVGFibGVzLmZpbmQoe30pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiB0YWJsZXMgd2l0aCBlc3RhYmxpc2htZW50IGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF9lc3RhYmxpc2htZW50SWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFRhYmxlc0J5RXN0YWJsaXNobWVudCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIHJldHVybiBUYWJsZXMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IF9lc3RhYmxpc2htZW50SWQsIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gdGFibGVzIGJ5IGVzdGFibGlzaG1lbnQgV29ya1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFRhYmxlc0J5RXN0YWJsaXNobWVudFdvcmsnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICBsZXQgX2xVc2VyRGV0YWlsOiBVc2VyRGV0YWlsID0gVXNlckRldGFpbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQgfSk7XG4gICAgaWYgKF9sVXNlckRldGFpbCkge1xuICAgICAgICByZXR1cm4gVGFibGVzLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBfbFVzZXJEZXRhaWwuZXN0YWJsaXNobWVudF93b3JrLCBpc19hY3RpdmU6IHRydWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBXYWl0ZXJDYWxsRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC93YWl0ZXItY2FsbC1kZXRhaWwuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHdhaXRlciBjYWxsIGRldGFpbHMuIHVzZXJJZFxuICogQHBhcmFtIHsgc3RyaW5nIH0gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnY291bnRXYWl0ZXJDYWxsRGV0YWlsQnlVc3JJZCcsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFdhaXRlckNhbGxEZXRhaWxzLmZpbmQoeyB1c2VyX2lkOiBfdXNlcklkLCBzdGF0dXM6IHsgJGluOiBbXCJ3YWl0aW5nXCIsIFwiY29tcGxldGVkXCJdIH0gfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gd2FpdGVyIGNhbGwgZGV0YWlscywgZm9yIHRvIHBheW1lbnQuXG4gKiBAcGFyYW0geyBzdHJpbmcgfSBfZXN0YWJsaXNobWVudElkXG4gKiBAcGFyYW0geyBzdHJpbmcgfSBfdGFibGVJZFxuICogQHBhcmFtIHsgc3RyaW5nIH0gX3R5cGVcbiAqIEBwYXJhbSB7IHN0cmluZ1tdIH0gX3N0YXR1c1xuICovXG5NZXRlb3IucHVibGlzaCgnV2FpdGVyQ2FsbERldGFpbEZvclBheW1lbnQnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nLFxuICBfdGFibGVJZDogc3RyaW5nLFxuICBfdHlwZTogc3RyaW5nKSB7XG4gIHJldHVybiBXYWl0ZXJDYWxsRGV0YWlscy5maW5kKHtcbiAgICBlc3RhYmxpc2htZW50X2lkOiBfZXN0YWJsaXNobWVudElkLFxuICAgIHRhYmxlX2lkOiBfdGFibGVJZCxcbiAgICB0eXBlOiBfdHlwZSxcbiAgICBzdGF0dXM6IHsgJGluOiBbJ3dhaXRpbmcnLCAnY29tcGxldGVkJ10gfVxuICB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB3YWl0ZXIgY2FsbCBkZXRhaWxzLiB1c2VySWQgKFdhaXRlciBpZClcbiAqIEBwYXJhbSB7IHN0cmluZyB9IF93YWl0ZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnd2FpdGVyQ2FsbERldGFpbEJ5V2FpdGVySWQnLCBmdW5jdGlvbiAoX3dhaXRlcklkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFdhaXRlckNhbGxEZXRhaWxzLmZpbmQoeyB3YWl0ZXJfaWQ6IF93YWl0ZXJJZCwgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0pO1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gY291bnRyaWVzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdjb3VudHJpZXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIENvdW50cmllcy5maW5kKHsgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbi8qKlxuICogQ291bnRyeSBieSBlc3RhYmxpc2htZW50XG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRDb3VudHJ5QnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX2VzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICBsZXQgZXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmZpbmRPbmUoeyBfaWQ6IF9lc3RhYmxpc2htZW50SWQgfSk7XG4gICAgaWYgKGVzdGFibGlzaG1lbnQpIHtcbiAgICAgICAgcmV0dXJuIENvdW50cmllcy5maW5kKHsgX2lkOiBlc3RhYmxpc2htZW50LmNvdW50cnlJZCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gQ291bnRyaWVzLmZpbmQoeyBpc19hY3RpdmU6IHRydWUgfSk7O1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gY291bnRyaWVzIGJ5IGVzdGFibGlzaG1lbnRzIElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRDb3VudHJpZXNCeUVzdGFibGlzaG1lbnRzSWQnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRzSWQ6IHN0cmluZ1tdKSB7XG4gICAgbGV0IF9pZHM6IHN0cmluZ1tdID0gW107XG4gICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgX2lkOiB7ICRpbjogX2VzdGFibGlzaG1lbnRzSWQgfSB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50Pihlc3RhYmxpc2htZW50LCBpbmRleCwgYXIpIHtcbiAgICAgICAgX2lkcy5wdXNoKGVzdGFibGlzaG1lbnQuY291bnRyeUlkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gQ291bnRyaWVzLmZpbmQoeyBfaWQ6IHsgJGluOiBfaWRzIH0gfSk7XG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ3VycmVuY2llcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZ2VuZXJhbC9jdXJyZW5jeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9tb2RlbHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1vZGVsJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBjdXJyZW5jaWVzXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdjdXJyZW5jaWVzJywgKCkgPT4gQ3VycmVuY2llcy5maW5kKHsgaXNBY3RpdmU6IHRydWUgfSkpO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gY3VycmVuY2llcyBieSBlc3RhYmxpc2htZW50cyBJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0Q3VycmVuY2llc0J5RXN0YWJsaXNobWVudHNJZCcsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudHNJZDogc3RyaW5nW10pIHtcbiAgICBsZXQgX2lkczogc3RyaW5nW10gPSBbXTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLmZpbmQoeyBfaWQ6IHsgJGluOiBfZXN0YWJsaXNobWVudHNJZCB9IH0pLmZvckVhY2goZnVuY3Rpb24gPEVzdGFibGlzaG1lbnQ+KGVzdGFibGlzaG1lbnQsIGluZGV4LCBhcikge1xuICAgICAgICBfaWRzLnB1c2goZXN0YWJsaXNobWVudC5jdXJyZW5jeUlkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gQ3VycmVuY2llcy5maW5kKHsgX2lkOiB7ICRpbjogX2lkcyB9IH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBjdXJyZW5jaWVzIGJ5ICB1c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEN1cnJlbmNpZXNCeVVzZXJJZCcsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBsZXQgX2N1cnJlbmNpZXNJZHM6IHN0cmluZ1tdID0gW107XG4gICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KS5mb3JFYWNoKGZ1bmN0aW9uIDxFc3RhYmxpc2htZW50Pihlc3RhYmxpc2htZW50LCBpbmRleCwgYXJncykge1xuICAgICAgICBfY3VycmVuY2llc0lkcy5wdXNoKGVzdGFibGlzaG1lbnQuY3VycmVuY3lJZCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQ3VycmVuY2llcy5maW5kKHsgX2lkOiB7ICRpbjogX2N1cnJlbmNpZXNJZHMgfSB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBFbWFpbENvbnRlbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2VtYWlsLWNvbnRlbnQuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIEVtYWlsQ29udGVudHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVtYWlsQ29udGVudHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIEVtYWlsQ29udGVudHMuZmluZCh7fSk7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEhvdXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2hvdXJzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBob3Vyc1xuICovXG5NZXRlb3IucHVibGlzaCgnaG91cnMnLCAoKSA9PiBIb3Vycy5maW5kKCkpOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgTGFuZ3VhZ2VzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2xhbmd1YWdlLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBsYW5ndWFnZXNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goICdsYW5ndWFnZXMnLCAoKSA9PiBMYW5ndWFnZXMuZmluZCggeyBpc19hY3RpdmU6IHRydWUgfSApICk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gRW1haWxDb250ZW50c1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UGFyYW1ldGVycycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUGFyYW1ldGVycy5maW5kKHt9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgUGF5bWVudE1ldGhvZHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQubW9kZWwnO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBwYXltZW50TWV0aG9kc1xuICovXG5NZXRlb3IucHVibGlzaCggJ3BheW1lbnRNZXRob2RzJywgKCkgPT4gUGF5bWVudE1ldGhvZHMuZmluZCggeyBpc0FjdGl2ZTogdHJ1ZSB9ICkgKTtcblxuLypcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gZXN0YWJsaXNobWVudCBwYXltZW50IG1ldGhvZHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goICdnZXRQYXltZW50TWV0aG9kc0J5RXN0YWJsaXNobWVudElkJywgZnVuY3Rpb24oIF9wRXN0YWJsaXNobWVudElkOnN0cmluZyApe1xuICAgIGNoZWNrKCBfcEVzdGFibGlzaG1lbnRJZCwgU3RyaW5nICk7XG4gICAgbGV0IF9sRXN0YWJsaXNobWVudDogRXN0YWJsaXNobWVudCA9IEVzdGFibGlzaG1lbnRzLmZpbmRPbmUoIHsgX2lkOiBfcEVzdGFibGlzaG1lbnRJZCB9ICk7XG4gICAgaWYoIF9sRXN0YWJsaXNobWVudCApe1xuICAgICAgICByZXR1cm4gUGF5bWVudE1ldGhvZHMuZmluZCggeyBfaWQ6IHsgJGluOiBfbEVzdGFibGlzaG1lbnQucGF5bWVudE1ldGhvZHMgfSAsIGlzQWN0aXZlOiB0cnVlIH0gKTsgICAgICAgIFxuICAgIH0gZWxzZXtcbiAgICAgICAgcmV0dXJuIFBheW1lbnRNZXRob2RzLmZpbmQoIHsgaXNBY3RpdmU6IHRydWUgfSApO1xuICAgIH1cbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BvaW50LmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBwb2ludHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ3BvaW50cycsICgpID0+IFBvaW50cy5maW5kKCkpOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgVHlwZXNPZkZvb2QgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvdHlwZS1vZi1mb29kLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiB0eXBlc09mRm9vZFxuICovXG5NZXRlb3IucHVibGlzaCgndHlwZXNPZkZvb2QnLCAoKSA9PiBUeXBlc09mRm9vZC5maW5kKCkpOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ2F0ZWdvcmllcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvbWVudS9jYXRlZ29yeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgU2VjdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc2VjdGlvbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gY2F0ZWdvcmllcyB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnY2F0ZWdvcmllcycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBDYXRlZ29yaWVzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBjYXRlZ29yaWVzIHdpdGggZXN0YWJsaXNobWVudCBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfZXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdjYXRlZ29yaWVzQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGxldCBfc2VjdGlvbnM6IHN0cmluZ1tdID0gW107XG4gICAgY2hlY2soX2VzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcblxuICAgIFNlY3Rpb25zLmNvbGxlY3Rpb24uZmluZCh7IGVzdGFibGlzaG1lbnRzOiB7ICRpbjogW19lc3RhYmxpc2htZW50SWRdIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9KS5mZXRjaCgpLmZvckVhY2goZnVuY3Rpb24gPFN0cmluZz4ocywgaW5kZXgsIGFycikge1xuICAgICAgICBfc2VjdGlvbnMucHVzaChzLl9pZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIENhdGVnb3JpZXMuZmluZCh7IHNlY3Rpb246IHsgJGluOiBfc2VjdGlvbnMgfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEl0ZW1zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L2l0ZW0uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL21vZGVscy9hdXRoL3VzZXItZGV0YWlsLm1vZGVsJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gaXRlbXMgd2l0aCBjcmVhdGlvbiB1c2VyIGNvbmRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2l0ZW1zJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF91c2VySWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIEl0ZW1zLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGFkbWluIGFjdGl2ZSBpdGVtc1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEFkbWluQWN0aXZlSXRlbXMnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gSXRlbXMuZmluZCh7IGNyZWF0aW9uX3VzZXI6IF91c2VySWQsIGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXR1cm4gaXRlbXMgd2l0aCBlc3RhYmxpc2htZW50IGNvbmRpdGlvblxuICovXG5NZXRlb3IucHVibGlzaCgnaXRlbXNCeUVzdGFibGlzaG1lbnQnLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX2VzdGFibGlzaG1lbnRJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gSXRlbXMuZmluZCh7ICdlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkJzogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gcmV0dXJuIGVzdGFibGlzaG1lbnRzIGl0ZW1zXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBfcEVzdGFibGlzaG1lbnRJZHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEl0ZW1zQnlFc3RhYmxpc2htZW50SWRzJywgZnVuY3Rpb24gKF9wRXN0YWJsaXNobWVudElkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gSXRlbXMuZmluZCh7ICdlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkJzogeyAkaW46IF9wRXN0YWJsaXNobWVudElkcyB9IH0pO1xufSk7XG5cblxuLyoqXG4gKiBNZWV0b3IgcHVibGljYXRpb24gcmV0dXJuIGl0ZW1zIGJ5IGVzdGFibGlzaG1lbnQgd29ya1xuICogQHBhcmFtIHtzdHJpbmd9IF91c2VySWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEl0ZW1zQnlVc2VyRXN0YWJsaXNobWVudFdvcmsnLCBmdW5jdGlvbiAoX3VzZXJJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3VzZXJJZCwgU3RyaW5nKTtcbiAgICBsZXQgX2xVc2VyRGV0YWlsOiBVc2VyRGV0YWlsID0gVXNlckRldGFpbHMuZmluZE9uZSh7IHVzZXJfaWQ6IF91c2VySWQgfSk7XG5cbiAgICBpZiAoX2xVc2VyRGV0YWlsKSB7XG4gICAgICAgIGlmIChfbFVzZXJEZXRhaWwuZXN0YWJsaXNobWVudF93b3JrKSB7XG4gICAgICAgICAgICByZXR1cm4gSXRlbXMuZmluZCh7ICdlc3RhYmxpc2htZW50cy5lc3RhYmxpc2htZW50X2lkJzogeyAkaW46IFtfbFVzZXJEZXRhaWwuZXN0YWJsaXNobWVudF93b3JrXSB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgfVxufSk7XG5cblxuLyoqKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBpdGVtcyBzb3J0ZWQgYnkgaXRlbSBuYW1lXG4gKi9cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBpdGVtcyB3aXRoIGVzdGFibGlzaG1lbnQgY29uZGl0aW9uXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdpdGVtc0J5RXN0YWJsaXNobWVudFNvcnRlZEJ5TmFtZScsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudElkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfZXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIHJldHVybiBJdGVtcy5maW5kKHsgJ2VzdGFibGlzaG1lbnRzLmVzdGFibGlzaG1lbnRfaWQnOiB7ICRpbjogW19lc3RhYmxpc2htZW50SWRdIH0sIGlzX2FjdGl2ZTogdHJ1ZSB9LCB7IHNvcnQ6IHsgbmFtZTogMSB9IH0pO1xufSk7XG5cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgU2VjdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc2VjdGlvbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBzZWN0aW9uIHdpdGggY3JlYXRpb24gdXNlciBjb25kaXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdzZWN0aW9ucycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBTZWN0aW9ucy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50cyBzZWN0aW9ucyBcbiAqIEBwYXJhbSB7c3RyaW5nfSBfZXN0YWJsaXNobWVudElkXG4qL1xuTWV0ZW9yLnB1Ymxpc2goJ3NlY3Rpb25zQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFNlY3Rpb25zLmZpbmQoeyBlc3RhYmxpc2htZW50czogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSk7XG59KTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2dldFNlY3Rpb25zJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBTZWN0aW9ucy5maW5kKHt9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBTdWJjYXRlZ29yaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3N1YmNhdGVnb3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgU2VjdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc2VjdGlvbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENhdGVnb3JpZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvY2F0ZWdvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvYXV0aC91c2VyLWRldGFpbC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gc3ViY2F0ZWdvcmllcyB3aXRoIGNyZWF0aW9uIHVzZXIgY29uZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnc3ViY2F0ZWdvcmllcycsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBTdWJjYXRlZ29yaWVzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJldHVybiBzdWJjYXRlZ29yaWVzIHdpdGggZXN0YWJsaXNobWVudCBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBfZXN0YWJsaXNobWVudElkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdzdWJjYXRlZ29yaWVzQnlFc3RhYmxpc2htZW50JywgZnVuY3Rpb24gKF9lc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGxldCBfc2VjdGlvbnM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IF9jYXRlZ29yaWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNoZWNrKF9lc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG5cbiAgICBTZWN0aW9ucy5jb2xsZWN0aW9uLmZpbmQoeyBlc3RhYmxpc2htZW50czogeyAkaW46IFtfZXN0YWJsaXNobWVudElkXSB9LCBpc19hY3RpdmU6IHRydWUgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxTdHJpbmc+KHMsIGluZGV4LCBhcnIpIHtcbiAgICAgICAgX3NlY3Rpb25zLnB1c2gocy5faWQpO1xuICAgIH0pO1xuICAgIENhdGVnb3JpZXMuY29sbGVjdGlvbi5maW5kKHsgc2VjdGlvbjogeyAkaW46IF9zZWN0aW9ucyB9LCBpc19hY3RpdmU6IHRydWUgfSkuZmV0Y2goKS5mb3JFYWNoKGZ1bmN0aW9uIDxTdHJpbmc+KGMsIGluZGV4LCBhcnIpIHtcbiAgICAgICAgX2NhdGVnb3JpZXMucHVzaChjLl9pZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFN1YmNhdGVnb3JpZXMuZmluZCh7IGNhdGVnb3J5OiB7ICRpbjogX2NhdGVnb3JpZXMgfSwgaXNfYWN0aXZlOiB0cnVlIH0pO1xufSk7XG5cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ2NQYXltZW50TWV0aG9kcyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZHMuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIEVtYWlsQ29udGVudHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldENjUGF5bWVudE1ldGhvZHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIENjUGF5bWVudE1ldGhvZHMuZmluZCh7IGlzX2FjdGl2ZTogdHJ1ZSB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ3lnSW52b2ljZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvY3lnLWludm9pY2VzLmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBJbnZvaWNlc0luZm9cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEFsbEN5Z0ludm9pY2VzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBDeWdJbnZvaWNlcy5maW5kKHt9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0Q3lnSW52b2ljZUJ5VXNlcicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfdXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBDeWdJbnZvaWNlcy5maW5kKHsgY3JlYXRpb25fdXNlcjogX3VzZXJJZCB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgSW52b2ljZXNJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L2ludm9pY2VzLWluZm8uY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIEludm9pY2VzSW5mb1xuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0SW52b2ljZXNJbmZvQnlDb3VudHJ5JywgZnVuY3Rpb24gKGNvdW50cnlJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIEludm9pY2VzSW5mby5maW5kKHsgY291bnRyeV9pZDogY291bnRyeUlkIH0pO1xufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFBheW1lbnRzSGlzdG9yeSB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnkuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIEVtYWlsQ29udGVudHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEhpc3RvcnlQYXltZW50c0J5VXNlcicsIGZ1bmN0aW9uIChfdXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gUGF5bWVudHNIaXN0b3J5LmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkfSwgeyBzb3J0OiB7IGNyZWF0aW9uX2RhdGU6IC0xIH0gfSk7XG59KTsgIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBQYXltZW50VHJhbnNhY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L3BheW1lbnQtdHJhbnNhY3Rpb24uY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIEVtYWlsQ29udGVudHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFRyYW5zYWN0aW9ucycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUGF5bWVudFRyYW5zYWN0aW9ucy5maW5kKHt9KTtcbn0pO1xuXG5NZXRlb3IucHVibGlzaCgnZ2V0VHJhbnNhY3Rpb25zQnlVc2VyJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIHJldHVybiBQYXltZW50VHJhbnNhY3Rpb25zLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pO1xufSk7IiwiaW1wb3J0IHsgQmFnUGxhbiB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvbW9kZWxzL3BvaW50cy9iYWctcGxhbi5tb2RlbCc7XG5pbXBvcnQgeyBCYWdQbGFucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2JhZy1wbGFucy5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gYmFnIHBsYW5zXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0QmFnUGxhbnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IF9sQmFnc1BsYW5zID0gQmFnUGxhbnMuZmluZCh7fSk7XG4gICAgcmV0dXJuIF9sQmFnc1BsYW5zO1xufSk7XG5cblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gYmFnIHBsYW5zXG4gKiBAcGFyYW0ge3N0cmluZ30gX3VzZXJJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0QmFnUGxhbnNOb0ZyZWUnLCBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IF9sQmFnc1BsYW5zID0gQmFnUGxhbnMuZmluZCh7IG5hbWU6IHsgJG5pbjogWydmcmVlJ10gfSB9KTtcbiAgICByZXR1cm4gX2xCYWdzUGxhbnM7XG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7IEVzdGFibGlzaG1lbnRNZWRhbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9lc3RhYmxpc2htZW50LW1lZGFsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gZXN0YWJsaXNobWVudCBtZWRhbHMgYnkgdXNlciBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wVXNlcklkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50TWVkYWxzQnlVc2VySWQnLCBmdW5jdGlvbiAoX3BVc2VySWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wVXNlcklkLCBTdHJpbmcpO1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50TWVkYWxzLmZpbmQoeyB1c2VyX2lkOiBfcFVzZXJJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IG1lZGFscyBieSBlc3RhYmxpc2htZW50cyBhcnJheVxuICogQHBhcmFtIHtzdHJpbmdbXX0gX2VzdGFibGlzaG1lbnRBcnJheVxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0RXN0YWJsaXNobWVudE1lZGFsc0J5QXJyYXknLCBmdW5jdGlvbiAoX2VzdGFibGlzaG1lbnRBcnJheTogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudE1lZGFscy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogeyAkaW46IF9lc3RhYmxpc2htZW50QXJyYXkgfSB9KTtcbn0pO1xuXG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGVzdGFibGlzaG1lbnQgbWVkYWxzIGJ5IGFkbWluIHVzZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBfYWRtaW5Vc2VySWRcbiAqL1xuTWV0ZW9yWydwdWJsaXNoQ29tcG9zaXRlJ10oJ2dldEVzdGFibGlzaG1lbnRCeUFkbWluVXNyJywgZnVuY3Rpb24gKF9hZG1pblVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZmluZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHsgY3JlYXRpb25fdXNlcjogX2FkbWluVXNlcklkIH0pO1xuICAgICAgICB9LFxuICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICAgIGZpbmQoZXN0YWJsaXNobWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBFc3RhYmxpc2htZW50TWVkYWxzLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBlc3RhYmxpc2htZW50Ll9pZCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICB9O1xufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50UG9pbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudC1wb2ludHMuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGVzdGFibGlzaG1lbnQgcG9pbnRzIGJ5IGlkc1xuICogQHBhcmFtIHtzdHJpbmdbXX0gX3BJZHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldEVzdGFibGlzaG1lbnRQb2ludHNCeUlkcycsIGZ1bmN0aW9uIChfcElkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gRXN0YWJsaXNobWVudFBvaW50cy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogeyAkaW46IF9wSWRzIH0gfSk7XG59KTtcblxuXG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIGVzdGFibGlzaG1lbnQgcG9pbnRzIGJ5IHVzZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyX2lkXG4gKi9cbk1ldGVvci5wdWJsaXNoKCdnZXRFc3RhYmxpc2htZW50UG9pbnRzQnlVc2VyJywgZnVuY3Rpb24gKF91c2VySWQ6IHN0cmluZykge1xuICAgIHJldHVybiBFc3RhYmxpc2htZW50UG9pbnRzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfdXNlcklkIH0pXG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgTmVnYXRpdmVQb2ludHMgfSBmcm9tICcuLi8uLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9uZWdhdGl2ZS1wb2ludHMuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBFc3RhYmxpc2htZW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50LmNvbGxlY3Rpb24nO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiBlc3RhYmxpc2htZW50IG5lZ2F0aXZlIHBvaW50cyBieSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IF9wSWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldE5lZ2F0aXZlUG9pbnRzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiAoX3BJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIE5lZ2F0aXZlUG9pbnRzLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBfcElkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIG5lZ2F0aXZlIHBvaXRucyBieSBlc3RhYmxpc2htZW50cyBhcnJheVxuICovXG5cbk1ldGVvci5wdWJsaXNoKCdnZXROZWdhdGl2ZVBvaW50c0J5RXN0YWJsaXNobWVudHNBcnJheScsIGZ1bmN0aW9uIChfZXN0YWJsaXNobWVudEFycmF5OiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBOZWdhdGl2ZVBvaW50cy5maW5kKHsgXCJlc3RhYmxpc2htZW50X2lkXCI6IHsgJGluOiBfZXN0YWJsaXNobWVudEFycmF5IH0gfSk7XG59KTtcblxuLyoqXG4gKiBNZXRlb3IgcHVibGljYXRpb24gb2YgbmVnYXRpdmUgcG9pbnRzIGJ5IGNyZWF0aW9uX3VzZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBfdXNlcklkXG4gKi9cbk1ldGVvclsncHVibGlzaENvbXBvc2l0ZSddKCdnZXROZWdhdGl2ZVBvaW50c0J5QWRtaW5Vc2VyJywgZnVuY3Rpb24gKF9hZG1pblVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZmluZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBFc3RhYmxpc2htZW50cy5maW5kKHsgY3JlYXRpb25fdXNlcjogX2FkbWluVXNlcklkIH0pO1xuICAgICAgICB9LFxuICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICAgIGZpbmQoZXN0YWJsaXNobWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBOZWdhdGl2ZVBvaW50cy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogZXN0YWJsaXNobWVudC5faWQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgfVxufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBSZXdhcmRzQ29uZmlybWF0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL3Jld2FyZC1jb25maXJtYXRpb24uY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJld2FyZHMgY29uZmlybWF0aW9uIGJ5IGVzdGFibGlzaG1lbnQgaWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBfcEVzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkc0NvbmZpcm1hdGlvbnNCeUVzdGFibGlzaG1lbnRJZCcsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRJZDogc3RyaW5nKSB7XG4gICAgY2hlY2soX3BFc3RhYmxpc2htZW50SWQsIFN0cmluZyk7XG4gICAgcmV0dXJuIFJld2FyZHNDb25maXJtYXRpb25zLmZpbmQoeyBlc3RhYmxpc2htZW50X2lkOiBfcEVzdGFibGlzaG1lbnRJZCB9KTtcbn0pO1xuXG4vKipcbiAqIE1ldGVvciBwdWJsaWNhdGlvbiByZXdhcmRzIGNvbmZpcm1hdGlvbiBieSBlc3RhYmxpc2htZW50cyBpZHNcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFJld2FyZHNDb25maXJtYXRpb25zQnlFc3RhYmxpc2htZW50c0lkcycsIGZ1bmN0aW9uIChfcEVzdGFibGlzaG1lbnRzSWRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBSZXdhcmRzQ29uZmlybWF0aW9ucy5maW5kKHsgZXN0YWJsaXNobWVudF9pZDogeyAkaW46IF9wRXN0YWJsaXNobWVudHNJZHMgfSB9KTtcbn0pOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgUmV3YXJkSGlzdG9yaWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wb2ludHMvcmV3YXJkLWhpc3RvcnkuY29sbGVjdGlvbic7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJld2FyZHMgaGlzdG9yaWVzIGJ5IGVzdGFibGlzaG1lbnQgaWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBfcEVzdGFibGlzaG1lbnRJZFxuICovXG5NZXRlb3IucHVibGlzaCgnZ2V0UmV3YXJkSGlzdG9yaWVzQnlFc3RhYmxpc2htZW50SWQnLCBmdW5jdGlvbiAoX3BFc3RhYmxpc2htZW50SWQ6IHN0cmluZykge1xuICAgIGNoZWNrKF9wRXN0YWJsaXNobWVudElkLCBTdHJpbmcpO1xuICAgIHJldHVybiBSZXdhcmRIaXN0b3JpZXMuZmluZCh7IGVzdGFibGlzaG1lbnRfaWQ6IF9wRXN0YWJsaXNobWVudElkIH0pO1xufSk7XG5cbi8qKlxuICogTWV0ZW9yIHB1YmxpY2F0aW9uIHJld2FyZHMgaGlzdG9yaWVzIGJ5IHVzZXIgaWRcbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ2dldFJld2FyZEhpc3Rvcmllc0J5VXNlcklkJywgZnVuY3Rpb24gKF9wVXNlcklkOiBzdHJpbmcpIHtcbiAgICBjaGVjayhfcFVzZXJJZCwgU3RyaW5nKTtcbiAgICByZXR1cm4gUmV3YXJkSGlzdG9yaWVzLmZpbmQoeyBjcmVhdGlvbl91c2VyOiBfcFVzZXJJZCB9KTtcbn0pOyIsImltcG9ydCB7IEVzdGFibGlzaG1lbnRzLCBFc3RhYmxpc2htZW50c1Byb2ZpbGUgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFVzZXJEZXRhaWxzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9hdXRoL3VzZXItZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgU2VjdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvc2VjdGlvbi5jb2xsZWN0aW9uJztcbmltcG9ydCB7IENhdGVnb3JpZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvY2F0ZWdvcnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBTdWJjYXRlZ29yaWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9tZW51L3N1YmNhdGVnb3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgSXRlbXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL21lbnUvaXRlbS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBheW1lbnRNZXRob2RzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BheW1lbnRNZXRob2QuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXltZW50c0hpc3RvcnkgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BheW1lbnQvcGF5bWVudC1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgT3JkZXJzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L29yZGVyLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVGFibGVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9lc3RhYmxpc2htZW50L3RhYmxlLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgV2FpdGVyQ2FsbERldGFpbHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvd2FpdGVyLWNhbGwtZGV0YWlsLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ2NQYXltZW50TWV0aG9kcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9jYy1wYXltZW50LW1ldGhvZHMuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXltZW50VHJhbnNhY3Rpb25zIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9wYXltZW50L3BheW1lbnQtdHJhbnNhY3Rpb24uY29sbGVjdGlvbic7XG5pbXBvcnQgeyBPcmRlckhpc3RvcmllcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9vcmRlci1oaXN0b3J5LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ291bnRyaWVzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL2NvdW50cnkuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBMYW5ndWFnZXMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvbGFuZ3VhZ2UuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBSZXdhcmRQb2ludHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLXBvaW50LmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgUmV3YXJkcyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQuY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQYXJhbWV0ZXJzIH0gZnJvbSAnLi4vLi4vLi4vYm90aC9jb2xsZWN0aW9ucy9nZW5lcmFsL3BhcmFtZXRlci5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEludm9pY2VzSW5mbyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcGF5bWVudC9pbnZvaWNlcy1pbmZvLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgRXN0YWJsaXNobWVudFBvaW50cyB9IGZyb20gJy4uLy4uLy4uL2JvdGgvY29sbGVjdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtcG9pbnRzLmNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTmVnYXRpdmVQb2ludHMgfSBmcm9tICcuLi8uLi8uLi9ib3RoL2NvbGxlY3Rpb25zL3BvaW50cy9uZWdhdGl2ZS1wb2ludHMuY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVkYmluZGV4ZXMoKSB7XG5cbiAgICAvLyBFc3RhYmxpc2htZW50IENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIEVzdGFibGlzaG1lbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY3JlYXRpb25fdXNlcjogMSB9KTtcbiAgICBFc3RhYmxpc2htZW50cy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IG5hbWU6IDEgfSk7XG4gICAgRXN0YWJsaXNobWVudHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpc0FjdGl2ZTogMSB9KTtcblxuICAgIC8vIEVzdGFibGlzaG1lbnQgUHJvZmlsZSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBFc3RhYmxpc2htZW50c1Byb2ZpbGUuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gVXNlciBDb2xsZWN0aW9ucyBJbmRleGVzXG4gICAgVXNlckRldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyB1c2VyX2lkOiAxIH0pO1xuICAgIFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgZXN0YWJsaXNobWVudF93b3JrOiAxIH0pO1xuICAgIFVzZXJEZXRhaWxzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgY3VycmVudF9lc3RhYmxpc2htZW50OiAxLCBjdXJyZW50X3RhYmxlOiAxIH0pO1xuXG4gICAgLy8gU2VjdGlvbiBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBTZWN0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgU2VjdGlvbnMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50czogMSB9KTtcblxuICAgIC8vIENhdGVnb3J5IENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIENhdGVnb3JpZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIENhdGVnb3JpZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBzZWN0aW9uOiAxIH0pO1xuXG4gICAgLy8gU3ViY2F0ZWdvcnkgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgU3ViY2F0ZWdvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgU3ViY2F0ZWdvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNhdGVnb3J5OiAxIH0pO1xuXG4gICAgLy8gSXRlbSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBJdGVtcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG4gICAgSXRlbXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBzZWN0aW9uSWQ6IDEgfSk7XG4gICAgSXRlbXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50czogMSB9KTtcblxuICAgIC8vIFBheW1lbnRNZXRob2QgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUGF5bWVudE1ldGhvZHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpc0FjdGl2ZTogMSB9KTtcblxuICAgIC8vIFBheW1lbnRzSGlzdG9yeSBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkczogMSB9KTtcbiAgICBQYXltZW50c0hpc3RvcnkuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjcmVhdGlvbl91c2VyOiAxIH0pO1xuICAgIFBheW1lbnRzSGlzdG9yeS5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX2RhdGU6IDEgfSk7XG5cbiAgICAvLyBUYWJsZXMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgVGFibGVzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgUVJfY29kZTogMSB9KTtcbiAgICBUYWJsZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gT3JkZXJzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIE9yZGVycy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRfaWQ6IDEgfSk7XG4gICAgT3JkZXJzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgdGFibGVJZDogMSB9KTtcbiAgICBPcmRlcnMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBzdGF0dXM6IDEgfSk7XG5cbiAgICAvLyBXYWl0ZXJDYWxsRGV0YWlscyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBXYWl0ZXJDYWxsRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHN0YXR1czogMSB9KTtcbiAgICBXYWl0ZXJDYWxsRGV0YWlscy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHVzZXJfaWQ6IDEgfSk7XG4gICAgV2FpdGVyQ2FsbERldGFpbHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBlc3RhYmxpc2htZW50X2lkOiAxLCB0YWJsZV9pZDogMSwgdHlwZTogMSB9KTtcblxuICAgIC8vIENjUGF5bWVudE1ldGhvZHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgQ2NQYXltZW50TWV0aG9kcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzX2FjdGl2ZTogMSB9KTtcblxuICAgIC8vIFBheW1lbnRUcmFuc2FjdGlvbnMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUGF5bWVudFRyYW5zYWN0aW9ucy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGNyZWF0aW9uX3VzZXI6IDEgfSk7XG5cbiAgICAvLyBPcmRlckhpc3RvcmllcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBPcmRlckhpc3Rvcmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGN1c3RvbWVyX2lkOiAxLCBlc3RhYmxpc2htZW50X2lkOiAxIH0pO1xuXG4gICAgLy8gQ291bnRyaWVzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIENvdW50cmllcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGlzX2FjdGl2ZTogMSB9KTtcblxuICAgIC8vIExhbmd1YWdlcyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBMYW5ndWFnZXMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpc19hY3RpdmU6IDEgfSk7XG5cbiAgICAvLyBSZXdhcmRQb2ludHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUmV3YXJkUG9pbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgaWRfdXNlcjogMSB9KTtcblxuICAgIC8vIFJld2FyZHMgQ29sbGVjdGlvbiBJbmRleGVzXG4gICAgUmV3YXJkcy5jb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IGVzdGFibGlzaG1lbnRzOiAxIH0pO1xuICAgIFJld2FyZHMuY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBpdGVtX2lkOiAxIH0pO1xuXG4gICAgLy8gUGFyYW1ldGVycyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBQYXJhbWV0ZXJzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgbmFtZTogMSB9KTtcblxuICAgIC8vIEludm9pY2VzSW5mbyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBJbnZvaWNlc0luZm8uY29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyBjb3VudHJ5X2lkOiAxIH0pO1xuXG4gICAgLy8gRXN0YWJsaXNobWVudFBvaW50cyBDb2xsZWN0aW9uIEluZGV4ZXNcbiAgICBFc3RhYmxpc2htZW50UG9pbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgZXN0YWJsaXNobWVudF9pZDogMSB9KTtcblxuICAgIC8vIE5lZ2F0aXZlUG9pbnRzIENvbGxlY3Rpb24gSW5kZXhlc1xuICAgIE5lZ2F0aXZlUG9pbnRzLmNvbGxlY3Rpb24uX2Vuc3VyZUluZGV4KHsgZXN0YWJsaXNobWVudF9pZDogMSB9KTtcbn0iLCJpbXBvcnQgeyBTeW5jZWRDcm9uIH0gZnJvbSAnbWV0ZW9yL3BlcmNvbGF0ZTpzeW5jZWQtY3Jvbic7XG5TeW5jZWRDcm9uLmNvbmZpZyh7XG4gICAgLy8gTG9nIGpvYiBydW4gZGV0YWlscyB0byBjb25zb2xlXG4gICAgbG9nOiB0cnVlLFxuXG4gICAgLy8gVXNlIGEgY3VzdG9tIGxvZ2dlciBmdW5jdGlvbiAoZGVmYXVsdHMgdG8gTWV0ZW9yJ3MgbG9nZ2luZyBwYWNrYWdlKVxuICAgIGxvZ2dlcjogbnVsbCxcblxuICAgIC8vIE5hbWUgb2YgY29sbGVjdGlvbiB0byB1c2UgZm9yIHN5bmNocm9uaXNhdGlvbiBhbmQgbG9nZ2luZ1xuICAgIGNvbGxlY3Rpb25OYW1lOiAnY3Jvbl9oaXN0b3J5JyxcblxuICAgIC8vIERlZmF1bHQgdG8gdXNpbmcgbG9jYWxUaW1lXG4gICAgdXRjOiBmYWxzZSxcblxuICAgIC8qXG4gICAgICBUVEwgaW4gc2Vjb25kcyBmb3IgaGlzdG9yeSByZWNvcmRzIGluIGNvbGxlY3Rpb24gdG8gZXhwaXJlXG4gICAgICBOT1RFOiBVbnNldCB0byByZW1vdmUgZXhwaXJ5IGJ1dCBlbnN1cmUgeW91IHJlbW92ZSB0aGUgaW5kZXggZnJvbVxuICAgICAgbW9uZ28gYnkgaGFuZFxuXG4gICAgICBBTFNPOiBTeW5jZWRDcm9uIGNhbid0IHVzZSB0aGUgYF9lbnN1cmVJbmRleGAgY29tbWFuZCB0byBtb2RpZnlcbiAgICAgIHRoZSBUVEwgaW5kZXguIFRoZSBiZXN0IHdheSB0byBtb2RpZnkgdGhlIGRlZmF1bHQgdmFsdWUgb2ZcbiAgICAgIGBjb2xsZWN0aW9uVFRMYCBpcyB0byByZW1vdmUgdGhlIGluZGV4IGJ5IGhhbmQgKGluIHRoZSBtb25nbyBzaGVsbFxuICAgICAgcnVuIGBkYi5jcm9uSGlzdG9yeS5kcm9wSW5kZXgoe3N0YXJ0ZWRBdDogMX0pYCkgYW5kIHJlLXJ1biB5b3VyXG4gICAgICBwcm9qZWN0LiBTeW5jZWRDcm9uIHdpbGwgcmVjcmVhdGUgdGhlIGluZGV4IHdpdGggdGhlIHVwZGF0ZWQgVFRMLlxuICAgICovXG4gICAgY29sbGVjdGlvblRUTDogMTcyODAwXG59KTsiLCJpbXBvcnQgeyBTeW5jZWRDcm9uIH0gZnJvbSAnbWV0ZW9yL3BlcmNvbGF0ZTpzeW5jZWQtY3Jvbic7XG5pbXBvcnQgeyBDb3VudHJpZXMgfSBmcm9tICcuLi9ib3RoL2NvbGxlY3Rpb25zL2dlbmVyYWwvY291bnRyeS5jb2xsZWN0aW9uJztcbmltcG9ydCB7IEVtYWlsIH0gZnJvbSAnbWV0ZW9yL2VtYWlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNyb25zKCkge1xuICBsZXQgYWN0aXZlQ291bnRyaWVzID0gQ291bnRyaWVzLmNvbGxlY3Rpb24uZmluZCh7IGlzX2FjdGl2ZTogdHJ1ZSB9KS5mZXRjaCgpO1xuICBhY3RpdmVDb3VudHJpZXMuZm9yRWFjaChjb3VudHJ5ID0+IHtcblxuICAgIC8qKlRoaXMgY3JvbiBldmFsdWF0ZXMgdGhlIGN1cnJlbnQgbWVkYWxzIG9mIHRoZSBlc3RhYmxpc2htZW50IHRvIGFkdmljZSB0byBwdXJjaGFzZSBtb3JlKi9cbiAgICBTeW5jZWRDcm9uLmFkZCh7XG4gICAgICBuYW1lOiAnY3JvbkNoZWNrQ3VycmVudE1lZGFscy4nICsgY291bnRyeS5uYW1lLFxuICAgICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChwYXJzZXIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5jcm9uKGNvdW50cnkuY3JvbkNoZWNrQ3VycmVudE1lZGFscyk7XG4gICAgICB9LFxuICAgICAgam9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIE1ldGVvci5jYWxsKCdjaGVja0N1cnJlbnRNZWRhbHMnLCBjb3VudHJ5Ll9pZCk7XG4gICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8qKlxuICAgICAqIFRoaXMgY3JvbiBldmFsdWF0ZXMgZGUgbmVnYXRpdmUgbWVkYWxzIG9mIHRoZSBlc3RhYmxpc2htZW50IHRvIGFkdml0ZSB0byBwYXkgcGVuZGluZyBcbiAgICAqL1xuICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgIG5hbWU6ICdjcm9uQ2hlY2tOZWdhdGl2ZU1lZGFscy4nICsgY291bnRyeS5uYW1lLFxuICAgICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChwYXJzZXIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5jcm9uKGNvdW50cnkuY3JvbkNoZWNrTmVnYXRpdmVNZWRhbHMpO1xuICAgICAgfSxcbiAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICBNZXRlb3IuY2FsbCgnY2hlY2tOZWdhdGl2ZU1lZGFscycsIGNvdW50cnkuX2lkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLyoqXG4gICAgKiBUaGlzIGNyb24gZXZhbHVhdGVzIHRoZSBmcmVlRGF5cyBmbGFnIG9uIGVzdGFibGlzaG1lbnRzIHdpdGggdmFsdWUgdHJ1ZSwgYW5kIGNoYW5nZSBpdCB0byBmYWxzZVxuICAgICovXG4gICAgLyoqXG4gICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgICBuYW1lOiAnY3JvbkNoYW5nZUZyZWVEYXlzLicgKyBjb3VudHJ5Lm5hbWUsXG4gICAgICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChwYXJzZXIpIHtcbiAgICAgICAgIHJldHVybiBwYXJzZXIuY3Jvbihjb3VudHJ5LmNyb25DaGFuZ2VGcmVlRGF5cyk7XG4gICAgICAgfSxcbiAgICAgICBqb2I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIE1ldGVvci5jYWxsKCdjaGFuZ2VGcmVlRGF5c1RvRmFsc2UnLCBjb3VudHJ5Ll9pZCk7XG4gICAgICAgfVxuICAgICB9KTtcbiAgICAgICovXG5cbiAgICAvKipcbiAgICAqIFRoaXMgY3JvbiBzZW5kcyBlbWFpbCB0byB3YXJuIHRoZSBjaGFyZ2Ugc29vbiBvZiBpdXJlc3Qgc2VydmljZVxuICAgICovXG4gICAgLyoqXG4gICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgICBuYW1lOiAnY3JvbkVtYWlsQ2hhcmdlU29vbi4nICsgY291bnRyeS5uYW1lLFxuICAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAocGFyc2VyKSB7XG4gICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uRW1haWxDaGFyZ2VTb29uKTtcbiAgICAgICB9LFxuICAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgTWV0ZW9yLmNhbGwoJ3NlbmRFbWFpbENoYXJnZVNvb24nLCBjb3VudHJ5Ll9pZCk7XG4gICAgICAgfVxuICAgICB9KTtcbiAgICAgICovXG5cbiAgICAvKipcbiAgICAqIFRoaXMgY3JvbiBzZW5kcyBlbWFpbCB0byB3YXJuIHRoZSBleHBpcmUgc29vbiB0aGUgaXVyZXN0IHNlcnZpY2VcbiAgICAqL1xuICAgIC8qKlxuICAgICBTeW5jZWRDcm9uLmFkZCh7XG4gICAgICAgbmFtZTogJ2Nyb25FbWFpbEV4cGlyZVNvb24uJyArIGNvdW50cnkubmFtZSxcbiAgICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICAgcmV0dXJuIHBhcnNlci5jcm9uKGNvdW50cnkuY3JvbkVtYWlsRXhwaXJlU29vbik7XG4gICAgICAgfSxcbiAgICAgICBqb2I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIE1ldGVvci5jYWxsKCdzZW5kRW1haWxFeHBpcmVTb29uJywgY291bnRyeS5faWQpO1xuICAgICAgIH1cbiAgICAgfSk7XG4gICAgICAqL1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGNyb24gZXZhbHVhdGVzIHRoZSBpc0FjdGl2ZSBmbGFnIG9uIGVzdGFibGlzaG1lbnRzIHdpdGggdmFsdWUgdHJ1ZSwgYW5kIGluc2VydCB0aGVtIG9uIGhpc3RvcnlfcGF5bWVudCBjb2xsZWN0aW9uXG4gICAgICovXG4gICAgLyoqXG4gICAgU3luY2VkQ3Jvbi5hZGQoe1xuICAgICAgbmFtZTogJ2Nyb25WYWxpZGF0ZUFjdGl2ZS4nICsgY291bnRyeS5uYW1lLFxuICAgICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChwYXJzZXIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5jcm9uKGNvdW50cnkuY3JvblZhbGlkYXRlQWN0aXZlKTtcbiAgICAgIH0sXG4gICAgICBqb2I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTWV0ZW9yLmNhbGwoJ3ZhbGlkYXRlQWN0aXZlRXN0YWJsaXNobWVudHMnLCBjb3VudHJ5Ll9pZCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgICovXG5cblxuICAgIC8qKlxuICAgICogVGhpcyBjcm9uIHNlbmRzIGFuIGVtYWlsIHRvIHdhcm4gdGhhdCB0aGUgc2VydmljZSBoYXMgZXhwaXJlZFxuICAgICovXG4gICAgLyoqXG4gICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgICBuYW1lOiAnY3JvbkVtYWlsUmVzdEV4cGlyZWQuJyArIGNvdW50cnkubmFtZSxcbiAgICAgICBzY2hlZHVsZTogZnVuY3Rpb24gKHBhcnNlcikge1xuICAgICAgICAgcmV0dXJuIHBhcnNlci5jcm9uKGNvdW50cnkuY3JvbkVtYWlsUmVzdEV4cGlyZWQpO1xuICAgICAgIH0sXG4gICAgICAgam9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBNZXRlb3IuY2FsbCgnc2VuZEVtYWlsUmVzdEV4cGlyZWQnLCBjb3VudHJ5Ll9pZCk7XG4gICAgICAgfVxuICAgICB9KTtcbiAgICAgICovXG5cbiAgICAvKipcbiAgICAqIFRoaXMgY3JvbiB2YWxpZGF0ZSB0aGUgcG9pbnRzIGV4cGlyYXRpb24gZGF0ZVxuICAgICovXG4gICAgLyoqXG4gICAgIFN5bmNlZENyb24uYWRkKHtcbiAgICAgICBuYW1lOiAnY3JvblBvaW50c0V4cGlyZS4nICsgY291bnRyeS5uYW1lLFxuICAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAocGFyc2VyKSB7XG4gICAgICAgICByZXR1cm4gcGFyc2VyLmNyb24oY291bnRyeS5jcm9uUG9pbnRzRXhwaXJlKTtcbiAgICAgICB9LFxuICAgICAgIGpvYjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgTWV0ZW9yLmNhbGwoJ2NoZWNrUG9pbnRzVG9FeHBpcmUnLCBjb3VudHJ5Ll9pZCk7XG4gICAgICAgfVxuICAgICB9KTtcbiAgICAgICovXG4gIH0pO1xufVxuXG5TeW5jZWRDcm9uLnN0YXJ0KCk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L3NlY3Rpb25zJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9tZW51L2NhdGVnb3JpZXMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL21lbnUvc3ViY2F0ZWdvcmllcyc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvbWVudS9pdGVtJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3VzZXJzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL3JvbGVzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL21lbnVzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9hdXRoL2NvbGxhYm9yYXRvcnMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2F1dGgvdXNlci1kZXRhaWxzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL2hvdXInO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvY3VycmVuY3knO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvcGF5bWVudE1ldGhvZCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9lbWFpbC1jb250ZW50JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL3BhcmFtZXRlcic7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZ2VuZXJhbC9jb3VudHJpZXMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2dlbmVyYWwvbGFuZ3VhZ2VzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL3BvaW50JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9nZW5lcmFsL3R5cGUtb2YtZm9vZCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9wYXltZW50LWhpc3RvcnknO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvY2MtcGF5bWVudC1tZXRob2QnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvcGF5bWVudC10cmFuc2FjdGlvbic7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcGF5bWVudC9pbnZvaWNlLWluZm8nO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BheW1lbnQvY3lnLWludm9pY2VzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9lc3RhYmxpc2htZW50L2VzdGFibGlzaG1lbnQnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvZXN0YWJsaXNobWVudC1xcic7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC90YWJsZSc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC93YWl0ZXItY2FsbCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvZXN0YWJsaXNobWVudC9yZXdhcmQnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL2VzdGFibGlzaG1lbnQvcmV3YXJkLXBvaW50JztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvYmFnX3BsYW5zJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvZXN0YWJsaXNobWVudF9wb2ludHMnO1xuaW1wb3J0ICcuL2ltcG9ydHMvcHVibGljYXRpb25zL3BvaW50cy9uZWdhdGl2ZS1wb2ludCc7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL2VzdGFibGlzaG1lbnQtbWVkYWxzJztcbmltcG9ydCAnLi9pbXBvcnRzL3B1YmxpY2F0aW9ucy9wb2ludHMvcmV3YXJkLWNvbmZpcm1hdGlvbic7XG5pbXBvcnQgJy4vaW1wb3J0cy9wdWJsaWNhdGlvbnMvcG9pbnRzL3Jld2FyZC1oaXN0b3J5JztcblxuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvbWVudS9pdGVtLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvYXV0aC9jb2xsYWJvcmF0b3JzLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvYXV0aC9tZW51Lm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvYXV0aC91c2VyLWRldGFpbC5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2F1dGgvdXNlci1kZXZpY2VzLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvYXV0aC91c2VyLWxvZ2luLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvYXV0aC91c2VyLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jcm9uLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvZ2VuZXJhbC9lbWFpbC5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvY2hhbmdlLWVtYWlsLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jb3VudHJ5Lm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvZ2VuZXJhbC9jeWctaW52b2ljZS5tZXRob2RzJztcbmltcG9ydCAnLi4vYm90aC9tZXRob2RzL2dlbmVyYWwvcHVzaC1ub3RpZmljYXRpb25zLm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvZXN0YWJsaXNobWVudC9lc3RhYmxpc2htZW50Lm1ldGhvZHMnO1xuaW1wb3J0ICcuLi9ib3RoL21ldGhvZHMvcmV3YXJkL3Jld2FyZC5tZXRob2RzJztcblxuaW1wb3J0ICcuL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9hY2NvdW50LWNyZWF0aW9uJztcbmltcG9ydCAnLi9pbXBvcnRzL2ZpeHR1cmVzL2F1dGgvZW1haWwtY29uZmlnJztcbmltcG9ydCB7IHJlbW92ZUZpeHR1cmVzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL3JlbW92ZS1maXh0dXJlcyc7XG5pbXBvcnQgeyBsb2FkUm9sZXMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9yb2xlcyc7XG5pbXBvcnQgeyBsb2FkTWVudXMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvYXV0aC9tZW51cyc7XG5pbXBvcnQgeyBsb2FkSG91cnMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9ob3Vycyc7XG5pbXBvcnQgeyBsb2FkQ3VycmVuY2llcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL2N1cnJlbmNpZXMnO1xuaW1wb3J0IHsgbG9hZFBheW1lbnRNZXRob2RzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvcGF5bWVudE1ldGhvZHMnO1xuaW1wb3J0IHsgbG9hZENvdW50cmllcyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL2NvdW50cmllcyc7XG5pbXBvcnQgeyBsb2FkTGFuZ3VhZ2VzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvbGFuZ3VhZ2VzJztcbmltcG9ydCB7IGxvYWRFbWFpbENvbnRlbnRzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL2dlbmVyYWwvZW1haWwtY29udGVudHMnO1xuaW1wb3J0IHsgbG9hZFBhcmFtZXRlcnMgfSBmcm9tICcuL2ltcG9ydHMvZml4dHVyZXMvZ2VuZXJhbC9wYXJhbWV0ZXJzJztcbmltcG9ydCB7IGxvYWRDY1BheW1lbnRNZXRob2RzIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL3BheW1lbnRzL2NjLXBheW1lbnQtbWV0aG9kcyc7XG5pbXBvcnQgeyBsb2FkSW52b2ljZXNJbmZvIH0gZnJvbSAnLi9pbXBvcnRzL2ZpeHR1cmVzL3BheW1lbnRzL2ludm9pY2VzLWluZm8nO1xuaW1wb3J0IHsgbG9hZFBvaW50cyB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL3BvaW50JztcbmltcG9ydCB7IGxvYWRUeXBlc09mRm9vZCB9IGZyb20gJy4vaW1wb3J0cy9maXh0dXJlcy9nZW5lcmFsL3R5cGUtb2YtZm9vZCc7XG5pbXBvcnQgeyBjcmVhdGVkYmluZGV4ZXMgfSBmcm9tICcuL2ltcG9ydHMvaW5kZXhlcy9pbmRleGRiJztcbmltcG9ydCB7IGNyZWF0ZUNyb25zIH0gZnJvbSAnLi9jcm9uJztcbmltcG9ydCB7IGxvYWRCYWdQbGFucyB9IGZyb20gXCIuL2ltcG9ydHMvZml4dHVyZXMvcG9pbnRzL2JhZ19wbGFuc1wiO1xuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgcmVtb3ZlRml4dHVyZXMoKTtcbiAgICBsb2FkTWVudXMoKTtcbiAgICBsb2FkUm9sZXMoKTtcbiAgICBsb2FkSG91cnMoKTtcbiAgICBsb2FkQ3VycmVuY2llcygpO1xuICAgIGxvYWRQYXltZW50TWV0aG9kcygpO1xuICAgIGxvYWRDb3VudHJpZXMoKTtcbiAgICBsb2FkTGFuZ3VhZ2VzKCk7XG4gICAgbG9hZEVtYWlsQ29udGVudHMoKTtcbiAgICBsb2FkUGFyYW1ldGVycygpO1xuICAgIGxvYWRDY1BheW1lbnRNZXRob2RzKCk7XG4gICAgbG9hZEludm9pY2VzSW5mbygpO1xuICAgIGxvYWRQb2ludHMoKTtcbiAgICBsb2FkVHlwZXNPZkZvb2QoKTtcbiAgICBjcmVhdGVDcm9ucygpO1xuICAgIGxvYWRCYWdQbGFucygpO1xuICAgIGNyZWF0ZWRiaW5kZXhlcygpO1xufSk7XG4iXX0=
