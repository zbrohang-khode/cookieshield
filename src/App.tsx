/**
 * CookieShield Vault - Main Application Component
 */
import React, { useState, useEffect } from 'react';
import { VaultEntry, createVaultEntry, parseJsonFormat } from './utils/cookieUtils';
import { encryptData, decryptData, hashPassword } from './utils/crypto';
import { Navbar } from './components/Navbar';
import { CookieTable } from './components/CookieTable';
import { LockModal } from './components/LockModal';
import { ImportModal } from './components/ImportModal';
import { InspectorModal } from './components/InspectorModal';
import { CurlModal } from './components/CurlModal';
import { AuditPanel } from './components/AuditPanel';
import { ExportModal } from './components/ExportModal';

const STORAGE_KEY = 'cookieshield_vault_v2';
const HASH_KEY = 'cookieshield_hash_v1';

const CHATGPT_COOKIES_JSON = [
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1826731321.330218,
    "hostOnly": false,
    "httpOnly": false,
    "name": "oai-did",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "585ecf68-84bd-4265-ab21-d4372b335f77"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1826731321.330338,
    "hostOnly": false,
    "httpOnly": true,
    "name": "oai-did-first-seen",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "v1.585ecf68-84bd-4265-ab21-d4372b335f77.1795195322"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1795800121.33039,
    "hostOnly": false,
    "httpOnly": true,
    "name": "oai-mweb-route",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "1"
  },
  {
    "domain": ".chatgpt.com",
    "hostOnly": false,
    "httpOnly": false,
    "name": "oai-mweb-origin",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "1"
  },
  {
    "domain": ".chatgpt.com",
    "hostOnly": false,
    "httpOnly": true,
    "name": "_cfuvid",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "V2oXLcgWjMUIvi6bsOzNE9SSBglLsdx0GUnJHKSktB0-1795195322.4680803-1.0.1.1-5FtYSzLFs0V6soZENu81ieOH7VQYwZ5gqzRNR5V_HNo"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1795198922.225017,
    "hostOnly": true,
    "httpOnly": true,
    "name": "__cflb",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "0H28vzvP5FJafnkHxj4ZHCmHqxQrvXuRiE36cxFtKmd"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1810747322,
    "hostOnly": true,
    "httpOnly": false,
    "name": "g_state",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "{\"i_l\":0,\"i_ll\":1795195322626,\"i_b\":\"WzE3/uyDL4gGoI6tzFbflwLPpJGoZdI90FM80t1rCPU\",\"i_e\":{\"enable_itp_optimization\":24},\"i_et\":1795195322626}"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1795196227.837253,
    "hostOnly": false,
    "httpOnly": true,
    "name": "oai-mweb-auth-pending",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "c42542fb-f3e2-4ef7-b7ee-26dd48f3ad78.l.JQHgpoHMktwG9MtoUeMsUI1BOe905n_9zDAGAsGHEy8"
  },
  {
    "domain": "chatgpt.com",
    "hostOnly": true,
    "httpOnly": true,
    "name": "__Host-next-auth.csrf-token",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "57f0ee9b504e05cf5e5b80cfab20a3baa49fe10f7a89609c098100708df3a918%7Cdbe67c2a095cb19da02efb71360fc48329d903dc208ff487d13be6f7e8787248"
  },
  {
    "domain": "chatgpt.com",
    "hostOnly": true,
    "httpOnly": true,
    "name": "__Secure-next-auth.callback-url",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "https%3A%2F%2Fchatgpt.com%2F"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1802971493.328043,
    "hostOnly": true,
    "httpOnly": false,
    "name": "_account",
    "path": "/",
    "sameSite": "lax",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "personal"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1802971493.328111,
    "hostOnly": true,
    "httpOnly": false,
    "name": "_account_is_fedramp",
    "path": "/",
    "sameSite": "lax",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "false"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1802971495.032076,
    "hostOnly": false,
    "httpOnly": false,
    "name": "oai-client-session-epoch",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "b6cc7f02-aa25-4511-bcd8-a4f2a107e059"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1826299495.031333,
    "hostOnly": true,
    "httpOnly": false,
    "name": "oai-hlib",
    "path": "/",
    "sameSite": "lax",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "true"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1802971495.031489,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-next-auth.session-token.0",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..21NsTDVMaTHxbglF._96OeyoPEhuwjVy2KQtJRYqqya4yjbrDWLEC174AcmMnx5aSWL-3AcZgBE11_pfvlqpM091GHTjWmaxTJIGmDV_jvhnGacIAF1TzJzavHPpPCPvlTegTLNDKW4bNJtyGqEZioiBVN2jzVLUHKnUWJDp1Fr0rirdx5b-yiojemOm9xLkvVT49zuyk86qkFkvlENwF0Hzh6H5wBf2ZnaNXbpcE7AoRr2upKwz9-nkF3RyaRw-WE_rahRbjKCPYIuAxrNhUAtZkGw4sZpf8Vxop8H6Z5STTG8fYgDgHtjDrb3MtrmTKB8k1zoz3cuk4cVLd1ot1i_8T4kcXZjPaIVPWqo7kYUcZwFPM-UaDvclbIvw74JttgLs25hNMRIelzHVuXYtianVxAGNDX0eQugK8vvbTQTIG4sPzPZeCzaR5yOxTKJqZyVEicXBBn2DJ_Y1_noWri3UeCZOagqQCM8Pp92EDNcnAKV08jMBBxh2HwMdV42gzY84Wth4m55mMEfCDrn_1znIvIhln7ej5KVccz0_Mu6lFs-ulNKneLWCCrdXiiI0COw6urzXW2IYEQTJWQEhyJJKZ0ssSdRz7kQneHG6yFyjMFMAI0bKBj-3FttYkDYPWKcOk2oDIEjimYE8fpNlJBe8rqWUzDyW6CGRr5IURo7AJUzxZkfIvKfNANgIWM9asMNyzNCCoLRpOt20NqDxuv8wc1x_rRZtbYOk9FUkNIeun4G9RylHi2YFV1zxmu6pTM7bW7Q1GtqsygdI3cVK975bR7vwi-AhRJwAvO3ow4yBJWByKIDyFt5nU62APrUw8567Dn72eO2mkO_Wisv4msGPMmpZHYaIe_t-p-YsnSPdlVU5reZmVjwWW5lZArT9Jj8a6a8mVuO8ooBP4Etii4dgV3X4E5nhVzR9G5vPXly7NHs2yUiiRpAL1jjH-jursE8EF4gK71c2P19p85QM7XzpSkmMgV5yd8P0nCi_W-uR6ngA2jXT8_1HsNrCNe32Yn0dgfDJ-xV4bsOjatXhXSMk9V8BjSmggRRld5__rWLdQq0VIiS-DHshg_wvADeBe5gen_kj7eEVT4Faz4QYDaQvha9wqMQqmOJxJhT46QCLlH98H1GI5dOHXF_nqdVVdRPM0p2PYIaaJa2-YYMCUARTwjoV5EE3LbrEhxM4DDIDYSe6MsgkNvK7ZpOVAOjPNiWhDMXX6ZjI_RjDP0iiofGXB2fQYIG9vJuJOOGnBL2hL0-qo06ViaU6NG7qpeViKG2GfZkvKDNsSn1xjfe6UxQWf1Om3IBLQ8NYiTqbRwi_MNIYEDVyqYrYrFmeSymT8kEt6R-9ypvJbE_9VqYeVo0TE7543X0DkeB_PhC47fGevze9YimRc34C3NJ3Qjmy0GNFJJbtxEJPVzzIQLsw0mAo_79I8m6Bpea8lkRmWTnyXD9CCd-o_iEachsnyVtJAMvLoj4-3Ctnw0nza7P-0rgLK7f0uaqp_T430f21iTdSHiBaCATB-8eiTcw20RQli4mmgKNjVj1Pw88N9IbfYAEGQpqC6QqhpmHDsvOdAPfKslsrb9MOhmqiDNuUhSVhB5iHO0rhpos7mxJ3c0wdFn0WD7sOMuCRyf9OydUvH9dneVBLEO5EHqMEOgtJC1ukoeEC4LEQBgMsNfwh4Y0WoSOtqajg8xYdX11T-yQM_Gdac1lWkCf82GfdsQ1QzHyx9qBqiQwfgIH8UKmHEdQW_jMPzSG1_7qEZxLWBdt-x3Bs9d6_drxMWH2CaTXxak7Vyg24hj0bpFBDAkfl9mzWJEuhK4EZsyU2NKqoVpR_K2F_RlxGao_0gnH-ZiWAAKDSo_qaEDUrzxe-TUmUn7iOZOlTePaLANFl3pw_SMhADSf8WTKZw6qu7kl9lMUr7XIwfXE7cIy6T4pcvPcRTcifoJzmuofvY-A1GdbcCqXcOdd189DT6AzUFbJGLBhd5uSmjHWx4t97zoKFjMv4I5WPj8AtojQeLg0vAnILhxZ9-CKaMwS1DgRlHnK5ZQ5CCaiuRJhYY6KWJQ2xAgj3mgnSIaoy-qE4X1qDkFTxrbDA-BPHL4wrZzDeiWf4pb7AiFnMZHBVyZSk-yiRe5Ts39SPFFRnMGdKIR8GG09sFLLX5qZRfNdmlOV5uD6SBKewcNIpLYyA0J2RJ-A-pnFGc42UoLKvU213sAjM6z2RjGQFM1LZR-3D_VZdr_SnLeyk7Ga7V13CmE_NSvbhWzXRY189yO2WUxb0u_7KEiUTUQSbUe81KKJHGxibhMdOKb3sq0qgkS71sx4DlVFtByUZ66dkM8gDtI52eCOQZb_kYkeww9Zg8mKbnpFujuaTcBfzRTJfbk2YeTvwEbLp-Rtf8GCnpQRgptTXHRffP3qPIPTztTSKyPkooX89zBvtfHp5_tV9IMgNDdJNUA5MqLTDZ6gxQfTPP8_gbxeUXNJVli1j6ApJZOzOV2G72L9tLd8cC0dJ5gBRA25W7TRbjUFl6KvrJpi8VOL6cbf_v0kEmGmQUOfpzapFOxMJZaFbhOKjH8OkDpmD5gOpW6mDtcFOZyz7vwtQoO4F1VINNcIhebfDhEWfAFKNV49I4Hm7U87BibxjbU6NpYwS2QyD09bWuPff9AVAN0QA4kJDeotJ12rr2yrjGKtY9EY7S9BHIRZEcrk1zhDckdrMFvqwL9Xw9Xb8zKEBoMX1gYwGLw2BR4W52DU9jwEnGqjblcUoE7rA0AB5WpmiAXSnkuofRt2bMXYhqNLlAeHpPo04JvGZBlGyLJKD5RylmHkvYURjvnZ2OBZkccruKYN2ubocU9uvON-HaiHlLs2Q9aYsihKCvehGDRa7QBwegOzLYXGJ-zPUULSiPPV8kxVUqIbVARSJKYwL8XPXiCHavmE5zOcwuxdTwaoXEtXKl4OXa-3YBuv_0CaGavLhlvP4Gii4Cf39Qnphksk83YAJojdr8UHJg8rjN2OavHjgmasYi3ZlZWfJ7QUgKTMXqKRQ8FUNlaM8Db8vmt1Ex6Cc3hpxlFGlMxpmty17uWGiD7AMzPi2bsUYZn_r9a4RY4j2mgklDc0uPVSR4rlfSmiawXqG9obJc04CYr8Yw_bcFVHiFZR1QO9Hrr5TpfcJUuZMyeXcFiRSewKXrqPQjIT2Rtk_JVXWDRzKMa2vSz1p3YsPJTl50kA2VkylWwf2eRaxyHfHT0UTVKUhjL_q5p4t8hSu5emwhnB6J87D5EkbwiswcH9-NJ2iEGfyjsom4j80PCwbbrpy40LG78AjYWc7lYDEcUwhY9O2zr3TJBSyehr0lPbPuVCS5LH7-88Z1NAvWYDE8kZCnHOMVsVkuGUYvXa238Y--ZS8QfZkO93MDwJFOyFu-5dsZIKCfY0_vpIaRWCPvaOot3uK7AB51H6c2k7c7n_Pawvi2RCnnmVBDPsWapf4RyGJ-ymXZWsQqtRG_myWaLOwDa5kHbdqU9kujXPzBTGeyA5HER-VlqEQh8W-_bAux5XIQDm2ExDvda8ESQzgYfN2ZLXej91ZHFKj-ZcJfqR5gRDQYzI9e71m6mf2bRnAVvAoPU7wnL6JIEk7hlB77UqmKsxGWtNDjeODMt3k2D9QVQcz6x3TmUe4hZq_7sdvLkCflNGOmC4cEkBJDtyiLlO4Fid47igyFuZlEJ76we99DYk0CaJprI3oxvSRhd9Sq_Qug8RmayDUl4y7HwNKl9dxmxVK8FB72oAiB2OSls52BxzHsoQl1pBav4-U1AURe302n2I3tDpS9DPSy5VvxQRNynA3F83OoetxfRQfffuCFKQVHRuE1Uc-FdHzM47_PpB7ozO9t0XsnKevb99FTT9uIph-Y6QmpMT7qzNBq6xAqzxe3qcBxFheBq29"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1802971495.031837,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-next-auth.session-token.1",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "9OfnwXdZFC5S_8HL1mZx0oFvuD-X7wcd9-2aajl8iR_cSFEmfS3n3hED-2cEOcTyA_8UMFBeegOknobfxLu-U-h7ffrV92_62aUdKa2ExXk25AJWZeUXjkQi54G-huljvXLOsGBWtLsp8xwGAFo0Dzd2OfbrMwLPZcUtWzlStOno.INc9vB2D7-ccyi9FZIwNlA"
  },
  {
    "domain": "chatgpt.com",
    "hostOnly": true,
    "httpOnly": false,
    "name": "oai_pl_permission_state",
    "path": "/",
    "sameSite": "lax",
    "secure": false,
    "session": true,
    "storeId": "0",
    "value": "not_set"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1826731497.399609,
    "hostOnly": false,
    "httpOnly": false,
    "name": "__obi",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "3RRJD959APHEPZ-ulnfTzg"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1829755500.547201,
    "hostOnly": true,
    "httpOnly": false,
    "name": "oai-tpp-onboarding-completed-at",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "%7B%22userId%22%3A%22user-GEqsT5xTJhFruibWWpibKK4F%22%2C%22completedAt%22%3A%222026-11-20T17%3A24%3A50.000Z%22%7D"
  },
  {
    "domain": ".chatgpt.com",
    "expirationDate": 1826731497.743582,
    "hostOnly": false,
    "httpOnly": false,
    "name": "oai-sc",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "0gAAAAABrAIJrVrZ5lu9QeLdSypsfwBbMLtI1XQn7_e4ePSZ7m7qwYGVEXe7VLoiCVOxDnGli9ub5LRhEOziGXayXgype-iQqG5PDSzaTUgACuKofhuRQZ5QNUmU0OgUj0Y0mCie5X7nVcMF5Xk0eTlRLNdL02hGrBV9ORi_5aSGjvsmRkUxzSR64nJzi_3iTx5YE--yXlHB8oPeSF5A_dEy7i9Qy_zgmCNJKZTH2tWhQQ9BJjs1gS3U"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1795196400.546815,
    "hostOnly": true,
    "httpOnly": false,
    "name": "oai-home-onboarding-viewed",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "user-GEqsT5xTJhFruibWWpibKK4F%3A58956c3a-a7a9-4193-a5dc-15588472e2f0"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1826731499.178755,
    "hostOnly": true,
    "httpOnly": false,
    "name": "codex_sidebar_width",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "340"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1795199099.600539,
    "hostOnly": true,
    "httpOnly": true,
    "name": "__oailb",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "eyJhbGciOiJFUzI1NiIsImtpZCI6Im9haWxiLXYxIiwidHlwIjoiSldUIn0.eyJob3N0IjoiY2hhdC5nYXRld2F5LnVuaWZpZWQtOTQuYXBpLm9wZW5haS5jb20iLCJpc3MiOiJlZGdlLWdhdGV3YXkiLCJhdWQiOlsiY2hhdGdwdC5jb20iXSwiZXhwIjoxNzk1MTk5NDAwLCJpYXQiOjE3OTUxOTU1MDB9.X7YFdxhoO1hhHtfECMu1-mWbaejQ1YbZQQEgVKGCGOmldJ1WbZ2M2yVabfzTwNlHGWYxU-FEpvHtgK0dTUD2FA"
  },
  {
    "domain": "chatgpt.com",
    "expirationDate": 1826731557.438,
    "hostOnly": true,
    "httpOnly": false,
    "name": "_dd_s_v2",
    "path": "/",
    "sameSite": "strict",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "aid=432efc2e-d5a7-40c2-b162-bb0b46dffc09&id=3eb5d20c-63b0-4baf-b833-82d6d9c46e1d&created=1795195495642&expire=1795196457438&c=0"
  }
];

const INITIAL_ENTRIES: VaultEntry[] = [
  createVaultEntry('ChatGPT Account (chatgpt.com)', parseJsonFormat(JSON.stringify(CHATGPT_COOKIES_JSON)))
];

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'vault' | 'import' | 'audit' | 'curl' | 'export'>('vault');

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [inspectingEntry, setInspectingEntry] = useState<VaultEntry | null>(null);
  const [exportSelectedIds, setExportSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const existingHash = localStorage.getItem(HASH_KEY);
    if (!existingHash) {
      setIsFirstSetup(true);
    } else {
      setIsFirstSetup(false);
    }
  }, []);

  const handleSetupPassword = async (password: string) => {
    const hash = await hashPassword(password);
    const encrypted = await encryptData(password, JSON.stringify(INITIAL_ENTRIES));
    localStorage.setItem(HASH_KEY, hash);
    localStorage.setItem(STORAGE_KEY, encrypted);
    setMasterPassword(password);
    setEntries(INITIAL_ENTRIES);
    setIsLocked(false);
  };

  const handleUnlockVault = async (password: string): Promise<boolean> => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) {
        setEntries(INITIAL_ENTRIES);
        setMasterPassword(password);
        setIsLocked(false);
        return true;
      }

      const decryptedStr = await decryptData(password, encrypted);
      const parsed = JSON.parse(decryptedStr);
      setEntries(parsed);
      setMasterPassword(password);
      setIsLocked(false);
      return true;
    } catch (e) {
      console.error('Unlock failed:', e);
      return false;
    }
  };

  const saveVault = async (updatedEntries: VaultEntry[], pwd = masterPassword) => {
    setEntries(updatedEntries);
    if (pwd) {
      try {
        const encrypted = await encryptData(pwd, JSON.stringify(updatedEntries));
        localStorage.setItem(STORAGE_KEY, encrypted);
      } catch (e) {
        console.error('Failed to encrypt vault storage:', e);
      }
    }
  };

  const handleLock = () => {
    setMasterPassword('');
    setIsLocked(true);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    saveVault(updated);
  };

  const handleBulkDelete = (ids: string[]) => {
    const updated = entries.filter(e => !ids.includes(e.id));
    saveVault(updated);
  };

  const handleImportEntry = (newEntry: VaultEntry) => {
    const updated = [newEntry, ...entries];
    saveVault(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {isLocked ? (
        <LockModal
          isFirstSetup={isFirstSetup}
          onUnlock={handleUnlockVault}
          onSetup={handleSetupPassword}
        />
      ) : (
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLock={handleLock}
            cookieCount={entries.reduce((acc, e) => acc + e.cookies.length, 0)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
            {activeTab === 'vault' && (
              <CookieTable
                entries={entries}
                onDelete={handleDeleteEntry}
                onBulkDelete={handleBulkDelete}
                onAddClick={() => setShowImportModal(true)}
                onInspect={entry => setInspectingEntry(entry)}
                onExportSelected={ids => {
                  setExportSelectedIds(ids);
                  setActiveTab('export');
                }}
              />
            )}

            {activeTab === 'import' && (
              <div className="max-w-2xl mx-auto">
                <ImportModal
                  onImport={entry => {
                    handleImportEntry(entry);
                    setActiveTab('vault');
                  }}
                  onClose={() => setActiveTab('vault')}
                />
              </div>
            )}

            {activeTab === 'audit' && <AuditPanel entries={entries} />}

            {activeTab === 'curl' && <CurlModal entries={entries} />}

            {activeTab === 'export' && (
              <ExportModal
                entries={entries}
                selectedIds={exportSelectedIds}
              />
            )}
          </main>

          {/* Modals */}
          {showImportModal && (
            <ImportModal
              onImport={entry => {
                handleImportEntry(entry);
                setShowImportModal(false);
              }}
              onClose={() => setShowImportModal(false)}
            />
          )}

          {inspectingEntry && (
            <InspectorModal
              entry={inspectingEntry}
              onClose={() => setInspectingEntry(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
