#!/usr/bin/env node

// Test script for ReadyMedia Realtime backend
// Usage: node test-server.js

const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

console.log('🧪 ReadyMedia Realtime - Server Test\n');
console.log(`Testing server at: ${SERVER_URL}\n`);

// Test 1: Health check
async function testHealthCheck() {
    return new Promise((resolve) => {
        console.log('Test 1: Health Check');
        
        http.get(`${SERVER_URL}/api/health`, (res) => {
            let data = '';
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    
                    if (res.statusCode === 200 && json.status === 'ok') {
                        console.log('✅ Health check passed');
                        console.log(`   Status: ${json.status}`);
                        console.log(`   Timestamp: ${json.timestamp}\n`);
                        resolve(true);
                    } else {
                        console.log('❌ Health check failed');
                        console.log(`   Status code: ${res.statusCode}`);
                        console.log(`   Response: ${data}\n`);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ Health check failed - Invalid JSON');
                    console.log(`   Error: ${error.message}\n`);
                    resolve(false);
                }
            });
        }).on('error', (error) => {
            console.log('❌ Health check failed - Connection error');
            console.log(`   Error: ${error.message}\n`);
            resolve(false);
        });
    });
}

// Test 2: Token generation
async function testTokenGeneration() {
    return new Promise((resolve) => {
        console.log('Test 2: Token Generation');
        
        const postData = '';
        
        const options = {
            hostname: new URL(SERVER_URL).hostname,
            port: new URL(SERVER_URL).port || 80,
            path: '/api/scribe-token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    
                    if (res.statusCode === 200 && json.token) {
                        console.log('✅ Token generation passed');
                        console.log(`   Token: ${json.token.substring(0, 20)}...`);
                        console.log(`   Expires: ${json.expiresAt}\n`);
                        resolve(true);
                    } else {
                        console.log('❌ Token generation failed');
                        console.log(`   Status code: ${res.statusCode}`);
                        console.log(`   Response: ${data}\n`);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ Token generation failed - Invalid JSON');
                    console.log(`   Error: ${error.message}`);
                    console.log(`   Response: ${data}\n`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Token generation failed - Connection error');
            console.log(`   Error: ${error.message}\n`);
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

// Test 3: Static files
async function testStaticFiles() {
    return new Promise((resolve) => {
        console.log('Test 3: Static Files (Frontend)');
        
        http.get(`${SERVER_URL}/`, (res) => {
            let data = '';
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 && data.includes('ReadyMedia Realtime')) {
                    console.log('✅ Static files served correctly');
                    console.log(`   Status code: ${res.statusCode}`);
                    console.log(`   Content includes: "ReadyMedia Realtime"\n`);
                    resolve(true);
                } else {
                    console.log('❌ Static files test failed');
                    console.log(`   Status code: ${res.statusCode}`);
                    console.log(`   Content length: ${data.length} bytes\n`);
                    resolve(false);
                }
            });
        }).on('error', (error) => {
            console.log('❌ Static files test failed - Connection error');
            console.log(`   Error: ${error.message}\n`);
            resolve(false);
        });
    });
}

// Run all tests
async function runTests() {
    const results = [];
    
    results.push(await testHealthCheck());
    results.push(await testTokenGeneration());
    results.push(await testStaticFiles());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('━'.repeat(50));
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed\n`);
    
    if (passed === total) {
        console.log('✅ All tests passed! Server is ready.\n');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed. Check configuration.\n');
        console.log('Common issues:');
        console.log('  - Server not running (run: npm start)');
        console.log('  - Wrong port or URL');
        console.log('  - Missing ELEVENLABS_API_KEY in .env');
        console.log('  - Firewall blocking connections\n');
        process.exit(1);
    }
}

runTests();
