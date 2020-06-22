import { observable, action, computed } from "mobx";
import { flatten } from "lodash";
import { TDashboard, Dashboard } from "./models/Dashboard";

class Store {
  @observable currentDashboard: TDashboard = new Dashboard();
  @observable d2: any;
  @observable userOrgUnits: any = [];
  @observable selectedOrgUnit: any;
  @observable isLight: boolean = false;
  @observable refreshRate = 20000;

  @action setD2 = async (d2: any) => (this.d2 = d2);
  @action setIsLight = (val: boolean) => this.isLight = val;
  

  @action
  loadUserOrgUnits = async () => {
    try {
      const data = await this.d2.currentUser.getOrganisationUnits({
        paging: false,
        fields: `id,path,name,level,leaf,displayShortName~rename(displayName),children::isNotEmpty`,
      });
      this.userOrgUnits = data.toArray();
      this.selectedOrgUnit = this.userOrgUnits[0].id;
    } catch (e) {
      console.log(e);
    }
  };

  @action
  loadOrganisationUnitsChildren = async (parent: string) => {
    try {
      const api = this.d2.Api.getApi();
      const { organisationUnits } = await api.get("organisationUnits.json", {
        filter: `id:in:[${parent}]`,
        paging: "false",
        fields: "children[id,name,path,leaf]",
      });
      const found = organisationUnits.map((unit: any) => {
        return unit.children.map((child: any) => {
          return { ...child, pId: parent };
        });
      });
      const all = flatten(found);
      this.userOrgUnits = [...this.userOrgUnits, ...all];
    } catch (e) {
      console.log(e);
    }
  };

  @action setSelectedOrgUnit = (val: any) => {
    this.selectedOrgUnit = val;
  };

  @action createDashboard = () => {
    const dashboard = new Dashboard();
    dashboard.setD2(this.d2);
    this.currentDashboard = dashboard;
  };

  @computed
  get organisationUnits() {
    const units = this.userOrgUnits.map((unit: any) => {
      return {
        id: unit.id,
        pId: unit.pId || "",
        value: unit.id,
        title: unit.name,
        isLeaf: unit.leaf,
      };
    });
    return units;
  }

  @computed get currentBackgrounds() {
    if (!this.isLight) {
      return {
        background: '#1A223A',
        cardBG: '#272E48',
        header: 'tab-header-black',
        indicatorLabel: '#bdd1f8',

      }
    }

    return {
      background: '',
      cardBG: '#F4F4F4',
      header: 'tab-header',
    }
  }
}

export const store = new Store();
