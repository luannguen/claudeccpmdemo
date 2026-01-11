/**
 * Product Version Repository
 * Data Layer - Version history management
 */

import { base44 } from "@/api/base44Client";
import { success, failure, ErrorCodes } from "@/components/data/types";

export const productVersionRepository = {
  /**
   * List versions của 1 product
   */
  list: async (productId, limit = 50) => {
    try {
      const versions = await base44.entities.ProductVersion.filter(
        { product_id: productId },
        '-created_date',
        limit
      );
      return success(versions);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get specific version
   */
  get: async (versionId) => {
    try {
      const versions = await base44.entities.ProductVersion.filter({ id: versionId });
      if (versions.length === 0) {
        return failure('Version không tồn tại', ErrorCodes.NOT_FOUND);
      }
      return success(versions[0]);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Save version snapshot
   */
  save: async (productId, snapshot, changedFields, changeSummary) => {
    try {
      const version = await base44.entities.ProductVersion.create({
        product_id: productId,
        version_number: snapshot.current_version || 1,
        snapshot,
        changed_fields: changedFields,
        change_summary: changeSummary,
        changed_by: snapshot.last_modified_by
      });
      return success(version);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Prune old versions (keep latest 50)
   */
  pruneOldVersions: async (productId) => {
    try {
      const result = await productVersionRepository.list(productId, 100);
      if (!result.success) return result;

      const versions = result.data;
      if (versions.length <= 50) {
        return success({ pruned: 0 });
      }

      // Delete oldest versions
      const toDelete = versions.slice(50);
      for (const version of toDelete) {
        await base44.entities.ProductVersion.delete(version.id);
      }

      return success({ pruned: toDelete.length });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};