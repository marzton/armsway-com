import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) { if (specifier === 'cloudflare:email') return {url:'data:text/javascript,export class EmailMessage { constructor(from,to,raw){this.from=from;this.to=to;this.raw=raw;} }',shortCircuit:true}; return nextResolve(specifier,context); } });
const {default:worker}=await import('../src/index.ts');

test('intake fails before writes when delivery is unconfigured',async()=>{
 let writes=0; const env={AUDIT_DB:{prepare(){writes++;throw Error('must not write')}},INQUIRY_QUEUE:{send:async()=>{}}};
 const r=await worker.fetch(new Request('https://armsway.com/api/contact',{method:'POST',body:new FormData()}),env,{});
 assert.equal(r.status,503);assert.equal(writes,0);
});
test('queue retries rather than discarding mail when binding is missing',async()=>{
 let retries=0; await worker.queue({messages:[{body:{name:'Test'},retry(){retries++}}]}, {}, {});assert.equal(retries,1);
});
test('configured queue delivers a message',async()=>{
 const sent=[];let retries=0; await worker.queue({messages:[{body:{name:'Test',email:'test@example.com',message:'hello'},retry(){retries++}}]}, {SEND_EMAIL:{send:async m=>sent.push(m)},CONTACT_TO_EMAIL:'rob@armsway.com'},{}); assert.equal(sent.length,1); assert.equal(sent[0].to,'rob@armsway.com');assert.equal(retries,0);
});
test('delivery failure retries the inquiry',async()=>{
 let retries=0;await worker.queue({messages:[{body:{name:'Test'},retry(){retries++}}]}, {SEND_EMAIL:{send:async()=>{throw Error('unavailable')}}},{});assert.equal(retries,1);
});


test('inquiry names cannot inject mail headers', async () => {
  const sent = [];
  await worker.queue({ messages: [{
    body: { name: 'Test\r\nBcc: attacker@example.com', email: 'test@example.com' },
    retry() { assert.fail('Delivery should not retry'); },
  }] }, { SEND_EMAIL: { send: async message => sent.push(message) } }, {});
  const headers = sent[0].raw.split('\r\n\r\n')[0];
  assert.doesNotMatch(headers, /\r\nBcc:/);
  assert.match(headers, /Subject: =\?UTF-8\?B\?/);
});
