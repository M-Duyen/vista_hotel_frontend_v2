import { birthdayVoucherApi } from "./apiClient";

export interface BirthdayVoucherConfigDTO {
  birthdayId?: string;
  voucherId: string;
  daysBeforeEvent: number;
  active: boolean;
}

export interface BirthdayVoucherConfigResponse {
  birthdayId?: string;
  voucher?: {
    voucherId?: string;
    voucherID?: string;
    voucherName?: string;
  };
  voucherId?: string;
  daysBeforeEvent?: number;
  active?: boolean;
  isActive?: boolean;
}

const mapBirthdayConfig = (
  data: BirthdayVoucherConfigResponse,
): BirthdayVoucherConfigDTO => ({
  birthdayId: data.birthdayId,
  voucherId: data.voucher?.voucherId ?? data.voucher?.voucherID ?? data.voucherId ?? "",
  daysBeforeEvent: Number(data.daysBeforeEvent ?? 0),
  active: Boolean(data.active ?? data.isActive ?? true),
});

export const getBirthdayVoucherConfig =
  async (): Promise<BirthdayVoucherConfigDTO | null> => {
    try {
      const response = await birthdayVoucherApi.get("", {
        validateStatus: (status) => status === 200 || status === 204,
      });

      if (response.status === 204 || !response.data) {
        return null;
      }

      const configs = Array.isArray(response.data) ? response.data : [response.data];
      if (configs.length === 0) {
        return null;
      }

      return mapBirthdayConfig(configs[configs.length - 1]);
    } catch (error) {
      console.error("Error fetching birthday voucher config:", error);
      throw error;
    }
  };

export const saveBirthdayVoucherConfig = async (
  config: BirthdayVoucherConfigDTO,
) => {
  try {
    const response = await birthdayVoucherApi.post("", config);
    return mapBirthdayConfig(response.data);
  } catch (error) {
    console.error("Error saving birthday voucher config:", error);
    throw error;
  }
};
