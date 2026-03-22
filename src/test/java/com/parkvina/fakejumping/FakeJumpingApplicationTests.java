package com.parkvina.fakejumping;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
//@SpringBootTest
class FakeJumpingApplicationTests {

    @Test
    void contextLoads() {
    }
    @Test
    void jasyptTest() {
        System.setProperty(
                "jasypt.encryptor.password",
                "FsEBTb5alQw84pUZy0bDBiO5sGrB/4hZqsS4e54bDFY="
        );
        StandardPBEStringEncryptor pbeEnc = new StandardPBEStringEncryptor();
        pbeEnc.setAlgorithm("PBEWithMD5AndDES");
        pbeEnc.setPassword("FsEBTb5alQw84pUZy0bDBiO5sGrB/4hZqsS4e54bDFY=");

        String clientId = pbeEnc.encrypt("yina");
        String password = pbeEnc.encrypt("mybabu8402!");

        System.out.println(clientId);
        System.out.println(password);
        System.out.println(
                pbeEnc.decrypt("viTVZIDOmtmG0i2rAPYrwzBBwogoQ/Qp")
        );
    }
    @Test

    void decryptTest() {
        StandardPBEStringEncryptor pbeEnc = new StandardPBEStringEncryptor();
        pbeEnc.setAlgorithm("PBEWithMD5AndDES");
        pbeEnc.setPassword("FsEBTb5alQw84pUZy0bDBiO5sGrB/4hZqsS4e54bDFY=");
        System.out.println(System.getenv("JASYPT_PASSWORD"));
        System.out.println(pbeEnc.decrypt("7QabS49YYQPVFlaZE40f3A=="));
        System.out.println(pbeEnc.decrypt("9H3nNIc53CpFNVLGTYGAZPx+J1jJL/41"));
    }


}
