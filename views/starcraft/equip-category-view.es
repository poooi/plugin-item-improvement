import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { SlotitemIcon } from 'views/components/etc/icon'
import FontAwesome from 'react-fontawesome'
import {
  Button,
  Collapse,
} from 'react-bootstrap'
import _ from 'lodash'

import { EquipListView } from './equip-list-view'
import { isEquipMasterEqual } from './utils'

// props:
// - $equips
// - catInfo
// - collapsed
// - equipLevels
// - equipType
// - onToggle
// - plans
// - viewMode
class EquipCategoryView extends Component {
  static propTypes = {
    $equips: PropTypes.object.isRequired,
    collapsed: PropTypes.bool.isRequired,
    viewMode: PropTypes.bool.isRequired,
    catInfo: PropTypes.shape({
      group: PropTypes.arrayOf(PropTypes.number).isRequired,
      icons: PropTypes.arrayOf(PropTypes.number).isRequired,
    }).isRequired,
    plans: PropTypes.object.isRequired,
    equipType: PropTypes.shape({
      api_id: PropTypes.number.isRequired,
      api_name: PropTypes.string.isRequired,
    }).isRequired,
    onToggle: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    // skipping "catInfo" as it's generated from $equips
    return this.props.collapsed !== nextProps.collapsed ||
      this.props.viewMode !== nextProps.viewMode ||
      ! _.isEqual(this.props.equipType, nextProps.equipType) ||
      ! _.isEqual(this.props.plans, nextProps.plans) ||
      ! isEquipMasterEqual( this.props.$equips, nextProps.$equips )
  }
  render() {
    const et = this.props.equipType
    const ci = this.props.catInfo
    const {$equips, collapsed} = this.props
    const hasPlan = ci.group.some( mstId => this.props.plans[mstId])

    // for view mode, no need of showing anything .. if there's nothing to show...
    if (this.props.viewMode && (collapsed || ! hasPlan)) {
      return null
    }

    return (
      <div>
        <Button
            onClick={this.props.onToggle}
            style={{
              width: '100%',
              margin: '2px',
              display: 'flex', alignItems: 'center',
            }} >
          { !this.props.viewMode &&
            (<FontAwesome
                 className="eqcat-collapse-toggle"
                 style={{marginRight: '10px'}}
                 name={collapsed ? 'chevron-right' : 'chevron-down'}
             />)
          }
          <div
              style={{flex: '1', textAlign: 'left'}}
              key="name">{et.api_name}</div>
          <div>
            {
              ci.icons.map( iconId =>
                <SlotitemIcon
                    key={iconId}
                    slotitemId={iconId} className="equip-icon" />)
            }
          </div>
        </Button>
        <Collapse timeout={100} in={!collapsed}>
          <div
              style={{paddingLeft: '20px'}}
          >
            <EquipListView
                viewMode={this.props.viewMode}
                plans={this.props.plans}
                equipMstIds={this.props.catInfo.group}
                $equips={$equips}
            />
          </div>
        </Collapse>
      </div>)
  }
}

export {
  EquipCategoryView,
}
