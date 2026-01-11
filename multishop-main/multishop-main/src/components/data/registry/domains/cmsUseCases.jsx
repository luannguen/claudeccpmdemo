/**
 * CMS Domain Use Cases
 */

export const cmsUseCases = [
  {
    id: 'page.list',
    domain: 'cms',
    description: 'Danh sách tất cả trang (admin)',
    input: 'void',
    output: 'Result<PageDTO[]>',
    service: 'pageService.list',
    hook: 'useAdminPages',
    component: 'AdminPages'
  },
  {
    id: 'page.listPublished',
    domain: 'cms',
    description: 'Danh sách trang đã publish (client)',
    input: 'void',
    output: 'Result<PageDTO[]>',
    service: 'pageService.listPublished',
    hook: 'usePublishedPages',
    component: 'MenuPages'
  },
  {
    id: 'page.getBySlug',
    domain: 'cms',
    description: 'Lấy trang theo slug',
    input: 'string (slug)',
    output: 'Result<PageDTO>',
    service: 'pageService.getBySlug',
    hook: 'usePageBySlug',
    component: 'DynamicPage'
  },
  {
    id: 'page.create',
    domain: 'cms',
    description: 'Tạo trang mới',
    input: 'PageCreateDTO',
    output: 'Result<PageDTO>',
    service: 'pageService.create',
    hook: 'usePageMutations',
    component: 'PageFormModal'
  },
  {
    id: 'page.update',
    domain: 'cms',
    description: 'Cập nhật trang',
    input: 'PageUpdateDTO',
    output: 'Result<PageDTO>',
    service: 'pageService.update',
    hook: 'usePageMutations',
    component: 'PageFormModal'
  },
  {
    id: 'siteConfig.get',
    domain: 'cms',
    description: 'Lấy cấu hình website',
    input: 'void',
    output: 'Result<SiteConfigDTO>',
    service: 'siteConfigService.getMainConfig',
    hook: 'useSiteConfig',
    component: 'SiteConfigEditor'
  },
  {
    id: 'siteConfig.save',
    domain: 'cms',
    description: 'Lưu cấu hình website',
    input: 'SiteConfigDTO',
    output: 'Result<SiteConfigDTO>',
    service: 'siteConfigService.saveConfig',
    hook: 'useSiteConfigMutation',
    component: 'SiteConfigEditor'
  }
];