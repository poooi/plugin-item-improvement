import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap'

import { EquipView } from './equip-view'
import { AddNewEquipView } from './add-new-equip-view'
import { getIconId } from './equiptype'
import { isEquipMasterEqual } from './utils'

// props:
// - $equips
// - equipLevels
// - equipMstIds
// - plans
// - viewMode
class EquipListView extends Component {
  static propTypes = {
    viewMode: PropTypes.bool.isRequired,
    $equips: PropTypes.object.isRequired,
    plans: PropTypes.object.isRequired,
    equipMstIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return this.props.viewMode !== nextProps.viewMode ||
      ! _.isEqual(this.props.equipMstIds, nextProps.equipMstIds ) ||
      ! _.isEqual(this.props.plans, nextProps.plans) ||
      ! isEquipMasterEqual( this.props.$equips, nextProps.$equips )
  }

  render() {
    // equipment list for those that has plans.
    const equipList = []
    // equipment list for those that doesn't have plans
    const equipListNoPlan = []
    const $equips = this.props.$equips

    this.props.equipMstIds.map( mstId => {
      const plans = this.props.plans[mstId]
      const $equip = $equips[mstId]
      const name = $equip.api_name
      const iconId = getIconId( $equip )

      if (plans) {
        equipList.push( {mstId, name, iconId, plans } )
      } else {
        equipListNoPlan.push( {mstId, name, iconId} )
      }
    })

    return (
      <ListGroup style={{marginBottom: '0'}}>
        {
          equipList.map( args => (
            <ListGroupItem
                style={{padding: '0'}}
                key={args.mstId}>
              <div>
                <EquipView
                    viewMode={this.props.viewMode}
                    { ... args } />
              </div>
            </ListGroupItem>)
          )
        }
        {
          !this.props.viewMode && equipListNoPlan.length > 0 && (
            <ListGroupItem
                style={{padding: '0'}}
                key="noplan">
              <div>
                <AddNewEquipView equips={equipListNoPlan} />
              </div>
            </ListGroupItem>)
        }
      </ListGroup>
    )
  }
}

export {
  EquipListView,
}
