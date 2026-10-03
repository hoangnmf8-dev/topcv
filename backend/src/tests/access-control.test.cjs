const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('../../../frontend/node_modules/typescript');
function load(file, dependencies, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, require: id => dependencies[id] ?? {}, ...globals });
  return exports;
}
test('backend rejects missing, malformed, invalid and inactive sessions', async () => {
  for (const [header, account] of [[undefined,null],['Basic token',null],['Bearer token',false],['Bearer token',{status:'blocked'}],['Bearer token',{status:'active',deletedAt:new Date()}]]) {
    const { authMiddleware } = load('src/middlewares/auth.middleware.ts', {'../services/account.service':{default:{getAccount:async()=>account}}});
    const res = {status(code){this.code=code;return this;},json(body){this.body=body;}};
    await authMiddleware({headers:{authorization:header}},res,()=>assert.fail('unauthenticated request passed'));
    assert.equal(res.code,401); assert.equal(res.body.message,'Đăng nhập để sử dụng tính năng này');
  }
});
test('backend role matrix allows only the selected role', () => {
  const { requireRoles } = load('src/middlewares/auth.middleware.ts', {});
  for (const allowed of ['admin','company','candidate']) for (const role of ['admin','company','candidate']) {
    let passed=false;
    const res={status(code){this.code=code;return this;},json(body){this.body=body;}};
    requireRoles(allowed)({profile:{role}},res,()=>{passed=true;});
    assert.equal(passed,allowed===role);
    if (!passed) {assert.equal(res.code,403);assert.equal(res.body.message,'Không có quyền truy cập');}
  }
});
test('frontend blocks guest and cross-role private routes before rendering', async () => {
  for (const role of [null,'candidate','company','admin']) for (const [path,allowed] of [['/candidate','candidate'],['/cv-builder','candidate'],['/messages','candidate'],['/employer/messages','company'],['/admin','admin']]) {
    const result = (kind,url) => ({kind,url,headers:{set(){}},cookies:{set(){}}});
    const { proxy } = load('../frontend/src/proxy.ts', {'next/server':{NextResponse:{next:()=>result('next'),rewrite:url=>result('rewrite',url),redirect:url=>result('redirect',url)}},'@/constants/ttl.constant':{TTL:{}}}, {URL,process:{env:{}},fetch:async()=>({ok:true,json:async()=>({success:true,data:{role}})})});
    const response=await proxy({nextUrl:{pathname:path},url:'http://localhost'+path,cookies:{get:name=>name==='accessToken'&&role?{value:'token'}:undefined}});
    assert.equal(response.kind,role===allowed?'next':'rewrite');
    if(role!==allowed) assert.equal(response.url.searchParams.get('reason'),role?'forbidden':'login');
  }
});

test('public candidate pages allow guests and candidates but reject company and admin sessions', async () => {
  const paths = ['/', '/jobs/example', '/companies', '/companies/example', '/career-guide', '/career-guide/example', '/services', '/discover/jobs-by-field', '/discover/cv-templates', '/discover/cv-by-role'];
  for (const role of [null, 'candidate', 'company', 'admin']) for (const path of paths) {
    const result = (kind, url) => ({kind, url, headers:{set(){}}, cookies:{set(){}}});
    const { proxy, config } = load('../frontend/src/proxy.ts', {'next/server':{NextResponse:{next:()=>result('next'),rewrite:url=>result('rewrite',url),redirect:url=>result('redirect',url)}},'@/constants/ttl.constant':{TTL:{}}}, {URL,process:{env:{}},fetch:async()=>({ok:true,json:async()=>({success:true,data:{role}})})});
    assert.ok(config.matcher.some(pattern => pattern === path || (pattern.endsWith('/:path*') && (path === pattern.slice(0,-7) || path.startsWith(pattern.slice(0,-7)+'/')))), `missing matcher for ${path}`);
    const response = await proxy({nextUrl:{pathname:path},url:'http://localhost'+path,cookies:{get:name=>name==='accessToken'&&role?{value:'token'}:undefined}});
    const allowed = !role || role === 'candidate';
    assert.equal(response.kind, allowed ? 'next' : 'rewrite');
    if (!allowed) {
      assert.equal(response.url.searchParams.get('reason'), 'forbidden');
      assert.equal(response.url.searchParams.get('home'), role === 'company' ? '/employer' : '/admin');
    }
  }
});
