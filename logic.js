/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/

/**
 *
 * @param {com.sentrifuge.MineralMovementDeparture} movementDeparture
 * @transaction
 */
function onMineralMovementDeparture(movementDeparture) {
    console.log('onMineralMovementDeparture');
    if (movementDeparture.mineral.movementStatus !== 'IN_FIELD') {
        throw new Error('Minerals are already IN_TRANSIT');
    }

     // set the movement status of the minerals
    movementDeparture.mineral.movementStatus = 'IN_TRANSIT';

     // save the animal
    return getAssetRegistry('com.sentrifuge.Minerals')
  .then(function(ar) {
      return ar.update(movementDeparture.mineral);
  })
  .then(function() {
    // add the Mineralores to the incoming mineral of the
    // destination business
      if (movementDeparture.to.incomingMinerals) {
          movementDeparture.to.incomingMinerals.push(movementDeparture.mineral);
      } else {
          movementDeparture.to.incomingMinerals = [movementDeparture.mineral];
      }

      // save the business
      return getAssetRegistry('com.sentrifuge.Business');
  })
  .then(function(br) {
      return br.update(movementDeparture.to);
  });
}

/**
 *
 * @param {com.sentrifuge.MineralMovementArrival} movementArrival
 * @transaction
 */
function MineralMovementArrival(mineralMovement) {
    console.log('MineralMovementArrival');

    if (movementArrival.mineral.movementStatus !== 'IN_TRANSIT') {
        throw new Error('Mineral is not IN_TRANSIT');
    }

     // set the movement status of the Mineralore
    movementArrival.mineral.movementStatus = 'IN_FIELD';

     // set the new owner of the Mineralore
     // to the owner of the 'to' business
    movementArrival.mineral.owner = movementArrival.to.owner;

     // set the new location of the MineralOre
    movementArrival.mineral.location = movementArrival.arrivalField;

     // save the MineralOre
    return getAssetRegistry('com.sentrifuge.Mineral')
  .then(function(ar) {
      return ar.update(movementArrival.mineral);
  })
  .then(function() {
    // remove the Mineral from the incoming Minerals
    // of the 'to' business
      if (!movementArrival.to.incomingMinerals) {
          throw new Error('Incoming business should have incomingMinerals on MineralMovementArrival.');
      }

      movementArrival.to.incomingMinerals = movementArrival.to.incomingMinerals
    .filter(function(mineral) {
        return mineral.BagID !== movementArrival.mineral.BagID;
    });

      // save the business
      return getAssetRegistry('com.sentrifuge.Business');
  })
  .then(function(br) {
      return br.update(movementArrival.to);
  });
}

/**
 *
 * @param {com.sentrifuge.SetupDemo} setupDemo
 * @transaction
 */
function setupDemo(setupDemo) {
    var mine = getmine();
    var NS = 'com.sentrifuge';

    var co_op = [
        mine.newResource(NS, 'co_op', 'CO_OP_1'),
        mine.newResource(NS, 'co_op', 'CO_OP_2')
    ];

    var businesses = [
        mine.newResource(NS, 'Business', 'BUSINESS_1'),
        mine.newResource(NS, 'Business', 'BUSINESS_2')
    ];

    var fields = [
        mine.newResource(NS, 'Field','FIELD_1'),
        mine.newResource(NS, 'Field','FIELD_2'),
        mine.newResource(NS, 'Field','FIELD_3'),
        mine.newResource(NS, 'Field','FIELD_4')
    ];

    var Mineral = [
        mine.newResource(NS, 'Mineral', 'MINERAL_1'),
        mine.newResource(NS, 'Mineral', 'MINERAL_2'),
        mine.newResource(NS, 'Mineral', 'MINERAL_3'),
        mine.newResource(NS, 'Mineral', 'MINERAL_4'),
        mine.newResource(NS, 'Mineral', 'MINERAL_5'),
        mine.newResource(NS, 'Mineral', 'MINERAL_6'),
        mine.newResource(NS, 'Mineral', 'MINERAL_7'),
        mine.newResource(NS, 'Mineral', 'MINERAL_8')
    ];
    return getParticipantRegistry(NS + '.comptoir')
  .then(function(comptoirRegistry) {
      var regulator = mine.newResource(NS, 'comptoir', 'COMPTOIR');
      comptoir.email = 'COMPTOIR@sentrifuge.com';
      comptoir.firstName = 'Ronnie';
      comptoir.lastName = 'Regulator';
      return comptoirRegistry.addAll([comptoir]);
  })
  .then(function() {
      return getParticipantRegistry(NS + '.co_op');
  })
  .then(function(co_opRegistry) {
      co_ops.forEach(function(co_op) {
          var MineralFieldID = 'BUSINESS_' + co_op.getIdentifier().split('_')[1];
          co_op.firstName = co_op.getIdentifier();
          co_op.lastName = '';
          co_op.address1 = 'Address1';
          co_op.address2 = 'Address2';
          co_op.county = 'County';
          co_op.postcode = 'PO57C0D3';
          co_op.business = mine.newResource(NS, 'Business', MineralFieldID);
      });
      return co_opRegistry.addAll(co_ops);
  })
  .then(function() {
      return getAssetRegistry(NS + '.Business');
  })
  .then(function(businessRegistry) {
      businesses.forEach(function(business, index) {
          var FieldID = 'FIELD_' + (index + 1);
          var co_op = 'CO_OP_' + (index + 1);
          business.address1 = 'Address1';
          business.address2 = 'Address2';
          business.county = 'County';
          business.postcode = 'PO57C0D3';
          business.owner = mine.newRelationship(NS, 'co_op', co_op);
      });

      return businessRegistry.addAll(businesses);
  })
  .then(function() {
      return getAssetRegistry(NS + '.Field');
  })
  .then(function(fieldRegistry) {
      fields.forEach(function(field, index) {
          var business = 'BUSINESS_' + ((index % 2) + 1);
          field.name = 'FIELD_' + (index + 1);
          field.business = factory.newRelationship(NS, 'Business', business);
      });
      return fieldRegistry.addAll(fields);
  })
  .then(function() {
      return getAssetRegistry(NS + '.Mineral');
  })
  .then(function(MineralRegistry) {
      Mineral.forEach(function(Mineral, index) {
          var field = 'FIELD_' + ((index % 2) + 1);
          var co_op = 'CO_OP' + ((index % 2) + 1);
          Mineral.ores = 'TIN_GOLD_COBALT_TANTALUM_TUNGSTEN';
          Mineral.movementStatus = 'IN_FIELD';
          Mineral.location = mine.newRelationship(NS, 'Field', field);
          Mineral.owner = mine.newRelationship(NS, 'Co_op', co_op);
      });
      return MineralRegistry.addAll(minerals);
  });
}

/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/
